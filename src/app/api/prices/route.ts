import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

// Force dynamic route to ensure fresh data
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const tickers = [
            "NVDA",
            "PLTR",
            "RKLB",
            "IONQ",
            "PATH",
            "SMCI",
            "ENPH",
            // "ASTR" // Note: Astra Space went private/delisted, might fail. Excluding to adhere to live market data.
        ];

        const results = await yahooFinance.quote(tickers);

        // Map results to a simple dictionary: { "NVDA": 123.45, ... }
        const prices: Record<string, number> = {};

        results.forEach((quote) => {
            if (quote.symbol && quote.regularMarketPrice) {
                prices[quote.symbol] = quote.regularMarketPrice;
            }
        });

        return NextResponse.json(prices);
    } catch (error) {
        console.error("Failed to fetch stock prices:", error);
        return NextResponse.json(
            { error: "Failed to fetch prices" },
            { status: 500 }
        );
    }
}
