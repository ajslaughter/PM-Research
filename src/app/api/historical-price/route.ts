import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface HistoricalPriceResult {
    ticker: string;
    price: number | null;
    date: string;
}

// Fetch historical price from Yahoo Finance for a specific date range
async function fetchYahooHistorical(ticker: string, targetDate: string): Promise<number | null> {
    try {
        // Parse the target date and create a range around it (to handle weekends/holidays)
        const target = new Date(targetDate);
        const startDate = new Date(target);
        startDate.setDate(startDate.getDate() - 7); // 7 days before to catch nearest trading day
        const endDate = new Date(target);
        endDate.setDate(endDate.getDate() + 7); // 7 days after

        const period1 = Math.floor(startDate.getTime() / 1000);
        const period2 = Math.floor(endDate.getTime() / 1000);

        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1d`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            },
            cache: 'no-store',
        });

        if (response.ok) {
            const data = await response.json();
            const result = data?.chart?.result?.[0];

            if (!result) return null;

            const timestamps = result.timestamp;
            const closes = result.indicators?.adjclose?.[0]?.adjclose || result.indicators?.quote?.[0]?.close;

            if (!timestamps || !closes || timestamps.length === 0) return null;

            // Find the closest date to our target
            const targetTime = target.getTime() / 1000;
            let closestIndex = 0;
            let closestDiff = Math.abs(timestamps[0] - targetTime);

            for (let i = 1; i < timestamps.length; i++) {
                const diff = Math.abs(timestamps[i] - targetTime);
                if (diff < closestDiff) {
                    closestDiff = diff;
                    closestIndex = i;
                }
            }

            const price = closes[closestIndex];
            return price && price > 0 ? price : null;
        }
    } catch (e) {
        console.error(`Yahoo historical error for ${ticker}:`, e);
    }
    return null;
}

// Fetch historical Bitcoin price from CoinGecko
async function fetchBitcoinHistorical(targetDate: string): Promise<number | null> {
    try {
        // CoinGecko expects date in DD-MM-YYYY format
        const date = new Date(targetDate);
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

        const url = `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${formattedDate}`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-store',
        });

        if (response.ok) {
            const data = await response.json();
            const price = data?.market_data?.current_price?.usd;
            return price && price > 0 ? price : null;
        }
    } catch (e) {
        console.error('CoinGecko historical error:', e);
    }
    return null;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const tickersParam = searchParams.get('tickers');
    const dateParam = searchParams.get('date'); // Expected format: YYYY-MM-DD

    if (!tickersParam) {
        return NextResponse.json({ error: 'No tickers provided' }, { status: 400 });
    }

    if (!dateParam) {
        return NextResponse.json({ error: 'No date provided' }, { status: 400 });
    }

    const tickers = tickersParam.split(',').map(t => t.trim().toUpperCase());

    // Fetch all historical prices in parallel
    const pricePromises = tickers.map(async (ticker): Promise<HistoricalPriceResult> => {
        let price: number | null = null;

        if (ticker === 'BTC-USD') {
            price = await fetchBitcoinHistorical(dateParam);
        } else {
            price = await fetchYahooHistorical(ticker, dateParam);
        }

        return {
            ticker,
            price,
            date: dateParam,
        };
    });

    const results = await Promise.all(pricePromises);

    const prices: Record<string, { price: number | null; date: string }> = {};
    for (const result of results) {
        prices[result.ticker] = {
            price: result.price,
            date: result.date,
        };
    }

    return NextResponse.json({
        prices,
        requestedDate: dateParam,
        timestamp: new Date().toISOString(),
    }, {
        headers: {
            'Cache-Control': 'public, max-age=86400', // Cache for 24 hours since historical data doesn't change
        },
    });
}
