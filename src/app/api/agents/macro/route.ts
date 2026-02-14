import { NextResponse } from "next/server";

// Direct Yahoo Finance data — no AI needed
const YF_CHART = "https://query1.finance.yahoo.com/v8/finance/chart";

const ECON_CALENDAR = [
  { date: "2026-01-02", title: "ISM Manufacturing PMI", impact: "high", previous: 48.4, forecast: 48.8, actual: 49.2 },
  { date: "2026-01-07", title: "ISM Services PMI", impact: "medium", previous: 52.1, forecast: 52.4, actual: 53.0 },
  { date: "2026-01-10", title: "Nonfarm Payrolls", impact: "high", previous: 227, forecast: 160, actual: 256, unit: "K" },
  { date: "2026-01-15", title: "CPI Report", impact: "high", previous: 2.7, forecast: 2.9, actual: 2.9, unit: "%" },
  { date: "2026-01-16", title: "Retail Sales", impact: "medium", previous: 0.7, forecast: 0.6, actual: 0.4, unit: "%" },
  { date: "2026-01-17", title: "PPI Report", impact: "medium", previous: 3.0, forecast: 3.4, actual: 3.3, unit: "%" },
  { date: "2026-01-28", title: "FOMC Rate Decision", impact: "high", previous: 4.5, forecast: 4.5, actual: 4.5, unit: "%" },
  { date: "2026-01-29", title: "GDP Q4 Advance", impact: "high", previous: 3.1, forecast: 2.6, actual: 2.3, unit: "%" },
  { date: "2026-01-31", title: "PCE Price Index", impact: "high", previous: 2.4, forecast: 2.6, actual: 2.6, unit: "%" },
  { date: "2026-02-03", title: "ISM Manufacturing PMI", impact: "high", previous: 49.2, forecast: 49.5, actual: 50.9 },
  { date: "2026-02-05", title: "ISM Services PMI", impact: "medium", previous: 53.0, forecast: 52.8, actual: 52.8 },
  { date: "2026-02-07", title: "Nonfarm Payrolls", impact: "high", previous: 256, forecast: 170, actual: 143, unit: "K" },
  { date: "2026-02-12", title: "CPI Report", impact: "high", previous: 2.9, forecast: 2.9, actual: 3.0, unit: "%" },
  { date: "2026-02-13", title: "PPI Report", impact: "medium", previous: 3.3, forecast: 3.2, actual: null, unit: "%" },
  { date: "2026-02-14", title: "Retail Sales", impact: "medium", previous: 0.4, forecast: -0.1, actual: null, unit: "%" },
  { date: "2026-02-19", title: "Housing Starts", impact: "low", previous: 1.499, forecast: 1.4, actual: null, unit: "M" },
  { date: "2026-02-20", title: "Initial Jobless Claims", impact: "medium", previous: 213, forecast: 215, actual: null, unit: "K" },
  { date: "2026-02-21", title: "Existing Home Sales", impact: "low", previous: 4.24, forecast: 4.15, actual: null, unit: "M" },
  { date: "2026-02-25", title: "Consumer Confidence", impact: "medium", previous: 104.1, forecast: 103.0, actual: null },
  { date: "2026-02-27", title: "GDP Q4 Second Estimate", impact: "high", previous: 2.3, forecast: 2.3, actual: null, unit: "%" },
  { date: "2026-02-28", title: "PCE Price Index", impact: "high", previous: 2.6, forecast: 2.5, actual: null, unit: "%" },
  { date: "2026-03-02", title: "ISM Manufacturing PMI", impact: "high", previous: 50.9, forecast: null, actual: null },
  { date: "2026-03-04", title: "ISM Services PMI", impact: "medium", previous: 52.8, forecast: null, actual: null },
  { date: "2026-03-06", title: "Nonfarm Payrolls", impact: "high", previous: 143, forecast: null, actual: null, unit: "K" },
  { date: "2026-03-11", title: "CPI Report", impact: "high", previous: 3.0, forecast: null, actual: null, unit: "%" },
  { date: "2026-03-13", title: "PPI Report", impact: "medium", previous: null, forecast: null, actual: null, unit: "%" },
  { date: "2026-03-17", title: "Retail Sales", impact: "medium", previous: null, forecast: null, actual: null, unit: "%" },
  { date: "2026-03-18", title: "FOMC Rate Decision", impact: "high", previous: 4.5, forecast: null, actual: null, unit: "%" },
  { date: "2026-03-26", title: "GDP Q4 Final", impact: "high", previous: null, forecast: null, actual: null, unit: "%" },
  { date: "2026-03-28", title: "PCE Price Index", impact: "high", previous: null, forecast: null, actual: null, unit: "%" },
  { date: "2026-04-01", title: "ISM Manufacturing PMI", impact: "high", previous: null, forecast: null, actual: null },
  { date: "2026-04-03", title: "Nonfarm Payrolls", impact: "high", previous: null, forecast: null, actual: null, unit: "K" },
  { date: "2026-04-10", title: "CPI Report", impact: "high", previous: null, forecast: null, actual: null, unit: "%" },
];

const MACRO_SYMBOLS = {
    // Indices
    "^GSPC": { name: "S&P 500", category: "indices" },
    "^DJI": { name: "Dow Jones", category: "indices" },
    "^IXIC": { name: "Nasdaq", category: "indices" },
    "^RUT": { name: "Russell 2000", category: "indices" },
    // Yields
    "^TNX": { name: "10Y Treasury", category: "yields" },
    "^FVX": { name: "5Y Treasury", category: "yields" },
    "^TYX": { name: "30Y Treasury", category: "yields" },
    "^IRX": { name: "3M T-Bill", category: "yields" },
    // Risk
    "^VIX": { name: "VIX", category: "risk" },
    // Commodities
    "GC=F": { name: "Gold", category: "commodities" },
    "CL=F": { name: "Crude Oil", category: "commodities" },
    "SI=F": { name: "Silver", category: "commodities" },
    "NG=F": { name: "Nat Gas", category: "commodities" },
    // Currency
    "DX-Y.NYB": { name: "US Dollar (DXY)", category: "currency" },
    "EURUSD=X": { name: "EUR/USD", category: "currency" },
    "JPY=X": { name: "USD/JPY", category: "currency" },
    // Crypto
    "BTC-USD": { name: "Bitcoin", category: "crypto" },
    "ETH-USD": { name: "Ethereum", category: "crypto" },
};

function getEconomicCalendar() {
    return ECON_CALENDAR;
}

export async function GET() {
    try {
        const symbols = Object.keys(MACRO_SYMBOLS);

        // Fetch each symbol via v8 chart API (v7 quote requires auth)
        const results = await Promise.all(
            symbols.map(async (symbol) => {
                try {
                    const url = `${YF_CHART}/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
                    const res = await fetch(url, {
                        headers: { "User-Agent": "Mozilla/5.0" },
                        next: { revalidate: 60 },
                    });
                    if (!res.ok) return null;
                    const raw = await res.json();
                    const r = raw.chart?.result?.[0];
                    if (!r) return null;
                    const meta = r.meta;
                    const price = meta.regularMarketPrice || 0;
                    const prevClose = meta.chartPreviousClose || meta.previousClose || price;
                    const change = price - prevClose;
                    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
                    return { symbol, price, change, changePercent };
                } catch {
                    return null;
                }
            })
        );

        // Build structured data by category
        const data: Record<string, Array<{
            symbol: string;
            name: string;
            price: number;
            change: number;
            changePercent: number;
        }>> = {
            indices: [],
            yields: [],
            risk: [],
            commodities: [],
            currency: [],
            crypto: [],
        };

        for (const q of results) {
            if (!q) continue;
            const meta = MACRO_SYMBOLS[q.symbol as keyof typeof MACRO_SYMBOLS];
            if (!meta) continue;

            data[meta.category].push({
                symbol: q.symbol,
                name: meta.name,
                price: q.price,
                change: q.change,
                changePercent: q.changePercent,
            });
        }

        // Yield curve data for chart
        const yieldCurve = [
            { maturity: "3M", value: data.yields.find((y) => y.symbol === "^IRX")?.price || 0 },
            { maturity: "5Y", value: data.yields.find((y) => y.symbol === "^FVX")?.price || 0 },
            { maturity: "10Y", value: data.yields.find((y) => y.symbol === "^TNX")?.price || 0 },
            { maturity: "30Y", value: data.yields.find((y) => y.symbol === "^TYX")?.price || 0 },
        ];

        // VIX level for risk gauge
        const vix = data.risk.find((r) => r.symbol === "^VIX");
        const riskLevel = vix
            ? vix.price < 15 ? "low" : vix.price < 20 ? "moderate" : vix.price < 30 ? "elevated" : "extreme"
            : "unknown";

        const calendar = await getEconomicCalendar();

        return NextResponse.json({
            data,
            yieldCurve,
            riskLevel,
            calendar,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Macro fetch failed" }, { status: 500 });
    }
}
