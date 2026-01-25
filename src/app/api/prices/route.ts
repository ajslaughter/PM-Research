import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

interface PriceData {
    price: number;
    previousClose: number;
    source: string;
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

// Source 1: Yahoo Finance v7 API
async function fetchFromYahooV7(tickers: string[]): Promise<Record<string, PriceData | null>> {
    const results: Record<string, PriceData | null> = {};
    if (tickers.length === 0) return results;

    try {
        const symbols = tickers.join(',');
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&crumb=`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Origin': 'https://finance.yahoo.com',
                'Referer': 'https://finance.yahoo.com/',
            },
            cache: 'no-store',
        });

        if (response.ok) {
            const data = await response.json();
            const quotes = data?.quoteResponse?.result || [];
            for (const quote of quotes) {
                if (quote.symbol && quote.regularMarketPrice) {
                    results[quote.symbol] = {
                        price: quote.regularMarketPrice,
                        previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
                        source: 'yahoo-v7'
                    };
                }
            }
        }
    } catch (error) {
        console.error('Yahoo v7 error:', error);
    }
    return results;
}

// Source 2: Yahoo Finance v8 chart API (often works when v7 doesn't)
async function fetchFromYahooV8(tickers: string[]): Promise<Record<string, PriceData | null>> {
    const results: Record<string, PriceData | null> = {};

    // Fetch each ticker individually for v8 chart API
    await Promise.all(tickers.map(async (ticker) => {
        try {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                },
                cache: 'no-store',
            });

            if (response.ok) {
                const data = await response.json();
                const meta = data?.chart?.result?.[0]?.meta;
                if (meta?.regularMarketPrice) {
                    results[ticker] = {
                        price: meta.regularMarketPrice,
                        previousClose: meta.chartPreviousClose || meta.previousClose || meta.regularMarketPrice,
                        source: 'yahoo-v8'
                    };
                }
            }
        } catch (error) {
            console.error(`Yahoo v8 error for ${ticker}:`, error);
        }
    }));

    return results;
}

// Source 3: Finnhub (free tier - 60 calls/min)
async function fetchFromFinnhub(tickers: string[]): Promise<Record<string, PriceData | null>> {
    const results: Record<string, PriceData | null> = {};

    // Finnhub free API (no key needed for basic quote)
    await Promise.all(tickers.map(async (ticker) => {
        try {
            const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}`;
            const response = await fetch(url, {
                headers: {
                    'X-Finnhub-Token': '', // Empty token for free tier
                },
                cache: 'no-store',
            });

            if (response.ok) {
                const data = await response.json();
                // c = current, pc = previous close
                if (data.c && data.c > 0) {
                    results[ticker] = {
                        price: data.c,
                        previousClose: data.pc || data.c,
                        source: 'finnhub'
                    };
                }
            }
        } catch (error) {
            console.error(`Finnhub error for ${ticker}:`, error);
        }
    }));

    return results;
}

// Source 4: Google Finance (scrape from their JSON endpoint)
async function fetchFromGoogle(tickers: string[]): Promise<Record<string, PriceData | null>> {
    const results: Record<string, PriceData | null> = {};

    await Promise.all(tickers.map(async (ticker) => {
        try {
            // Google Finance uses exchange prefixes
            const googleTicker = ticker.includes('-') ? ticker : `NASDAQ:${ticker}`;
            const url = `https://www.google.com/finance/quote/${encodeURIComponent(ticker)}:NASDAQ`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html',
                },
                cache: 'no-store',
            });

            if (response.ok) {
                const html = await response.text();
                // Extract price from the page - look for data-last-price attribute
                const priceMatch = html.match(/data-last-price="([0-9.]+)"/);
                const prevCloseMatch = html.match(/data-previous-close="([0-9.]+)"/);

                if (priceMatch) {
                    const price = parseFloat(priceMatch[1]);
                    const prevClose = prevCloseMatch ? parseFloat(prevCloseMatch[1]) : price;
                    if (price > 0) {
                        results[ticker] = {
                            price,
                            previousClose: prevClose,
                            source: 'google'
                        };
                    }
                }
            }
        } catch (error) {
            console.error(`Google Finance error for ${ticker}:`, error);
        }
    }));

    return results;
}

// Source 5: Stockdata.org (free tier available)
async function fetchFromStockdata(tickers: string[]): Promise<Record<string, PriceData | null>> {
    const results: Record<string, PriceData | null> = {};

    try {
        const symbols = tickers.join(',');
        const url = `https://api.stockdata.org/v1/data/quote?symbols=${encodeURIComponent(symbols)}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
            cache: 'no-store',
        });

        if (response.ok) {
            const data = await response.json();
            if (data.data) {
                for (const quote of data.data) {
                    if (quote.ticker && quote.price) {
                        results[quote.ticker] = {
                            price: quote.price,
                            previousClose: quote.previous_close_price || quote.price,
                            source: 'stockdata'
                        };
                    }
                }
            }
        }
    } catch (error) {
        console.error('Stockdata error:', error);
    }
    return results;
}

// Fetch Bitcoin from multiple sources
async function fetchBitcoin(): Promise<PriceData | null> {
    // Try CoinGecko first
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
            { cache: 'no-store' }
        );

        if (response.ok) {
            const data = await response.json();
            const price = data?.bitcoin?.usd;
            if (price) {
                const change24h = data?.bitcoin?.usd_24h_change || 0;
                const previousClose = price / (1 + change24h / 100);
                return { price, previousClose, source: 'coingecko' };
            }
        }
    } catch (error) {
        console.error('CoinGecko error:', error);
    }

    // Fallback to Coinbase
    try {
        const response = await fetch(
            'https://api.coinbase.com/v2/prices/BTC-USD/spot',
            { cache: 'no-store' }
        );

        if (response.ok) {
            const data = await response.json();
            const price = parseFloat(data?.data?.amount);
            if (price) {
                return { price, previousClose: price, source: 'coinbase' };
            }
        }
    } catch (error) {
        console.error('Coinbase error:', error);
    }

    // Fallback to Blockchain.info
    try {
        const response = await fetch(
            'https://blockchain.info/ticker',
            { cache: 'no-store' }
        );

        if (response.ok) {
            const data = await response.json();
            const price = data?.USD?.last;
            if (price) {
                return { price, previousClose: price, source: 'blockchain' };
            }
        }
    } catch (error) {
        console.error('Blockchain.info error:', error);
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

    // Separate BTC from stock tickers
    const stockTickers = tickers.filter(t => t !== 'BTC-USD');
    const hasBTC = tickers.includes('BTC-USD');

    // Try multiple sources in parallel, then merge results
    const [yahooV7, yahooV8, btcResult] = await Promise.all([
        fetchFromYahooV7(stockTickers),
        fetchFromYahooV8(stockTickers),
        hasBTC ? fetchBitcoin() : Promise.resolve(null),
    ]);

    // Merge results - prefer yahoo v7, fallback to v8
    let allResults: Record<string, PriceData | null> = { ...yahooV8, ...yahooV7 };

    // Find missing tickers and try additional sources
    const missingTickers = stockTickers.filter(t => !allResults[t] || allResults[t] === null);

    if (missingTickers.length > 0) {
        // Try Google Finance for missing tickers
        const googleResults = await fetchFromGoogle(missingTickers);
        allResults = { ...allResults, ...googleResults };

        // Still missing? Try Finnhub
        const stillMissing = missingTickers.filter(t => !allResults[t] || allResults[t] === null);
        if (stillMissing.length > 0) {
            const finnhubResults = await fetchFromFinnhub(stillMissing);
            allResults = { ...allResults, ...finnhubResults };
        }
    }

    // Build final prices response
    const prices: Record<string, number | null> = {};
    const sources: Record<string, string> = {};

    for (const ticker of tickers) {
        if (ticker === 'BTC-USD') {
            if (btcResult) {
                prices[ticker] = btcResult.price;
                sources[ticker] = btcResult.source;
            } else {
                prices[ticker] = null;
            }
        } else {
            const data = allResults[ticker];
            if (data) {
                prices[ticker] = data.price;
                sources[ticker] = data.source;
            } else {
                prices[ticker] = null;
            }
        }
    }

    return NextResponse.json({
        prices,
        sources, // Include which API provided each price
        marketOpen,
        timestamp: new Date().toISOString(),
    });
}
