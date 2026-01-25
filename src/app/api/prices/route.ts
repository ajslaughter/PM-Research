import { NextResponse } from "next/server";

// Force dynamic route to ensure fresh data
export const dynamic = "force-dynamic";

// Cache for rate limiting protection
interface CacheEntry {
    data: Record<string, { price: number; changePercent: number }>;
    timestamp: number;
}

let stockCache: CacheEntry | null = null;
let btcCache: { price: number; changePercent: number; timestamp: number } | null = null;

const STOCK_CACHE_TTL_MS = 300000; // 5 minutes for stocks (Alpha Vantage has strict limits)
const BTC_CACHE_TTL_MS = 30000; // 30 seconds for BTC (CoinGecko is generous)

// Alpha Vantage free API (5 calls/min, 500/day)
// Get a free key at: https://www.alphavantage.co/support/#api-key
const ALPHA_VANTAGE_KEY = "demo"; // Works for testing, get your own for production

// Fetch Bitcoin price from CoinGecko (free, real-time, 24/7)
async function fetchBitcoinPrice(): Promise<{ price: number; changePercent: number } | null> {
    const now = Date.now();

    // Return cached BTC if fresh
    if (btcCache && (now - btcCache.timestamp) < BTC_CACHE_TTL_MS) {
        return { price: btcCache.price, changePercent: btcCache.changePercent };
    }

    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
            {
                headers: { 'Accept': 'application/json' },
                next: { revalidate: 30 }
            }
        );

        if (response.ok) {
            const data = await response.json();
            if (data.bitcoin) {
                btcCache = {
                    price: data.bitcoin.usd,
                    changePercent: data.bitcoin.usd_24h_change || 0,
                    timestamp: now
                };
                return { price: btcCache.price, changePercent: btcCache.changePercent };
            }
        }
    } catch (error) {
        console.error("CoinGecko fetch failed:", error);
    }

    return btcCache ? { price: btcCache.price, changePercent: btcCache.changePercent } : null;
}

// Fetch single stock from Alpha Vantage
async function fetchStockPrice(symbol: string): Promise<{ price: number; changePercent: number } | null> {
    try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
        const response = await fetch(url, { next: { revalidate: 300 } });

        if (response.ok) {
            const data = await response.json();
            const quote = data["Global Quote"];

            if (quote && quote["05. price"]) {
                const price = parseFloat(quote["05. price"]);
                const changeStr = quote["10. change percent"] || "0%";
                const changePercent = parseFloat(changeStr.replace('%', ''));

                return { price, changePercent };
            }
        }
    } catch (error) {
        console.error(`Alpha Vantage fetch failed for ${symbol}:`, error);
    }

    return null;
}

// Fetch all stock prices (with caching to respect rate limits)
async function fetchStockPrices(tickers: string[]): Promise<Record<string, { price: number; changePercent: number }>> {
    const now = Date.now();

    // Filter out BTC - we handle that separately
    const stockTickers = tickers.filter(t => t !== 'BTC-USD');

    if (stockTickers.length === 0) return {};

    // Check cache first
    if (stockCache && (now - stockCache.timestamp) < STOCK_CACHE_TTL_MS) {
        const allPresent = stockTickers.every(t => t in stockCache!.data);
        if (allPresent) {
            const result: Record<string, { price: number; changePercent: number }> = {};
            stockTickers.forEach(t => {
                if (stockCache!.data[t]) {
                    result[t] = stockCache!.data[t];
                }
            });
            return result;
        }
    }

    // Fetch each stock (Alpha Vantage requires individual calls)
    // To respect rate limits, we fetch sequentially with small delays
    const results: Record<string, { price: number; changePercent: number }> = {};

    for (const ticker of stockTickers) {
        // Check if we have it cached already
        if (stockCache?.data[ticker]) {
            results[ticker] = stockCache.data[ticker];
            continue;
        }

        const data = await fetchStockPrice(ticker);
        if (data) {
            results[ticker] = data;
        }

        // Small delay to respect rate limits (5 calls/min = 12 sec/call to be safe)
        // But for initial load, we'll batch and cache
        await new Promise(resolve => setTimeout(resolve, 250));
    }

    // Update cache
    stockCache = {
        data: { ...(stockCache?.data || {}), ...results },
        timestamp: now
    };

    return results;
}

export async function GET(request: Request) {
    try {
        // 1. Parse dynamic tickers from query params
        const { searchParams } = new URL(request.url);
        const tickerParam = searchParams.get('tickers');

        // Default to core Mag 7 + BTC if no params provided
        const defaultTickers = ["NVDA", "MSFT", "AAPL", "GOOGL", "AMZN", "META", "TSLA", "BTC-USD"];
        const tickersToFetch = tickerParam ? tickerParam.split(',').map(t => t.trim()) : defaultTickers;

        // 2. Fetch stocks and BTC in parallel
        const hasBTC = tickersToFetch.includes('BTC-USD');

        const [stockData, btcData] = await Promise.all([
            fetchStockPrices(tickersToFetch),
            hasBTC ? fetchBitcoinPrice() : Promise.resolve(null)
        ]);

        // 3. Combine results
        const result: Record<string, { price: number; changePercent: number }> = { ...stockData };

        if (hasBTC && btcData) {
            result['BTC-USD'] = btcData;
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Failed to fetch prices:", error);
        return NextResponse.json(
            { error: "Failed to fetch prices" },
            { status: 500 }
        );
    }
}
