import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface PriceData {
    price: number;
    changePercent: number;
}

// Per-ticker cache
let priceCache: Record<string, { data: PriceData; timestamp: number }> = {};
const CACHE_TTL_MS = 60000; // 1 minute

// Fetch Bitcoin from CoinGecko
async function fetchBitcoin(): Promise<PriceData | null> {
    try {
        const res = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
            { cache: 'no-store' }
        );
        if (res.ok) {
            const data = await res.json();
            if (data.bitcoin) {
                return {
                    price: data.bitcoin.usd,
                    changePercent: data.bitcoin.usd_24h_change || 0
                };
            }
        }
    } catch (e) {
        console.error("CoinGecko error:", e);
    }
    return null;
}

// Try multiple Yahoo endpoints with different approaches
async function fetchFromYahoo(symbols: string[]): Promise<Record<string, PriceData>> {
    const results: Record<string, PriceData> = {};
    const symbolList = symbols.join(',');

    // Method 1: v7 quote with crumb-less approach
    try {
        const url1 = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolList)}&fields=regularMarketPrice,regularMarketChangePercent`;
        const res1 = await fetch(url1, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            cache: 'no-store'
        });

        if (res1.ok) {
            const data = await res1.json();
            const quotes = data.quoteResponse?.result || [];
            for (const q of quotes) {
                if (q.symbol && q.regularMarketPrice) {
                    results[q.symbol] = {
                        price: q.regularMarketPrice,
                        changePercent: q.regularMarketChangePercent || 0
                    };
                }
            }
        }
    } catch (e) {
        console.error("Yahoo v7 error:", e);
    }

    // Method 2: v8 spark for any missing symbols
    const missing1 = symbols.filter(s => !(s in results));
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
                                changePercent: prev ? ((m.regularMarketPrice - prev) / prev) * 100 : 0
                            };
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Yahoo v8 spark error:", e);
        }
    }

    // Method 3: query1 endpoint for any still missing
    const missing2 = symbols.filter(s => !(s in results));
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
                            changePercent: q.regularMarketChangePercent || 0
                        };
                    }
                }
            }
        } catch (e) {
            console.error("Yahoo query1 error:", e);
        }
    }

    return results;
}

// Fallback: Try Alpha Vantage for individual stocks (demo key has limits but works)
async function fetchFromAlphaVantage(symbol: string): Promise<PriceData | null> {
    try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=demo`;
        const res = await fetch(url, { cache: 'no-store' });

        if (res.ok) {
            const data = await res.json();
            const quote = data["Global Quote"];
            if (quote && quote["05. price"]) {
                return {
                    price: parseFloat(quote["05. price"]),
                    changePercent: parseFloat((quote["10. change percent"] || "0%").replace('%', ''))
                };
            }
        }
    } catch (e) {
        console.error(`Alpha Vantage error for ${symbol}:`, e);
    }
    return null;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const tickerParam = searchParams.get('tickers');
        const forceRefresh = searchParams.get('refresh') === 'true';

        const defaultTickers = ["NVDA", "MSFT", "AAPL", "GOOGL", "AMZN", "META", "TSLA", "BTC-USD"];
        const allTickers = tickerParam ? tickerParam.split(',').map(t => t.trim()) : defaultTickers;

        const now = Date.now();
        const results: Record<string, PriceData> = {};
        const tickersToFetch: string[] = [];

        // Check cache first
        for (const ticker of allTickers) {
            const cached = priceCache[ticker];
            if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_TTL_MS) {
                results[ticker] = cached.data;
            } else {
                tickersToFetch.push(ticker);
            }
        }

        if (tickersToFetch.length > 0) {
            // Separate BTC from stocks
            const hasBTC = tickersToFetch.includes('BTC-USD');
            const stockTickers = tickersToFetch.filter(t => t !== 'BTC-USD');

            // Fetch stocks from Yahoo (parallel with BTC)
            const [yahooData, btcData] = await Promise.all([
                stockTickers.length > 0 ? fetchFromYahoo(stockTickers) : {},
                hasBTC ? fetchBitcoin() : null
            ]);

            // Add Yahoo results
            for (const [symbol, data] of Object.entries(yahooData)) {
                results[symbol] = data;
                priceCache[symbol] = { data, timestamp: now };
            }

            // Add BTC
            if (hasBTC && btcData) {
                results['BTC-USD'] = btcData;
                priceCache['BTC-USD'] = { data: btcData, timestamp: now };
            }

            // Try Alpha Vantage for any stocks still missing (rate limited, so only first few)
            const stillMissing = stockTickers.filter(s => !(s in results)).slice(0, 3);
            for (const symbol of stillMissing) {
                const avData = await fetchFromAlphaVantage(symbol);
                if (avData) {
                    results[symbol] = avData;
                    priceCache[symbol] = { data: avData, timestamp: now };
                }
                // Small delay to respect rate limits
                await new Promise(r => setTimeout(r, 300));
            }
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error("Price fetch error:", error);

        // Return cached on error
        const fallback: Record<string, PriceData> = {};
        for (const [symbol, cached] of Object.entries(priceCache)) {
            fallback[symbol] = cached.data;
        }

        if (Object.keys(fallback).length > 0) {
            return NextResponse.json(fallback);
        }

        return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
    }
}
