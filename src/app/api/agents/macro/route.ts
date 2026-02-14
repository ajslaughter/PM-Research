import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// Direct Yahoo Finance data — no AI needed
const YF_CHART = "https://query1.finance.yahoo.com/v8/finance/chart";
const CALENDAR_PATH = path.join(process.env.HOME || "/Users/jp", ".finviz-bot/econ-calendar.json");

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

// Load economic calendar from persistent JSON file
async function getEconomicCalendar() {
    try {
        if (!existsSync(CALENDAR_PATH)) return [];
        const raw = await readFile(CALENDAR_PATH, "utf-8");
        const events = JSON.parse(raw);
        events.sort((a: any, b: any) => a.date.localeCompare(b.date));
        return events;
    } catch {
        return [];
    }
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
