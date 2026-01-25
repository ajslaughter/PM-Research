import { NextResponse } from "next/server";

// Force dynamic route to ensure fresh data
export const dynamic = "force-dynamic";

// Simple in-memory cache to prevent rate limiting
interface CacheEntry {
    data: Record<string, { price: number; changePercent: number }>;
    timestamp: number;
}

let stockCache: CacheEntry | null = null;
let btcCache: { price: number; changePercent: number; timestamp: number } | null = null;

const STOCK_CACHE_TTL_MS = 60000; // 60 seconds for stocks
const BTC_CACHE_TTL_MS = 30000; // 30 seconds for BTC (real-time)

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
            { headers: { 'Accept': 'application/json' } }
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

    return null;
}

// Fetch stock prices from Yahoo Finance
async function fetchStockPrices(tickers: string[]): Promise<Record<string, { price: number; changePercent: number }>> {
    const now = Date.now();

    // Filter out BTC - we handle that separately
    const stockTickers = tickers.filter(t => t !== 'BTC-USD');

    if (stockTickers.length === 0) return {};

    // Check cache
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

    try {
        const symbols = stockTickers.join(',');
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

        const data: Record<string, { price: number; changePercent: number }> = {};

        quotes.forEach((quote: { symbol?: string; regularMarketPrice?: number; regularMarketChangePercent?: number }) => {
            if (quote.symbol && quote.regularMarketPrice) {
                data[quote.symbol] = {
                    price: quote.regularMarketPrice,
                    changePercent: quote.regularMarketChangePercent || 0
                };
            }
        });

        // Update cache
        stockCache = {
            data: { ...(stockCache?.data || {}), ...data },
            timestamp: now
        };

        return data;
    } catch (error) {
        console.error("Yahoo Finance fetch failed:", error);
        return {};
    }
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
