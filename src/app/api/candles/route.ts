import { NextRequest, NextResponse } from "next/server";
import { normalizeSymbol } from "@/lib/charts/symbols";
import type { Candle, CandlesResponse, ChartRange } from "@/lib/charts/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/candles?symbol=NVDA&range=6mo
 *
 * OHLCV bars for the Charts section, from Yahoo Finance's v8 chart API,
 * the same source /api/historical already uses for PM Live's performance
 * chart. Yahoo covers everything the chart offers (US stocks, ETFs, ADRs
 * like FANUY, and crypto USD pairs like ETH-USD) with real OHLC + volume,
 * needs no API key, and has no per-symbol cost.
 * (Alpaca is quote-only in this codebase and CoinGecko's free OHLC has no
 * volume, so neither is a better fit for candles.)
 *
 * Each range is fetched with extra warm-up history before the window, so
 * SMA 200 and RSI are already valid at the left edge. The response says
 * where the window starts (`visibleFrom`) and the chart opens there.
 */

const YAHOO_UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const CHART = "https://query1.finance.yahoo.com/v8/finance/chart";

const DAY = 86_400;

/**
 * How each timeframe is fetched.
 *   interval  Yahoo bar size. Yahoo caps intraday history: 5m/15m/30m ≈ 60 days, 60m ≈ 730 days.
 *   fetchDays How far back to request (window + warm-up), in calendar days.
 *   cache     Edge cache seconds: intraday bars move, daily/weekly bars barely do.
 */
const RANGE_CONFIG: Record<ChartRange, { interval: string; fetchDays: number; intraday: boolean; cache: number }> = {
    "1d": { interval: "5m", fetchDays: 7, intraday: true, cache: 30 },
    "5d": { interval: "15m", fetchDays: 30, intraday: true, cache: 60 },
    "1mo": { interval: "30m", fetchDays: 59, intraday: true, cache: 120 },
    // Daily ranges: window + ~420 calendar days ≈ 290 trading days of warm-up (SMA 200 needs 200).
    "3mo": { interval: "1d", fetchDays: 92 + 420, intraday: false, cache: 300 },
    "6mo": { interval: "1d", fetchDays: 183 + 420, intraday: false, cache: 300 },
    "ytd": { interval: "1d", fetchDays: 366 + 420, intraday: false, cache: 300 },
    "1y": { interval: "1d", fetchDays: 366 + 420, intraday: false, cache: 300 },
    // Weekly: 5 years + ~4.5 years (≈ 235 weeks) of warm-up.
    "5y": { interval: "1wk", fetchDays: 365 * 9.5, intraday: false, cache: 900 },
};

interface YahooChart {
    meta?: {
        currency?: string;
        gmtoffset?: number;
        longName?: string;
        shortName?: string;
        instrumentType?: string;
    };
    timestamp?: number[];
    indicators?: {
        quote?: Array<{
            open?: (number | null)[];
            high?: (number | null)[];
            low?: (number | null)[];
            close?: (number | null)[];
            volume?: (number | null)[];
        }>;
    };
}

/** Calendar subtraction in UTC (months/years), used for 3M, 6M, 1Y, 5Y window starts. */
function shiftUtc(now: Date, { months = 0, years = 0 }: { months?: number; years?: number }): number {
    const d = new Date(now);
    d.setUTCFullYear(d.getUTCFullYear() - years, d.getUTCMonth() - months);
    return Math.floor(d.getTime() / 1000);
}

/**
 * Snap a daily/weekly bar to 00:00 UTC of its *exchange-local* date.
 * Yahoo stamps US daily bars at the 9:30 ET open and crypto bars at 00:00 UTC;
 * snapping gives both the same slot per day, so a compare overlay lines up.
 */
function toLocalDay(t: number, gmtoffset: number): number {
    return Math.floor((t + gmtoffset) / DAY) * DAY;
}

/**
 * Where the visible window starts, given the bars we got.
 *   1D / 5D: the start of the last 1 or 5 trading sessions (crypto: last 24h / 5 × 24h,
 *            since it has no sessions).
 *   1M..5Y:  a calendar offset from now; YTD is Dec 31 of last year, the same
 *            anchor the watchlists' YTD figures use (src/data/baselines.ts).
 */
function windowStart(range: ChartRange, candles: Candle[], gmtoffset: number, isCrypto: boolean): number {
    const now = new Date();
    const last = candles[candles.length - 1]?.time ?? Math.floor(now.getTime() / 1000);

    if (range === "1d" || range === "5d") {
        const sessions = range === "1d" ? 1 : 5;
        if (isCrypto) return last - sessions * DAY;
        // Walk back through distinct local dates until we've seen `sessions` of them.
        const dates: number[] = [];
        for (let i = candles.length - 1; i >= 0; i--) {
            const d = toLocalDay(candles[i].time, gmtoffset);
            if (dates[dates.length - 1] !== d) {
                if (dates.length === sessions) return candles[i + 1].time;
                dates.push(d);
            }
        }
        return candles[0]?.time ?? last;
    }

    switch (range) {
        case "1mo":
            return shiftUtc(now, { months: 1 });
        case "3mo":
            return shiftUtc(now, { months: 3 });
        case "6mo":
            return shiftUtc(now, { months: 6 });
        case "ytd":
            return Math.floor(Date.UTC(now.getUTCFullYear() - 1, 11, 31) / 1000);
        case "1y":
            return shiftUtc(now, { years: 1 });
        case "5y":
        default:
            return shiftUtc(now, { years: 5 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const symbol = normalizeSymbol(searchParams.get("symbol"));
    const range = (searchParams.get("range") || "6mo") as ChartRange;

    // Validate before anything reaches Yahoo: the symbol goes into a URL path.
    if (!symbol) {
        return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
    }
    const cfg = RANGE_CONFIG[range];
    if (!cfg) {
        return NextResponse.json({ error: "Invalid range" }, { status: 400 });
    }

    const period2 = Math.floor(Date.now() / 1000);
    const period1 = Math.floor(period2 - cfg.fetchDays * DAY);
    const url =
        `${CHART}/${encodeURIComponent(symbol)}` +
        `?period1=${period1}&period2=${period2}&interval=${cfg.interval}&includePrePost=false&events=div%2Csplits`;

    let chart: YahooChart | undefined;
    try {
        const res = await fetch(url, { headers: { "User-Agent": YAHOO_UA }, cache: "no-store" });
        // Yahoo answers unknown symbols with 404 + { chart: { error } }.
        if (res.status === 404) {
            return NextResponse.json({ error: `No data for ${symbol}` }, { status: 404 });
        }
        if (!res.ok) {
            return NextResponse.json({ error: "Market data unavailable" }, { status: 502 });
        }
        const data = await res.json();
        chart = data?.chart?.result?.[0];
    } catch {
        return NextResponse.json({ error: "Market data unavailable" }, { status: 502 });
    }

    const ts = chart?.timestamp;
    const q = chart?.indicators?.quote?.[0];
    if (!chart || !ts?.length || !q) {
        return NextResponse.json({ error: `No data for ${symbol}` }, { status: 404 });
    }

    const gmtoffset = chart.meta?.gmtoffset ?? 0;
    const isCrypto = chart.meta?.instrumentType === "CRYPTOCURRENCY" || /-USD$/.test(symbol);

    // Build bars, skipping Yahoo's null rows (halts, the odd empty interval).
    // Daily/weekly times are snapped to the local date; if Yahoo sends two bars
    // for one date (it sometimes appends today's live bar separately) the later wins.
    const byTime = new Map<number, Candle>();
    for (let i = 0; i < ts.length; i++) {
        const open = q.open?.[i];
        const high = q.high?.[i];
        const low = q.low?.[i];
        const close = q.close?.[i];
        if (open == null || high == null || low == null || close == null) continue;
        if (!(close > 0)) continue;
        const time = cfg.intraday ? ts[i] : toLocalDay(ts[i], gmtoffset);
        byTime.set(time, { time, open, high, low, close, volume: q.volume?.[i] ?? 0 });
    }
    const candles = Array.from(byTime.values()).sort((a, b) => a.time - b.time);
    if (candles.length === 0) {
        return NextResponse.json({ error: `No data for ${symbol}` }, { status: 404 });
    }

    // Window start, snapped to the first bar at or after it.
    let visibleFrom = windowStart(range, candles, gmtoffset, isCrypto);
    if (!cfg.intraday) visibleFrom = toLocalDay(visibleFrom, 0);
    const firstIdx = Math.max(0, candles.findIndex((c) => c.time >= visibleFrom));
    visibleFrom = candles[firstIdx].time;

    // Change over the range is measured from the close *before* the window,
    // the same convention as /api/historical (for YTD that's the Dec 31 bar itself).
    const anchorIdx = range === "ytd" ? firstIdx : firstIdx - 1;
    const previousClose = anchorIdx >= 0 ? candles[anchorIdx].close : null;

    const body: CandlesResponse = {
        symbol,
        range,
        interval: cfg.interval,
        intraday: cfg.intraday,
        visibleFrom,
        previousClose,
        currency: chart.meta?.currency ?? null,
        name: chart.meta?.longName ?? chart.meta?.shortName ?? null,
        candles,
    };

    return NextResponse.json(body, {
        headers: {
            // Shared edge cache keeps Yahoo traffic flat no matter how many people chart NVDA.
            "Cache-Control": `public, s-maxage=${cfg.cache}, stale-while-revalidate=${cfg.cache * 2}`,
        },
    });
}
