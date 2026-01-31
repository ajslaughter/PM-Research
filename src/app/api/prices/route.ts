import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Server-side only - API keys are never exposed to client
const POLYGON_API_KEY = process.env.POLYGON_API_KEY || '';
const POLYGON_BASE_URL = 'https://api.polygon.io';

interface PriceResult {
    price: number;
    change: number;
    changePercent: number;
}

interface FetchOptions {
    maxRetries?: number;
    baseDelayMs?: number;
}

// ============================================================================
// Retry Utility
// ============================================================================

/**
 * Execute a fetch with exponential backoff retry logic
 */
async function fetchWithRetry<T>(
    fetchFn: () => Promise<T | null>,
    options: FetchOptions = {}
): Promise<T | null> {
    const { maxRetries = 3, baseDelayMs = 1000 } = options;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await fetchFn();
            if (result !== null) {
                return result;
            }
        } catch (error) {
            const isLastAttempt = attempt === maxRetries;
            if (isLastAttempt) {
                console.error('All retry attempts exhausted:', error);
                return null;
            }

            // Exponential backoff: 1s, 2s, 4s
            const delay = baseDelayMs * Math.pow(2, attempt);
            console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    return null;
}

// ============================================================================
// Market Hours Check
// ============================================================================

/**
 * Check if US stock market is currently open
 */
function isMarketOpen(): boolean {
    const now = new Date();
    const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const day = et.getDay();
    const hour = et.getHours();
    const minute = et.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    const marketOpen = 9 * 60 + 30;  // 9:30 AM ET
    const marketClose = 16 * 60;      // 4:00 PM ET

    if (day === 0 || day === 6) return false;
    return timeInMinutes >= marketOpen && timeInMinutes < marketClose;
}

// ============================================================================
// Polygon.io Price Fetching (Primary Source for Equities)
// ============================================================================

/**
 * Fetch real-time price from Polygon.io
 * Uses the previous close endpoint for accurate day change calculations
 */
async function fetchPolygonPrice(ticker: string): Promise<PriceResult | null> {
    if (!POLYGON_API_KEY) {
        return null;
    }

    try {
        // Use Polygon's snapshot endpoint for real-time data
        const url = `${POLYGON_BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${POLYGON_API_KEY}`;

        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });

        if (response.status === 429) {
            // Rate limited - throw to trigger retry
            throw new Error('Rate limited by Polygon API');
        }

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const ticker_data = data?.ticker;

        if (!ticker_data) {
            return null;
        }

        // Extract price data from snapshot
        const currentPrice = ticker_data.day?.c || ticker_data.lastTrade?.p || ticker_data.prevDay?.c;
        const previousClose = ticker_data.prevDay?.c;
        const todayChange = ticker_data.todaysChange;
        const todayChangePercent = ticker_data.todaysChangePerc;

        if (currentPrice && currentPrice > 0) {
            return {
                price: currentPrice,
                change: todayChange ?? (previousClose ? currentPrice - previousClose : 0),
                changePercent: todayChangePercent ?? (previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0),
            };
        }
    } catch (error) {
        if ((error as Error).message?.includes('Rate limited')) {
            throw error; // Re-throw to trigger retry
        }
        console.error(`Polygon price error for ${ticker}:`, error);
    }

    return null;
}

// ============================================================================
// Yahoo Finance Price Fetching (Fallback Source)
// ============================================================================

/**
 * Fetch price from Yahoo Finance chart API (fallback)
 */
async function fetchYahooChart(ticker: string): Promise<PriceResult | null> {
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=2d&ts=${Date.now()}`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
            },
            cache: 'no-store',
            next: { revalidate: 0 },
        });

        if (response.ok) {
            const data = await response.json();
            const quote = data?.chart?.result?.[0]?.meta;
            const closes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close;

            if (!quote) return null;

            const currentPrice = quote.regularMarketPrice || closes?.[closes.length - 1] || 0;
            const previousClose = quote.previousClose || quote.chartPreviousClose || closes?.[closes.length - 2] || currentPrice;

            if (currentPrice && currentPrice > 0) {
                const change = currentPrice - previousClose;
                const changePercent = previousClose ? (change / previousClose) * 100 : 0;
                return { price: currentPrice, change, changePercent };
            }
        }
    } catch (e) {
        console.error(`Yahoo chart error for ${ticker}:`, e);
    }
    return null;
}

// ============================================================================
// Bitcoin Price Fetching
// ============================================================================

/**
 * Fetch Bitcoin price from CoinGecko (primary) with Coinbase fallback
 */
async function fetchBitcoin(): Promise<PriceResult | null> {
    // Try CoinGecko first
    try {
        const res = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&ts=${Date.now()}`,
            {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                },
            }
        );
        if (res.ok) {
            const data = await res.json();
            const price = data?.bitcoin?.usd;
            const changePercent = data?.bitcoin?.usd_24h_change || 0;
            if (price) {
                const change = price * (changePercent / 100);
                return { price, change, changePercent };
            }
        }
    } catch (e) {
        console.error('CoinGecko error:', e);
    }

    // Fallback to Coinbase
    try {
        const res = await fetch(`https://api.coinbase.com/v2/prices/BTC-USD/spot?ts=${Date.now()}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
            },
        });
        if (res.ok) {
            const data = await res.json();
            const price = parseFloat(data?.data?.amount);
            if (price > 0) {
                return { price, change: 0, changePercent: 0 };
            }
        }
    } catch (e) {
        console.error('Coinbase error:', e);
    }

    return null;
}

// ============================================================================
// Combined Price Fetching with Fallback
// ============================================================================

/**
 * Fetch price for a single ticker with retry and fallback logic
 * Primary: Polygon.io (for equities)
 * Fallback: Yahoo Finance
 */
async function fetchPriceWithFallback(ticker: string): Promise<PriceResult | null> {
    // Bitcoin uses dedicated fetcher
    if (ticker === 'BTC-USD') {
        return fetchWithRetry(() => fetchBitcoin());
    }

    // For equities: try Polygon first with retry, then fallback to Yahoo
    const polygonResult = await fetchWithRetry(
        () => fetchPolygonPrice(ticker),
        { maxRetries: 2, baseDelayMs: 500 }
    );

    if (polygonResult) {
        return polygonResult;
    }

    // Fallback to Yahoo Finance
    console.log(`Polygon unavailable for ${ticker}, falling back to Yahoo Finance`);
    return fetchWithRetry(
        () => fetchYahooChart(ticker),
        { maxRetries: 2, baseDelayMs: 500 }
    );
}

// ============================================================================
// API Route Handler
// ============================================================================

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const tickersParam = searchParams.get('tickers');

    if (!tickersParam) {
        return NextResponse.json({ error: 'No tickers provided' }, { status: 400 });
    }

    const tickers = tickersParam.split(',').map(t => t.trim().toUpperCase());
    const marketOpen = isMarketOpen();

    // Fetch all prices in parallel with fallback logic
    const pricePromises = tickers.map(async (ticker) => {
        const result = await fetchPriceWithFallback(ticker);
        return { ticker, result };
    });

    const results = await Promise.all(pricePromises);

    const prices: Record<string, { price: number | null; changePercent: number; change: number; isLive: boolean }> = {};
    for (const { ticker, result } of results) {
        prices[ticker] = {
            price: result?.price ?? null,
            change: result?.change ?? 0,
            changePercent: result?.changePercent ?? 0,
            isLive: result?.price !== null && result?.price !== undefined,
        };
    }

    return NextResponse.json({
        prices,
        marketOpen,
        timestamp: new Date().toISOString(),
    }, {
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    });
}
