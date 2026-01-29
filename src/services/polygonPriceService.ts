const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || process.env.POLYGON_API_KEY || '';
const POLYGON_BASE_URL = 'https://api.polygon.io';

interface CacheEntry {
  value: number;
  timestamp: number;
}

const priceCache: Map<string, CacheEntry> = new Map();
const baselineCache: Map<string, CacheEntry> = new Map();
const CACHE_TTL_MS = 15000;

function sanitizePrice(price: string | number): number {
  if (typeof price === 'number') return price;
  const cleaned = String(price).replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isCacheValid(entry: CacheEntry | undefined): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL_MS;
}

// YTD_START: December 31, 2025 - TradingView standard for YTD baseline
const YTD_START = '2025-12-31';

export async function getYTDBaseline(ticker: string): Promise<number> {
  const upperTicker = ticker.toUpperCase();
  const cached = baselineCache.get(upperTicker);
  if (isCacheValid(cached)) {
    return cached!.value;
  }

  // Fetch December 31, 2025 close price as YTD baseline (TradingView standard)
  const from = '2025-12-31';
  const to = '2026-01-01';
  const url = `${POLYGON_BASE_URL}/v2/aggs/ticker/${upperTicker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=1&apiKey=${POLYGON_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    return 0;
  }

  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    return 0;
  }

  // Get the December 31, 2025 close price
  const baseline = sanitizePrice(data.results[0].c);

  if (baseline > 0) {
    baselineCache.set(upperTicker, { value: baseline, timestamp: Date.now() });
  }

  return baseline;
}

export function calculateGain(buy: string | number, sell: string | number): number {
  const buyPrice = sanitizePrice(buy);
  const sellPrice = sanitizePrice(sell);
  if (buyPrice === 0) return 0;
  return ((sellPrice - buyPrice) / buyPrice) * 100;
}

export function portfolioReturn(
  holdings: Array<{ ticker: string; shares: number }>,
  prices: Record<string, number | string>
): number {
  let totalValue = 0;
  let totalCost = 0;

  for (const holding of holdings) {
    const upperTicker = holding.ticker.toUpperCase();
    const currentPrice = sanitizePrice(prices[upperTicker] ?? prices[holding.ticker] ?? 0);
    const shares = holding.shares;

    if (currentPrice > 0 && shares > 0) {
      const cached = baselineCache.get(upperTicker);
      const baseline = cached?.value ?? 0;
      if (baseline > 0) {
        totalCost += baseline * shares;
        totalValue += currentPrice * shares;
      }
    }
  }

  if (totalCost === 0) return 0;
  return ((totalValue - totalCost) / totalCost) * 100;
}

export async function fetchCurrentPrice(ticker: string): Promise<number> {
  const upperTicker = ticker.toUpperCase();
  const cached = priceCache.get(upperTicker);
  if (isCacheValid(cached)) {
    return cached!.value;
  }

  const url = `${POLYGON_BASE_URL}/v2/aggs/ticker/${upperTicker}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    return 0;
  }

  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    return 0;
  }

  const price = sanitizePrice(data.results[0].c);
  if (price > 0) {
    priceCache.set(upperTicker, { value: price, timestamp: Date.now() });
  }

  return price;
}

export async function fetchCurrentPrices(tickers: string[]): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  const fetchPromises = tickers.map(async (ticker) => {
    const price = await fetchCurrentPrice(ticker);
    results[ticker.toUpperCase()] = price;
  });
  await Promise.all(fetchPromises);
  return results;
}
