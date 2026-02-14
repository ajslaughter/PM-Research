import { NextResponse } from "next/server";

const YF_CHART = "https://query1.finance.yahoo.com/v8/finance/chart";

const TICKERS = [
    // Major Indices
    { symbol: "^GSPC", name: "S&P 500", tag: "index" },
    { symbol: "^DJI", name: "DOW", tag: "index" },
    { symbol: "^IXIC", name: "NASDAQ", tag: "index" },
    { symbol: "^RUT", name: "R2K", tag: "index" },
    { symbol: "^VIX", name: "VIX", tag: "index" },
    // Global
    { symbol: "^FTSE", name: "FTSE", tag: "global" },
    { symbol: "^N225", name: "NIKKEI", tag: "global" },
    { symbol: "^GDAXI", name: "DAX", tag: "global" },
    { symbol: "^HSI", name: "HANG SENG", tag: "global" },
    { symbol: "FXI", name: "CHINA", tag: "global" },
    // Mega Cap Tech
    { symbol: "AAPL", name: "AAPL", tag: "tech" },
    { symbol: "NVDA", name: "NVDA", tag: "tech" },
    { symbol: "TSLA", name: "TSLA", tag: "tech" },
    { symbol: "META", name: "META", tag: "tech" },
    { symbol: "AMZN", name: "AMZN", tag: "tech" },
    { symbol: "MSFT", name: "MSFT", tag: "tech" },
    { symbol: "GOOGL", name: "GOOGL", tag: "tech" },
    { symbol: "AMD", name: "AMD", tag: "tech" },
    { symbol: "AVGO", name: "AVGO", tag: "tech" },
    { symbol: "CRM", name: "CRM", tag: "tech" },
    // Sector ETFs (rotation)
    { symbol: "XLF", name: "FINANCIALS", tag: "sector" },
    { symbol: "XLE", name: "ENERGY", tag: "sector" },
    { symbol: "XLV", name: "HEALTH", tag: "sector" },
    { symbol: "XLI", name: "INDUSTRIALS", tag: "sector" },
    { symbol: "XLK", name: "TECH", tag: "sector" },
    { symbol: "XLP", name: "STAPLES", tag: "sector" },
    { symbol: "XLU", name: "UTILITIES", tag: "sector" },
    { symbol: "XLRE", name: "REAL ESTATE", tag: "sector" },
    { symbol: "XLC", name: "COMM SVCS", tag: "sector" },
    { symbol: "XLB", name: "MATERIALS", tag: "sector" },
    { symbol: "XLY", name: "DISCRETIONARY", tag: "sector" },
    // High-Profile Stocks
    { symbol: "JPM", name: "JPM", tag: "stock" },
    { symbol: "V", name: "VISA", tag: "stock" },
    { symbol: "UNH", name: "UNH", tag: "stock" },
    { symbol: "LLY", name: "LLY", tag: "stock" },
    { symbol: "WMT", name: "WMT", tag: "stock" },
    { symbol: "NFLX", name: "NFLX", tag: "stock" },
    { symbol: "BA", name: "BA", tag: "stock" },
    { symbol: "DIS", name: "DIS", tag: "stock" },
    { symbol: "COIN", name: "COIN", tag: "stock" },
    { symbol: "PLTR", name: "PLTR", tag: "stock" },
    { symbol: "ARM", name: "ARM", tag: "stock" },
    { symbol: "SMCI", name: "SMCI", tag: "stock" },
    { symbol: "MSTR", name: "MSTR", tag: "stock" },
    // Crypto
    { symbol: "BTC-USD", name: "BTC", tag: "crypto" },
    { symbol: "ETH-USD", name: "ETH", tag: "crypto" },
    // Commodities & Macro
    { symbol: "GC=F", name: "GOLD", tag: "commodity" },
    { symbol: "SI=F", name: "SILVER", tag: "commodity" },
    { symbol: "CL=F", name: "OIL", tag: "commodity" },
    { symbol: "NG=F", name: "NAT GAS", tag: "commodity" },
    { symbol: "DX-Y.NYB", name: "DXY", tag: "macro" },
    { symbol: "^TNX", name: "10Y YIELD", tag: "macro" },
];

async function fetchTicker({ symbol, name, tag }: { symbol: string; name: string; tag: string }) {
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
        return { symbol, name, tag, price, change, changePct };
    } catch {
        return null;
    }
}

export async function GET() {
    try {
        // Fetch in batches of 15 to avoid overwhelming Yahoo
        const batches = [];
        for (let i = 0; i < TICKERS.length; i += 15) {
            batches.push(TICKERS.slice(i, i + 15));
        }

        const allResults = [];
        for (const batch of batches) {
            const results = await Promise.all(batch.map(fetchTicker));
            allResults.push(...results);
        }

        const tickers = allResults.filter(Boolean);

        // Find top gainers and losers from all results
        const sorted = [...tickers].sort((a: any, b: any) => b.changePct - a.changePct);
        const gainers = sorted.slice(0, 3).map((t: any) => ({ ...t, badge: "gainer" }));
        const losers = sorted.slice(-3).map((t: any) => ({ ...t, badge: "loser" }));

        return NextResponse.json({ tickers, gainers, losers });
    } catch (error: any) {
        return NextResponse.json({ tickers: [], gainers: [], losers: [], error: error.message }, { status: 500 });
    }
}
