import { NextResponse } from "next/server";

// Force dynamic route to ensure fresh data
export const dynamic = "force-dynamic";

// Cache for rate limiting protection
interface PriceData {
    price: number;
    changePercent: number;
}

interface CacheEntry {
    data: Record<string, PriceData>;
    timestamp: number;
}

let priceCache: CacheEntry | null = null;

// Cache for 5 minutes to respect Alpha Vantage rate limits
// BTC updates more frequently via CoinGecko
const CACHE_TTL_MS = 300000;

// Alpha Vantage: Set ALPHA_VANTAGE_KEY in environment, or uses demo
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY || "demo";

// Fetch Bitcoin from CoinGecko (free, no key needed, real-time 24/7)
async function fetchBitcoinPrice(): Promise<PriceData | null> {
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
            {
                headers: { 'Accept': 'application/json' },
                cache: 'no-store'
            }
        );

        if (response.ok) {
            const data = await response.json();
            if (data.bitcoin) {
                return {
                    price: data.bitcoin.usd,
                    changePercent: data.bitcoin.usd_24h_change || 0
                };
            }
        }
    } catch (error) {
        console.error("CoinGecko fetch failed:", error);
    }

    return null;
}

// Fetch stock from Alpha Vantage
async function fetchStockPrice(symbol: string): Promise<PriceData | null> {
    try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
        const response = await fetch(url, { cache: 'no-store' });

        if (response.ok) {
            const data = await response.json();
            const quote = data["Global Quote"];

            if (quote && quote["05. price"]) {
                return {
                    price: parseFloat(quote["05. price"]),
                    changePercent: parseFloat((quote["10. change percent"] || "0%").replace('%', ''))
                };
            }

            // Check for rate limit message
            if (data.Note || data.Information) {
                console.warn("Alpha Vantage rate limited:", data.Note || data.Information);
            }
        }
    } catch (error) {
        console.error(`Alpha Vantage fetch failed for ${symbol}:`, error);
    }

    return null;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const tickerParam = searchParams.get('tickers');
        const forceRefresh = searchParams.get('refresh') === 'true';

        // Default tickers
        const defaultTickers = ["NVDA", "MSFT", "AAPL", "GOOGL", "AMZN", "META", "TSLA", "BTC-USD"];
        const tickersToFetch = tickerParam ? tickerParam.split(',').map(t => t.trim()) : defaultTickers;

        const now = Date.now();

        // Return cached data if fresh (unless force refresh)
        if (!forceRefresh && priceCache && (now - priceCache.timestamp) < CACHE_TTL_MS) {
            const allPresent = tickersToFetch.every(t => t in priceCache!.data);
            if (allPresent) {
                // Still fetch fresh BTC since it's real-time
                if (tickersToFetch.includes('BTC-USD')) {
                    const btcData = await fetchBitcoinPrice();
                    if (btcData) {
                        priceCache.data['BTC-USD'] = btcData;
                    }
                }

                const result: Record<string, PriceData> = {};
                tickersToFetch.forEach(t => {
                    if (priceCache!.data[t]) {
                        result[t] = priceCache!.data[t];
                    }
                });
                return NextResponse.json(result);
            }
        }

        // Fetch fresh data
        const results: Record<string, PriceData> = {};

        // Fetch BTC first (fast, no rate limit concerns)
        if (tickersToFetch.includes('BTC-USD')) {
            const btcData = await fetchBitcoinPrice();
            if (btcData) {
                results['BTC-USD'] = btcData;
            }
        }

        // Fetch stocks (rate limited - fetch sequentially)
        const stockTickers = tickersToFetch.filter(t => t !== 'BTC-USD');

        for (const ticker of stockTickers) {
            // Use cached value if we have it and it's not too old
            if (priceCache?.data[ticker] && (now - priceCache.timestamp) < CACHE_TTL_MS) {
                results[ticker] = priceCache.data[ticker];
                continue;
            }

            const stockData = await fetchStockPrice(ticker);
            if (stockData) {
                results[ticker] = stockData;
            }

            // Small delay between requests to respect rate limits
            if (stockTickers.indexOf(ticker) < stockTickers.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // Update cache
        priceCache = {
            data: { ...(priceCache?.data || {}), ...results },
            timestamp: now
        };

        return NextResponse.json(results);
    } catch (error) {
        console.error("Failed to fetch prices:", error);

        // Return cached data on error
        if (priceCache) {
            return NextResponse.json(priceCache.data);
        }

        return NextResponse.json(
            { error: "Failed to fetch prices" },
            { status: 500 }
        );
    }
}
