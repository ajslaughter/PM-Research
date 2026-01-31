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

// Server-side cache - 30 second TTL
const CACHE_TTL_MS = 30 * 1000;
let priceCache: CacheEntry | null = null;

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
 * Batches all stock tickers into a single request
 */
async function fetchAlpacaStocks(tickers: string[]): Promise<Record<string, PriceResult | null>> {
  const results: Record<string, PriceResult | null> = {};

  if (tickers.length === 0) return results;

  const apiKey = process.env.ALPACA_API_KEY_ID;
  const apiSecret = process.env.ALPACA_API_SECRET_KEY;

  if (!apiKey || !apiSecret) {
    console.error('Alpaca API credentials not configured');
    // Fallback to Yahoo Finance if Alpaca not configured
    return fetchYahooFallback(tickers);
  }

  try {
    // Alpaca Data API v2 - Latest quotes endpoint (batched)
    const tickerParam = tickers.join(',');
    const url = `https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=${tickerParam}&feed=iex`;

    const response = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Alpaca API error: ${response.status}`);
      return fetchYahooFallback(tickers);
    }

    const data = await response.json();
    const quotes = data.quotes || {};

    // Also fetch previous day's close for change calculation
    const barsUrl = `https://data.alpaca.markets/v2/stocks/bars/latest?symbols=${tickerParam}&feed=iex`;
    const barsResponse = await fetch(barsUrl, {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    let bars: Record<string, { c: number }> = {};
    if (barsResponse.ok) {
      const barsData = await barsResponse.json();
      bars = barsData.bars || {};
    }

    // Process each ticker
    for (const ticker of tickers) {
      const quote = quotes[ticker];
      const bar = bars[ticker];

      if (quote) {
        // Use ask price, bid price midpoint, or last trade price
        const price = quote.ap || quote.bp || ((quote.ap + quote.bp) / 2) || bar?.c || 0;
        const previousClose = bar?.c || price;
        const change = price - previousClose;
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

        results[ticker] = {
          price,
          change,
          changePercent,
        };
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
  const coinGeckoApiKey = process.env.COINGECKO_API_KEY;

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

  // Check cache first
  if (isCacheValid(tickers)) {
    const cachedPrices: Record<string, { price: number | null; change: number; changePercent: number; isLive: boolean }> = {};

    for (const ticker of tickers) {
      const cached = priceCache!.data[ticker];
      cachedPrices[ticker] = {
        price: cached?.price ?? null,
        change: cached?.change ?? 0,
        changePercent: cached?.changePercent ?? 0,
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
  const [stockPrices, btcPrice] = await Promise.all([
    fetchAlpacaStocks(stockTickers),
    cryptoTickers.includes('BTC-USD') ? fetchBitcoin() : Promise.resolve(null),
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
  const prices: Record<string, { price: number | null; change: number; changePercent: number; isLive: boolean }> = {};

  for (const ticker of tickers) {
    const result = allPrices[ticker];
    prices[ticker] = {
      price: result?.price ?? null,
      change: result?.change ?? 0,
      changePercent: result?.changePercent ?? 0,
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
