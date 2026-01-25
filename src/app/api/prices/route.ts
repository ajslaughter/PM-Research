import { NextResponse } from "next/server";

// Force dynamic route to ensure fresh data
export const dynamic = "force-dynamic";

// Simple in-memory cache to prevent rate limiting
interface CacheEntry {
    data: Record<string, { price: number; changePercent: number }>;
    timestamp: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 60000; // 60 seconds

export async function GET(request: Request) {
    try {
        // 1. Parse dynamic tickers from query params
        const { searchParams } = new URL(request.url);
        const tickerParam = searchParams.get('tickers');

        // Default to core Mag 7 + BTC if no params provided
        const defaultTickers = ["NVDA", "MSFT", "AAPL", "GOOGL", "AMZN", "META", "TSLA", "BTC-USD"];
        const tickersToFetch = tickerParam ? tickerParam.split(',').map(t => t.trim()) : defaultTickers;

        // 2. Check cache validity
        const now = Date.now();
        if (cache && (now - cache.timestamp) < CACHE_TTL_MS) {
            // Return cached data if all requested tickers are present
            const allPresent = tickersToFetch.every(t => t in cache!.data);
            if (allPresent) {
                // Filter to only requested tickers
                const filteredData: Record<string, { price: number; changePercent: number }> = {};
                tickersToFetch.forEach(t => {
                    if (cache!.data[t]) {
                        filteredData[t] = cache!.data[t];
                    }
                });
                return NextResponse.json(filteredData);
            }
        }

        // 3. Fetch fresh data from Yahoo Finance public API (no package needed)
        const symbols = tickersToFetch.join(',');
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Yahoo API returned ${response.status}`);
        }

        const json = await response.json();
        const quotes = json.quoteResponse?.result || [];

        // 4. Map results to include price AND daily change percent
        const data: Record<string, { price: number; changePercent: number }> = {};

        quotes.forEach((quote: { symbol?: string; regularMarketPrice?: number; regularMarketChangePercent?: number }) => {
            if (quote.symbol && quote.regularMarketPrice) {
                data[quote.symbol] = {
                    price: quote.regularMarketPrice,
                    changePercent: quote.regularMarketChangePercent || 0
                };
            }
        });

        // 5. Update cache
        cache = {
            data: { ...(cache?.data || {}), ...data },
            timestamp: now
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to fetch stock prices:", error);
        return NextResponse.json(
            { error: "Failed to fetch prices" },
            { status: 500 }
        );
    }
}
