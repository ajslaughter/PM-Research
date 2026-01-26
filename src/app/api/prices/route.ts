import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PriceResult {
    price: number;
    change: number;
    changePercent: number;
}

// Check if US stock market is currently open
function isMarketOpen(): boolean {
    const now = new Date();
    const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const day = et.getDay();
    const hour = et.getHours();
    const minute = et.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    const marketOpen = 9 * 60 + 30;  // 9:30 AM
    const marketClose = 16 * 60;      // 4:00 PM

    if (day === 0 || day === 6) return false;
    return timeInMinutes >= marketOpen && timeInMinutes < marketClose;
}

// Fetch single stock from Yahoo v8 chart API with change data
async function fetchYahooChart(ticker: string): Promise<PriceResult | null> {
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=2d`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
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

// Fetch Bitcoin price with 24h change
async function fetchBitcoin(): Promise<PriceResult | null> {
    // Try CoinGecko with 24h change
    try {
        const res = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
            { cache: 'no-store' }
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

    // Try Coinbase (no change data available, return 0)
    try {
        const res = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot', { cache: 'no-store' });
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

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const tickersParam = searchParams.get('tickers');

    if (!tickersParam) {
        return NextResponse.json({ error: 'No tickers provided' }, { status: 400 });
    }

    const tickers = tickersParam.split(',').map(t => t.trim().toUpperCase());
    const marketOpen = isMarketOpen();

    // Fetch all prices in parallel
    const pricePromises = tickers.map(async (ticker) => {
        if (ticker === 'BTC-USD') {
            return { ticker, result: await fetchBitcoin() };
        }
        return { ticker, result: await fetchYahooChart(ticker) };
    });

    const results = await Promise.all(pricePromises);

    const prices: Record<string, { price: number | null; changePercent: number }> = {};
    for (const { ticker, result } of results) {
        prices[ticker] = {
            price: result?.price ?? null,
            changePercent: result?.changePercent ?? 0,
        };
    }

    return NextResponse.json({
        prices,
        marketOpen,
        timestamp: new Date().toISOString(),
    }, {
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
    });
}
