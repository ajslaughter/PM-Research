import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Yahoo Finance chart API — returns historical closes as % change over the range.
// Symbols: SPY (S&P 500), QQQ (Nasdaq), DIA (Dow), IWM (Russell 2000), GLD (Gold), BTC-USD (Bitcoin)

interface YahooChartResult {
    meta?: { chartPreviousClose?: number; previousClose?: number };
    timestamp: number[];
    indicators: {
        quote: Array<{
            close: (number | null)[];
        }>;
    };
}

const RANGE_MAP: Record<string, { range: string; interval: string }> = {
    "1d": { range: "1d", interval: "5m" },
    "5d": { range: "5d", interval: "30m" },
    "1mo": { range: "1mo", interval: "1d" },
    "ytd": { range: "ytd", interval: "1d" },
    "1y": { range: "1y", interval: "1d" },
    "5y": { range: "5y", interval: "1wk" },
};

/**
 * Build the Yahoo URL for a range.
 *
 * YTD is requested from Dec 31 of last year so the first bar is the Dec 31 close,
 * the same anchor the watchlists use. (Yahoo's own range=ytd starts on the first
 * trading day of January, which shifted every YTD figure by that day's move.)
 */
function chartUrl(symbol: string, range: string): string {
    const base = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`;
    const { interval } = RANGE_MAP[range];
    if (range === "ytd") {
        const year = Number(
            new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric" }).format(new Date())
        );
        const period1 = Math.floor(Date.UTC(year - 1, 11, 31) / 1000);
        const period2 = Math.floor(Date.now() / 1000);
        return `${base}?period1=${period1}&period2=${period2}&interval=${interval}&includePrePost=false`;
    }
    return `${base}?range=${RANGE_MAP[range].range}&interval=${interval}&includePrePost=false`;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const symbols = searchParams.get("symbols")?.split(",") || [];
    const range = searchParams.get("range") || "1d";

    if (symbols.length === 0) {
        return NextResponse.json({ error: "No symbols provided" }, { status: 400 });
    }

    if (!RANGE_MAP[range]) {
        return NextResponse.json({ error: "Invalid range" }, { status: 400 });
    }

    try {
        const results: Record<string, Array<{ t: number; value: number }>> = {};

        await Promise.all(
            symbols.map(async (symbol) => {
                try {
                    const res = await fetch(chartUrl(symbol, range), {
                        headers: { "User-Agent": "Mozilla/5.0" },
                        cache: "no-store",
                    });

                    if (!res.ok) return;

                    const data = await res.json();
                    const chart: YahooChartResult = data.chart?.result?.[0];
                    if (!chart?.timestamp || !chart?.indicators?.quote?.[0]?.close) return;

                    const timestamps = chart.timestamp;
                    const closes = chart.indicators.quote[0].close;
                    const firstClose = closes.find((c): c is number => c !== null && c > 0) ?? 0;

                    // % change is measured from the close *before* the window
                    // (prior session close for 1D, close 5 sessions back for 5D, ...),
                    // matching how brokers and Yahoo quote period returns.
                    // YTD starts on the Dec 31 bar, so its first close is the anchor.
                    const baseline =
                        range === "ytd"
                            ? firstClose
                            : chart.meta?.chartPreviousClose || chart.meta?.previousClose || firstClose;

                    if (!baseline) return;

                    const points: Array<{ t: number; value: number }> = [];
                    for (let i = 0; i < timestamps.length; i++) {
                        const close = closes[i];
                        if (close === null || close === undefined) continue;
                        const pctChange = ((close - baseline) / baseline) * 100;
                        points.push({ t: timestamps[i], value: Math.round(pctChange * 100) / 100 });
                    }

                    results[symbol] = points;
                } catch {
                    // Skip failed symbols
                }
            })
        );

        return NextResponse.json({ data: results, range });
    } catch {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
