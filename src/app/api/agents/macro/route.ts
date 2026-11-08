import { NextResponse } from "next/server";
import { fetchQuotes } from "@/lib/yahoo";

export const dynamic = "force-dynamic";

// Direct Yahoo Finance data — no AI needed

/**
 * Scheduled U.S. releases (8:30 AM ET unless noted; FOMC decisions at 2:00 PM ET).
 * Dates only. Forecasts and actuals aren't tracked here, so they stay null.
 * Sources, checked 2026-11-08:
 *   FOMC  https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm
 *   BLS   https://www.bls.gov/schedule/news_release/ (CPI, PPI, Employment Situation)
 *   BEA   https://www.bea.gov/news/schedule (GDP, Personal Income and Outlays / PCE)
 * Extend this list as agencies publish 2027 schedules.
 */
type CalendarEntry = {
  date: string;
  title: string;
  impact: "high" | "medium" | "low";
  previous: null;
  forecast: null;
  actual: null;
  unit?: string;
};

const release = (date: string, title: string, impact: CalendarEntry["impact"]): CalendarEntry => ({
  date,
  title,
  impact,
  previous: null,
  forecast: null,
  actual: null,
});

const ECON_CALENDAR: CalendarEntry[] = [
  release("2026-10-28", "FOMC rate decision", "high"),
  release("2026-11-06", "Employment Situation (October)", "high"),
  release("2026-11-10", "CPI (October)", "high"),
  release("2026-11-13", "PPI (October)", "medium"),
  release("2026-11-25", "GDP Q3, second estimate", "high"),
  release("2026-11-25", "Personal Income and Outlays / PCE (October)", "high"),
  release("2026-12-04", "Employment Situation (November)", "high"),
  release("2026-12-09", "FOMC rate decision and projections", "high"),
  release("2026-12-10", "CPI (November)", "high"),
  release("2026-12-15", "PPI (November)", "medium"),
  release("2026-12-23", "GDP Q3, third estimate", "medium"),
  release("2026-12-23", "Personal Income and Outlays / PCE (November)", "high"),
  release("2027-01-08", "Employment Situation (December)", "high"),
  release("2027-01-13", "CPI (December)", "high"),
  release("2027-01-14", "PPI (December)", "medium"),
  release("2027-01-27", "FOMC rate decision", "high"),
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

        const quotes = await fetchQuotes(symbols);
        const results = symbols.map((symbol) => {
            const q = quotes[symbol];
            return q ? { symbol, price: q.price, change: q.change, changePercent: q.changePercent } : null;
        });

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
