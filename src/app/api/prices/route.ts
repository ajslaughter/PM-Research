import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface PriceData {
    price: number;
    changePercent: number;
}

// In-memory cache - stores ALL fetched tickers
let priceCache: Record<string, { data: PriceData; timestamp: number }> = {};
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

// Fetch stocks from Yahoo Finance - try v7 quote API first (more reliable)
async function fetchStocks(symbols: string[]): Promise<Record<string, PriceData>> {
    const results: Record<string, PriceData> = {};

    if (symbols.length === 0) return results;

    const symbolList = symbols.join(',');

    try {
        // Try v7 quote API first - most reliable
        const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolList)}`;
        const quoteRes = await fetch(quoteUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
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

        // If v7 quote didn't return all symbols, try v8 spark API
        const missedSymbols = symbols.filter(s => !(s in results));
        if (missedSymbols.length > 0) {
            const sparkUrl = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${encodeURIComponent(missedSymbols.join(','))}&range=1d&interval=1d`;
            const sparkRes = await fetch(sparkUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                },
                cache: 'no-store'
            });

            if (sparkRes.ok) {
                const sparkData = await sparkRes.json();

                for (const symbol of missedSymbols) {
                    const result = sparkData.spark?.result?.find((r: { symbol: string }) => r.symbol === symbol);
                    if (result?.response?.[0]?.meta) {
                        const meta = result.response[0].meta;
                        const price = meta.regularMarketPrice || meta.previousClose;
                        const prevClose = meta.chartPreviousClose || meta.previousClose;

                        if (price) {
                            const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
                            results[symbol] = { price, changePercent };
                        }
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

        // Check which tickers need fresh data
        const results: Record<string, PriceData> = {};
        const tickersToFetch: string[] = [];

        for (const ticker of allTickers) {
            const cached = priceCache[ticker];
            if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_TTL_MS) {
                results[ticker] = cached.data;
            } else {
                tickersToFetch.push(ticker);
            }
        }

        // Fetch any missing/stale tickers
        if (tickersToFetch.length > 0) {
            const hasBTC = tickersToFetch.includes('BTC-USD');
            const stockTickers = tickersToFetch.filter(t => t !== 'BTC-USD');

            // Fetch in parallel
            const [stockData, btcData] = await Promise.all([
                stockTickers.length > 0 ? fetchStocks(stockTickers) : {},
                hasBTC ? fetchBitcoin() : null
            ]);

            // Add stock results
            for (const [symbol, data] of Object.entries(stockData)) {
                results[symbol] = data;
                priceCache[symbol] = { data, timestamp: now };
            }

            // Add BTC result
            if (hasBTC && btcData) {
                results['BTC-USD'] = btcData;
                priceCache['BTC-USD'] = { data: btcData, timestamp: now };
            }
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error("Price fetch error:", error);

        // Return any cached data on error
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
