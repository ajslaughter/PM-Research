import { NextResponse } from "next/server";

const YF_CHART = "https://query1.finance.yahoo.com/v8/finance/chart";

const TICKERS = [
    { symbol: "^GSPC", name: "S&P 500" },
    { symbol: "^DJI", name: "DOW" },
    { symbol: "^IXIC", name: "NASDAQ" },
    { symbol: "^RUT", name: "R2K" },
    { symbol: "^VIX", name: "VIX" },
    { symbol: "SPY", name: "SPY" },
    { symbol: "QQQ", name: "QQQ" },
    { symbol: "AAPL", name: "AAPL" },
    { symbol: "NVDA", name: "NVDA" },
    { symbol: "TSLA", name: "TSLA" },
    { symbol: "META", name: "META" },
    { symbol: "AMZN", name: "AMZN" },
    { symbol: "MSFT", name: "MSFT" },
    { symbol: "GOOGL", name: "GOOGL" },
    { symbol: "AMD", name: "AMD" },
    { symbol: "BTC-USD", name: "BTC" },
    { symbol: "ETH-USD", name: "ETH" },
    { symbol: "GC=F", name: "GOLD" },
    { symbol: "CL=F", name: "OIL" },
    { symbol: "DX-Y.NYB", name: "DXY" },
];

export async function GET() {
    try {
        const results = await Promise.all(
            TICKERS.map(async ({ symbol, name }) => {
                try {
                    const res = await fetch(
                        `${YF_CHART}/${encodeURIComponent(symbol)}?range=1d&interval=1d`,
                        { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 60 } }
                    );
                    if (!res.ok) return null;
                    const raw = await res.json();
                    const meta = raw.chart?.result?.[0]?.meta;
                    if (!meta) return null;
                    const price = meta.regularMarketPrice || 0;
                    const prev = meta.chartPreviousClose || meta.previousClose || price;
                    const change = price - prev;
                    const changePct = prev > 0 ? (change / prev) * 100 : 0;
                    return { symbol, name, price, change, changePct };
                } catch {
                    return null;
                }
            })
        );

        return NextResponse.json({ tickers: results.filter(Boolean) });
    } catch (error: any) {
        return NextResponse.json({ tickers: [], error: error.message }, { status: 500 });
    }
}
