import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PriceResult {
  price: number;
  change: number;
  changePercent: number;
}

interface CacheEntry {
  data: Record<string, PriceResult | null>;
  timestamp: number;
}

interface MarketCapCacheEntry {
  data: Record<string, number | null>;
  timestamp: number;
}

// Server-side cache - 30 second TTL
// WARNING: In-memory cache is unreliable in serverless environments (Vercel/Netlify).
// Each function invocation may get a fresh instance, resetting this cache.
// For production reliability, migrate to an external store (e.g., Vercel KV / Upstash Redis).
const CACHE_TTL_MS = 30 * 1000;
const MARKET_CAP_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let priceCache: CacheEntry | null = null;
let marketCapCache: MarketCapCacheEntry | null = null;

/**
 * Check if US stock market is currently open
 * Market hours: 9:30 AM - 4:00 PM ET, Monday-Friday
 */
function isMarketOpen(): boolean {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay();
  const hour = et.getHours();
  const minute = et.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  const marketOpen = 9 * 60 + 30; // 9:30 AM
  const marketClose = 16 * 60;     // 4:00 PM

  // Weekend check
  if (day === 0 || day === 6) return false;

  return timeInMinutes >= marketOpen && timeInMinutes < marketClose;
}

/**
 * Fetch stock prices from Alpaca Markets (IEX feed)
 * Uses the snapshots endpoint to get current price AND previous day's close in one call
 */
async function fetchAlpacaStocks(tickers: string[]): Promise<Record<string, PriceResult | null>> {
  const results: Record<string, PriceResult | null> = {};

  if (tickers.length === 0) return results;

  // Sanitize API keys to prevent Headers errors from newlines/whitespace
  const apiKey = (process.env.ALPACA_API_KEY_ID || '').trim().replace(/[\r\n]/g, '');
  const apiSecret = (process.env.ALPACA_API_SECRET_KEY || '').trim().replace(/[\r\n]/g, '');

  if (!apiKey || !apiSecret) {
    console.error('Alpaca API credentials not configured');
    // Fallback to Yahoo Finance if Alpaca not configured
    return fetchYahooFallback(tickers);
  }

  try {
    // Alpaca Data API v2 - Snapshots endpoint (returns latestTrade, dailyBar, prevDailyBar in one call)
    const tickerParam = tickers.join(',');
    const url = `https://data.alpaca.markets/v2/stocks/snapshots?symbols=${tickerParam}&feed=iex`;

    const response = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Alpaca snapshots API error: ${response.status}`);
      return fetchYahooFallback(tickers);
    }

    const snapshots = await response.json();

    // Process each ticker
    for (const ticker of tickers) {
      const snapshot = snapshots[ticker];

      if (snapshot) {
        // Use latest trade price (most accurate), fall back to daily bar close, then quote midpoint
        const latestTrade = snapshot.latestTrade?.p || 0;
        const dailyBarClose = snapshot.dailyBar?.c || 0;
        const quoteMid = snapshot.latestQuote
          ? ((snapshot.latestQuote.ap || 0) + (snapshot.latestQuote.bp || 0)) / 2
          : 0;
        const price = latestTrade || dailyBarClose || quoteMid || 0;

        // Previous day's close from prevDailyBar - this is the actual previous trading day close
        const previousClose = snapshot.prevDailyBar?.c || 0;

        if (price > 0 && previousClose > 0) {
          const change = price - previousClose;
          const changePercent = (change / previousClose) * 100;
          results[ticker] = { price, change, changePercent };
        } else if (price > 0) {
          // Have price but no previous close - return price with 0 change
          results[ticker] = { price, change: 0, changePercent: 0 };
        } else {
          results[ticker] = null;
        }
      } else {
        results[ticker] = null;
      }
    }
  } catch (error) {
    console.error('Alpaca fetch error:', error);
    return fetchYahooFallback(tickers);
  }

  return results;
}

/**
 * Yahoo Finance fallback for when Alpaca is not available
 */
async function fetchYahooFallback(tickers: string[]): Promise<Record<string, PriceResult | null>> {
  const results: Record<string, PriceResult | null> = {};

  await Promise.all(
    tickers.map(async (ticker) => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=2d`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          const quote = data?.chart?.result?.[0]?.meta;
          const closes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close;

          if (quote) {
            const currentPrice = quote.regularMarketPrice || closes?.[closes.length - 1] || 0;
            const previousClose = quote.previousClose || quote.chartPreviousClose || closes?.[closes.length - 2] || currentPrice;

            if (currentPrice && currentPrice > 0) {
              const change = currentPrice - previousClose;
              const changePercent = previousClose ? (change / previousClose) * 100 : 0;
              results[ticker] = { price: currentPrice, change, changePercent };
              return;
            }
          }
        }
      } catch (e) {
        console.error(`Yahoo fallback error for ${ticker}:`, e);
      }
      results[ticker] = null;
    })
  );

  return results;
}

/**
 * Fetch Bitcoin price from CoinGecko
 * Falls back to Coinbase if CoinGecko fails
 */
async function fetchBitcoin(): Promise<PriceResult | null> {
  // Sanitize API key to prevent Headers errors
  const coinGeckoApiKey = (process.env.COINGECKO_API_KEY || '').trim().replace(/[\r\n]/g, '');

  // Try CoinGecko first (with API key for better rate limits)
  try {
    const headers: HeadersInit = { 'Accept': 'application/json' };
    if (coinGeckoApiKey) {
      headers['x-cg-demo-api-key'] = coinGeckoApiKey;
    }

    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
      { cache: 'no-store', headers }
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
    const res = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot', {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const price = parseFloat(data?.data?.amount);

      if (price > 0) {
        // Coinbase doesn't provide 24h change, so we return 0
        return { price, change: 0, changePercent: 0 };
      }
    }
  } catch (e) {
    console.error('Coinbase error:', e);
  }

  return null;
}

/**
 * Fetch market caps using multiple data sources with fallbacks.
 * Uses a separate 5-minute cache since market cap changes slowly.
 *
 * Strategy:
 * 1. Yahoo Finance batch quote (v7 via query2, then query1)
 * 2. Yahoo Finance per-ticker quoteSummary (v10) for any missing
 * 3. Polygon.io Ticker Details for any still missing (if API key available)
 * 4. CoinGecko for crypto tickers (BTC-USD)
 */
async function fetchMarketCaps(tickers: string[]): Promise<Record<string, number | null>> {
  // Check market cap cache
  if (marketCapCache) {
    const now = Date.now();
    if (now - marketCapCache.timestamp < MARKET_CAP_CACHE_TTL_MS) {
      const allCached = tickers.every(t => t in marketCapCache!.data);
      if (allCached) {
        const cached: Record<string, number | null> = {};
        for (const t of tickers) {
          cached[t] = marketCapCache.data[t] ?? null;
        }
        return cached;
      }
    }
  }

  const results: Record<string, number | null> = {};

  if (tickers.length === 0) return results;

  // Separate stock tickers from crypto
  const stockTickers = tickers.filter(t => !t.includes('-USD'));
  const cryptoTickers = tickers.filter(t => t.includes('-USD'));

  const YAHOO_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

  // --- Stock market caps ---
  if (stockTickers.length > 0) {
    const symbols = stockTickers.join(',');
    let batchSuccess = false;

    // Strategy 1: Yahoo Finance batch quote endpoint (try query2 then query1)
    const batchUrls = [
      `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`,
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`,
    ];

    for (const url of batchUrls) {
      if (batchSuccess) break;
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': YAHOO_UA,
            'Accept': 'application/json',
          },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          const quotes = data?.quoteResponse?.result || [];

          for (const quote of quotes) {
            if (quote.symbol && typeof quote.marketCap === 'number' && quote.marketCap > 0) {
              results[quote.symbol] = quote.marketCap;
            }
          }

          // Consider it a success if we got at least one result
          if (Object.keys(results).length > 0) {
            batchSuccess = true;
          }
        }
      } catch (error) {
        console.error(`Market cap batch fetch error:`, error);
      }
    }

    // Strategy 2: Yahoo Finance per-ticker quoteSummary (v10) for missing tickers
    const missingAfterBatch = stockTickers.filter(t => !(t in results) || results[t] === null);

    if (missingAfterBatch.length > 0) {
      await Promise.all(
        missingAfterBatch.map(async (ticker) => {
          try {
            const response = await fetch(
              `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price`,
              {
                headers: {
                  'User-Agent': YAHOO_UA,
                  'Accept': 'application/json',
                },
                cache: 'no-store',
              }
            );

            if (response.ok) {
              const data = await response.json();
              const marketCap = data?.quoteSummary?.result?.[0]?.price?.marketCap?.raw;
              if (typeof marketCap === 'number' && marketCap > 0) {
                results[ticker] = marketCap;
              }
            }
          } catch (error) {
            console.error(`Market cap quoteSummary error for ${ticker}:`, error);
          }
        })
      );
    }

    // Strategy 3: Polygon.io Ticker Details fallback for any still missing
    const polygonApiKey = (process.env.POLYGON_API_KEY || '').trim();
    const missingAfterYahoo = stockTickers.filter(t => !(t in results) || results[t] === null);

    if (missingAfterYahoo.length > 0 && polygonApiKey) {
      await Promise.all(
        missingAfterYahoo.map(async (ticker) => {
          try {
            const response = await fetch(
              `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${polygonApiKey}`,
              { cache: 'no-store' }
            );

            if (response.ok) {
              const data = await response.json();
              const marketCap = data?.results?.market_cap;
              if (typeof marketCap === 'number' && marketCap > 0) {
                results[ticker] = marketCap;
              }
            }
          } catch (error) {
            console.error(`Polygon market cap error for ${ticker}:`, error);
          }
        })
      );
    }
  }

  // --- Crypto market caps via CoinGecko ---
  if (cryptoTickers.includes('BTC-USD')) {
    try {
      const coinGeckoApiKey = (process.env.COINGECKO_API_KEY || '').trim().replace(/[\r\n]/g, '');
      const headers: HeadersInit = { 'Accept': 'application/json' };
      if (coinGeckoApiKey) {
        headers['x-cg-demo-api-key'] = coinGeckoApiKey;
      }

      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true',
        { cache: 'no-store', headers }
      );

      if (res.ok) {
        const data = await res.json();
        const btcMarketCap = data?.bitcoin?.usd_market_cap;
        if (typeof btcMarketCap === 'number' && btcMarketCap > 0) {
          results['BTC-USD'] = btcMarketCap;
        }
      }
    } catch (error) {
      console.error('CoinGecko market cap fetch error:', error);
    }
  }

  // Fill missing tickers with null
  for (const ticker of tickers) {
    if (!(ticker in results)) {
      results[ticker] = null;
    }
  }

  // Update cache
  marketCapCache = {
    data: { ...(marketCapCache?.data || {}), ...results },
    timestamp: Date.now(),
  };

  return results;
}

/**
 * Check if cache is still valid
 */
function isCacheValid(requestedTickers: string[]): boolean {
  if (!priceCache) return false;

  const now = Date.now();
  if (now - priceCache.timestamp > CACHE_TTL_MS) return false;

  // Check if all requested tickers are in cache
  for (const ticker of requestedTickers) {
    if (!(ticker in priceCache.data)) return false;
  }

  return true;
}

/**
 * GET /api/prices?tickers=AAPL,MSFT,BTC-USD
 *
 * Fetches real-time prices with server-side caching:
 * - Stocks: Alpaca Markets (IEX feed) - batched request
 * - Crypto: CoinGecko with Coinbase fallback
 * - Cache: 30 seconds to prevent redundant API calls
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tickersParam = searchParams.get('tickers');

  if (!tickersParam) {
    return NextResponse.json({ error: 'No tickers provided' }, { status: 400 });
  }

  const tickers = tickersParam.split(',').map((t: string) => t.trim().toUpperCase());
  const marketOpen = isMarketOpen();

  // Fetch market caps in parallel (uses its own 5-min cache)
  const marketCapsPromise = fetchMarketCaps(tickers);

  // Check price cache first
  if (isCacheValid(tickers)) {
    const marketCaps = await marketCapsPromise;
    const cachedPrices: Record<string, { price: number | null; change: number; changePercent: number; marketCap: number | null; isLive: boolean }> = {};

    for (const ticker of tickers) {
      const cached = priceCache!.data[ticker];
      cachedPrices[ticker] = {
        price: cached?.price ?? null,
        change: cached?.change ?? 0,
        changePercent: cached?.changePercent ?? 0,
        marketCap: marketCaps[ticker] ?? null,
        isLive: cached !== null,
      };
    }

    return NextResponse.json({
      prices: cachedPrices,
      marketOpen,
      timestamp: new Date().toISOString(),
      cached: true,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  }

  // Separate stock and crypto tickers
  const stockTickers = tickers.filter((t: string) => !t.includes('-USD'));
  const cryptoTickers = tickers.filter((t: string) => t.includes('-USD'));

  // Fetch in parallel
  const [stockPrices, btcPrice, marketCaps] = await Promise.all([
    fetchAlpacaStocks(stockTickers),
    cryptoTickers.includes('BTC-USD') ? fetchBitcoin() : Promise.resolve(null),
    marketCapsPromise,
  ]);

  // Combine results
  const allPrices: Record<string, PriceResult | null> = { ...stockPrices };

  if (cryptoTickers.includes('BTC-USD')) {
    allPrices['BTC-USD'] = btcPrice;
  }

  // Update cache
  priceCache = {
    data: { ...(priceCache?.data || {}), ...allPrices },
    timestamp: Date.now(),
  };

  // Format response
  const prices: Record<string, { price: number | null; change: number; changePercent: number; marketCap: number | null; isLive: boolean }> = {};

  for (const ticker of tickers) {
    const result = allPrices[ticker];
    prices[ticker] = {
      price: result?.price ?? null,
      change: result?.change ?? 0,
      changePercent: result?.changePercent ?? 0,
      marketCap: marketCaps[ticker] ?? null,
      isLive: result !== null,
    };
  }

  return NextResponse.json({
    prices,
    marketOpen,
    timestamp: new Date().toISOString(),
    cached: false,
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}
