import { NextRequest, NextResponse } from "next/server";

// Yahoo Finance options chain with crumb auth
let cachedCrumb: { crumb: string; cookie: string; ts: number } | null = null;

async function getYFAuth(): Promise<{ crumb: string; cookie: string }> {
    // Cache crumb for 10 minutes
    if (cachedCrumb && Date.now() - cachedCrumb.ts < 600000) {
        return cachedCrumb;
    }

    const cookieRes = await fetch("https://fc.yahoo.com", {
        headers: { "User-Agent": "Mozilla/5.0" },
        redirect: "manual",
    });
    const cookies = cookieRes.headers.getSetCookie?.() || [];
    const cookie = cookies.map((c) => c.split(";")[0]).join("; ");

    const crumbRes = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
        headers: {
            "User-Agent": "Mozilla/5.0",
            Cookie: cookie,
        },
    });
    const crumb = await crumbRes.text();

    cachedCrumb = { crumb, cookie, ts: Date.now() };
    return cachedCrumb;
}

interface YFOption {
    strike: number;
    lastPrice: number;
    bid: number;
    ask: number;
    volume: number;
    openInterest: number;
    impliedVolatility: number;
    expiration: number;
    contractSymbol: string;
    inTheMoney: boolean;
}

export async function POST(req: NextRequest) {
    try {
        const { ticker, expiration } = await req.json();

        if (!ticker?.trim()) {
            return NextResponse.json({ error: "Ticker required" }, { status: 400 });
        }

        const symbol = ticker.toUpperCase().trim();
        const auth = await getYFAuth();

        let url = `https://query2.finance.yahoo.com/v7/finance/options/${encodeURIComponent(symbol)}?crumb=${encodeURIComponent(auth.crumb)}`;
        if (expiration) {
            url += `&date=${expiration}`;
        }
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                Cookie: auth.cookie,
            },
        });

        if (!res.ok) {
            // Invalidate cache and retry once
            cachedCrumb = null;
            return NextResponse.json({ error: `Failed to fetch options for ${symbol}` }, { status: 502 });
        }

        const raw = await res.json();
        const result = raw.optionChain?.result?.[0];

        if (!result || !result.options?.length) {
            return NextResponse.json({ error: `No options data for ${symbol}` }, { status: 404 });
        }

        const quote = result.quote;
        const opts = result.options[0];
        const calls: YFOption[] = opts.calls || [];
        const puts: YFOption[] = opts.puts || [];
        const expiryDate = new Date(opts.expirationDate * 1000);
        const expiryStr = `${(expiryDate.getMonth() + 1).toString().padStart(2, "0")}/${expiryDate.getDate().toString().padStart(2, "0")}`;

        // Compute summary
        const totalCallVol = calls.reduce((s, c) => s + (c.volume || 0), 0);
        const totalPutVol = puts.reduce((s, p) => s + (p.volume || 0), 0);
        const totalVol = totalCallVol + totalPutVol;
        const totalCallOI = calls.reduce((s, c) => s + (c.openInterest || 0), 0);
        const totalPutOI = puts.reduce((s, p) => s + (p.openInterest || 0), 0);

        const callPct = totalVol > 0 ? (totalCallVol / totalVol) * 100 : 50;
        const putPct = totalVol > 0 ? (totalPutVol / totalVol) * 100 : 50;
        const pcRatio = totalCallVol > 0 ? totalPutVol / totalCallVol : 1;

        const sentiment: "bullish" | "bearish" | "neutral" =
            pcRatio < 0.7 ? "bullish" : pcRatio > 1.2 ? "bearish" : "neutral";

        // Find most active contracts by volume
        const allOptions = [
            ...calls.map((c) => ({ ...c, optType: "call" as const })),
            ...puts.map((p) => ({ ...p, optType: "put" as const })),
        ];

        const notable = allOptions
            .filter((o) => (o.volume || 0) > 0)
            .sort((a, b) => (b.volume || 0) - (a.volume || 0))
            .slice(0, 15)
            .map((o) => ({
                strike: o.strike,
                expiry: expiryStr,
                type: o.optType,
                premium: Math.round((o.lastPrice || 0) * (o.volume || 0) * 100),
                trade_type: (o.volume || 0) > (o.openInterest || 1) * 2 ? "sweep" : (o.volume || 0) > (o.openInterest || 1) ? "unusual" : "active",
                volume: o.volume || 0,
                openInterest: o.openInterest || 0,
                iv: Math.round((o.impliedVolatility || 0) * 100),
                lastPrice: o.lastPrice || 0,
            }));

        // Max pain calculation
        const strikes = Array.from(new Set([...calls.map((c) => c.strike), ...puts.map((p) => p.strike)])).sort((a, b) => a - b);

        let maxPainStrike = quote.regularMarketPrice || 0;
        let minPain = Infinity;

        for (const testStrike of strikes) {
            let pain = 0;
            for (const c of calls) {
                if (testStrike > c.strike) pain += (testStrike - c.strike) * (c.openInterest || 0) * 100;
            }
            for (const p of puts) {
                if (testStrike < p.strike) pain += (p.strike - testStrike) * (p.openInterest || 0) * 100;
            }
            if (pain < minPain) {
                minPain = pain;
                maxPainStrike = testStrike;
            }
        }

        const highestOICall = calls.length ? calls.reduce((max, c) => (c.openInterest || 0) > (max.openInterest || 0) ? c : max, calls[0]) : null;
        const highestOIPut = puts.length ? puts.reduce((max, p) => (p.openInterest || 0) > (max.openInterest || 0) ? p : max, puts[0]) : null;

        // Available expirations as unix timestamps
        const expirations = (result.expirationDates || []).map((ts: number) => {
            const d = new Date(ts * 1000);
            return {
                ts,
                label: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }),
            };
        });

        const data = {
            ticker: symbol,
            price: quote.regularMarketPrice || 0,
            change: quote.regularMarketChangePercent || 0,
            expiry: expiryStr,
            expirations,
            summary: {
                volume: totalVol,
                volume_avg_ratio: totalVol > 0 ? Math.round((totalVol / Math.max(totalCallOI + totalPutOI, 1)) * 10) / 10 : 0,
                call_pct: Math.round(callPct * 10) / 10,
                put_pct: Math.round(putPct * 10) / 10,
                pc_ratio: Math.round(pcRatio * 100) / 100,
                sentiment,
                total_call_vol: totalCallVol,
                total_put_vol: totalPutVol,
                total_call_oi: totalCallOI,
                total_put_oi: totalPutOI,
            },
            notable_trades: notable,
            key_levels: {
                max_pain: maxPainStrike,
                highest_oi_call: highestOICall?.strike || 0,
                highest_oi_put: highestOIPut?.strike || 0,
            },
        };

        return NextResponse.json({ data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Options fetch failed" }, { status: 500 });
    }
}
