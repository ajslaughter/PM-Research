import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

interface PriceData {
    price: number;
    previousClose: number;
}

// Check if US stock market is currently open
function isMarketOpen(): boolean {
    const now = new Date();
    const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const day = et.getDay();
    const hour = et.getHours();
    const minute = et.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    // Market hours: Mon-Fri, 9:30 AM - 4:00 PM ET
    const marketOpen = 9 * 60 + 30;  // 9:30 AM
    const marketClose = 16 * 60;      // 4:00 PM

    // Check if weekday and within market hours
    if (day === 0 || day === 6) return false; // Weekend
    return timeInMinutes >= marketOpen && timeInMinutes < marketClose;
}

// Fetch from Yahoo Finance
async function fetchFromYahoo(tickers: string[]): Promise<Record<string, PriceData | null>> {
    const results: Record<string, PriceData | null> = {};

    // Filter out BTC-USD for separate handling
    const stockTickers = tickers.filter(t => t !== 'BTC-USD');

    if (stockTickers.length > 0) {
        // Method 1: Try v7 quote endpoint
        try {
            const symbols = stockTickers.join(',');
            const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                cache: 'no-store'
            });

            if (response.ok) {
                const data = await response.json();
                const quotes = data?.quoteResponse?.result || [];

                for (const quote of quotes) {
                    const ticker = quote.symbol;
                    const regularMarketPrice = quote.regularMarketPrice;
                    const previousClose = quote.regularMarketPreviousClose || quote.previousClose;

                    if (regularMarketPrice) {
                        results[ticker] = {
                            price: regularMarketPrice,
                            previousClose: previousClose || regularMarketPrice
                        };
                    }
                }
            }
        } catch (error) {
            console.error('Yahoo Finance v7 error:', error);
        }

        // Method 2: Try v8 spark for missing symbols
        const missing1 = stockTickers.filter(s => !results[s]);
        if (missing1.length > 0) {
            try {
                const url2 = `https://query2.finance.yahoo.com/v8/finance/spark?symbols=${encodeURIComponent(missing1.join(','))}&range=1d&interval=1d`;
                const res2 = await fetch(url2, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    cache: 'no-store'
                });

                if (res2.ok) {
                    const data = await res2.json();
                    for (const sym of missing1) {
                        const r = data.spark?.result?.find((x: { symbol: string }) => x.symbol === sym);
                        if (r?.response?.[0]?.meta) {
                            const m = r.response[0].meta;
                            if (m.regularMarketPrice) {
                                const prev = m.chartPreviousClose || m.previousClose || m.regularMarketPrice;
                                results[sym] = {
                                    price: m.regularMarketPrice,
                                    previousClose: prev
                                };
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Yahoo v8 spark error:', error);
            }
        }

        // Method 3: Try query1 endpoint for any still missing
        const missing2 = stockTickers.filter(s => !results[s]);
        if (missing2.length > 0) {
            try {
                const url3 = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(missing2.join(','))}`;
                const res3 = await fetch(url3, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    },
                    cache: 'no-store'
                });

                if (res3.ok) {
                    const data = await res3.json();
                    const quotes = data.quoteResponse?.result || [];
                    for (const q of quotes) {
                        if (q.symbol && q.regularMarketPrice) {
                            results[q.symbol] = {
                                price: q.regularMarketPrice,
                                previousClose: q.regularMarketPreviousClose || q.previousClose || q.regularMarketPrice
                            };
                        }
                    }
                }
            } catch (error) {
                console.error('Yahoo query1 error:', error);
            }
        }
    }

    // Mark remaining tickers as null
    for (const ticker of stockTickers) {
        if (!results[ticker]) {
            results[ticker] = null;
        }
    }

    return results;
}

// Fetch Bitcoin from CoinGecko
async function fetchBitcoin(): Promise<PriceData | null> {
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
            { cache: 'no-store' }
        );

        if (response.ok) {
            const data = await response.json();
            const price = data?.bitcoin?.usd;
            if (price) {
                // Estimate previous close from 24hr change
                const change24h = data?.bitcoin?.usd_24h_change || 0;
                const previousClose = price / (1 + change24h / 100);
                return { price, previousClose };
            }
        }
    } catch (error) {
        console.error('CoinGecko error:', error);
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

    // Fetch all prices
    const [yahooResults, btcResult] = await Promise.all([
        fetchFromYahoo(tickers),
        tickers.includes('BTC-USD') ? fetchBitcoin() : Promise.resolve(null)
    ]);

    // Combine results - use live price if market open, otherwise previous close
    const prices: Record<string, number | null> = {};

    for (const ticker of tickers) {
        if (ticker === 'BTC-USD') {
            if (btcResult) {
                // BTC trades 24/7, always use current price
                prices[ticker] = btcResult.price;
            } else {
                prices[ticker] = null;
            }
        } else {
            const data = yahooResults[ticker];
            if (data) {
                // Use live price if market open, otherwise previous close
                prices[ticker] = marketOpen ? data.price : data.previousClose;
            } else {
                prices[ticker] = null;
            }
        }
    }

    return NextResponse.json({
        prices,
        marketOpen,
        timestamp: new Date().toISOString(),
    });
}
