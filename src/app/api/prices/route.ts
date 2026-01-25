import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface PriceData {
    price: number;
    changePercent: number;
}

// In-memory cache
let cache: { data: Record<string, PriceData>; timestamp: number } | null = null;
const CACHE_TTL_MS = 60000; // 1 minute

// Fetch Bitcoin from CoinGecko (free, real-time, no rate limits)
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

// Fetch all stocks in ONE request from Yahoo Finance
async function fetchStocks(symbols: string[]): Promise<Record<string, PriceData>> {
    const results: Record<string, PriceData> = {};

    if (symbols.length === 0) return results;

    try {
        // Yahoo Finance v8 API - supports batch requests
        const symbolList = symbols.join(',');
        const url = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${encodeURIComponent(symbolList)}&range=1d&interval=1d`;

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            cache: 'no-store'
        });

        if (res.ok) {
            const data = await res.json();

            // Parse spark data
            for (const symbol of symbols) {
                const sparkData = data.spark?.result?.find((r: { symbol: string }) => r.symbol === symbol);
                if (sparkData?.response?.[0]?.meta) {
                    const meta = sparkData.response[0].meta;
                    const price = meta.regularMarketPrice || meta.previousClose;
                    const prevClose = meta.chartPreviousClose || meta.previousClose;

                    if (price) {
                        const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
                        results[symbol] = { price, changePercent };
                    }
                }
            }
        }

        // If Yahoo spark failed, try the quote endpoint
        if (Object.keys(results).length === 0) {
            const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolList)}`;
            const quoteRes = await fetch(quoteUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                },
                cache: 'no-store'
            });

            if (quoteRes.ok) {
                const quoteData = await quoteRes.json();
                const quotes = quoteData.quoteResponse?.result || [];

                for (const quote of quotes) {
                    if (quote.symbol && quote.regularMarketPrice) {
                        results[quote.symbol] = {
                            price: quote.regularMarketPrice,
                            changePercent: quote.regularMarketChangePercent || 0
                        };
                    }
                }
            }
        }
    } catch (e) {
        console.error("Yahoo Finance error:", e);
    }

    return results;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const tickerParam = searchParams.get('tickers');
        const forceRefresh = searchParams.get('refresh') === 'true';

        const defaultTickers = ["NVDA", "MSFT", "AAPL", "GOOGL", "AMZN", "META", "TSLA", "BTC-USD"];
        const allTickers = tickerParam ? tickerParam.split(',').map(t => t.trim()) : defaultTickers;

        const now = Date.now();

        // Return cached if fresh
        if (!forceRefresh && cache && (now - cache.timestamp) < CACHE_TTL_MS) {
            const allPresent = allTickers.every(t => t in cache!.data);
            if (allPresent) {
                const result: Record<string, PriceData> = {};
                allTickers.forEach(t => { if (cache!.data[t]) result[t] = cache!.data[t]; });
                return NextResponse.json(result);
            }
        }

        // Separate BTC from stocks
        const hasBTC = allTickers.includes('BTC-USD');
        const stockTickers = allTickers.filter(t => t !== 'BTC-USD');

        // Fetch in parallel
        const [stockData, btcData] = await Promise.all([
            fetchStocks(stockTickers),
            hasBTC ? fetchBitcoin() : null
        ]);

        // Combine results
        const results: Record<string, PriceData> = { ...stockData };
        if (hasBTC && btcData) {
            results['BTC-USD'] = btcData;
        }

        // Update cache
        cache = {
            data: { ...(cache?.data || {}), ...results },
            timestamp: now
        };

        return NextResponse.json(results);
    } catch (error) {
        console.error("Price fetch error:", error);

        // Return cached on error
        if (cache) return NextResponse.json(cache.data);

        return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
    }
}
