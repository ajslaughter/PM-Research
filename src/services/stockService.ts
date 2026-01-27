import { StockData, stockDatabase } from '@/data/stockDatabase';

// Live price data structure
export interface LivePrice {
  price: number;
  change: number;
  changePercent: number;
  isLive: boolean;
}

// API response structure
export interface PriceResponse {
  prices: Record<string, { price: number | null; changePercent: number }>;
  marketOpen: boolean;
  timestamp: string;
}

// Fetch live prices for array of tickers
export async function fetchLivePrices(tickers: string[]): Promise<PriceResponse> {
  const response = await fetch(`/api/prices?tickers=${tickers.join(',')}`);
  if (!response.ok) throw new Error('Failed to fetch prices');
  return response.json();
}

// Fetch stock metadata from Yahoo Finance (for adding new stocks)
export async function fetchStockMetadata(ticker: string): Promise<Partial<StockData> | null> {
  try {
    const response = await fetch(`/api/stock-info?ticker=${ticker}`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

// Get stock from database
export function getStock(ticker: string): StockData | undefined {
  return stockDatabase[ticker.toUpperCase()];
}

// Check if stock exists in database
export function stockExists(ticker: string): boolean {
  return ticker.toUpperCase() in stockDatabase;
}

// Calculate YTD return
export function calculateYTD(currentPrice: number, yearlyOpen: number): number {
  if (!yearlyOpen || yearlyOpen === 0) return 0;
  return ((currentPrice - yearlyOpen) / yearlyOpen) * 100;
}

// Calculate weighted portfolio YTD
export function calculateWeightedYTD(
  positions: Array<{ ticker: string; weight: number }>,
  livePrices: Record<string, { price: number | null; changePercent: number }>,
  stockDb: Record<string, StockData>
): number {
  let weightedYTD = 0;
  let totalWeight = 0;

  for (const position of positions) {
    const stock = stockDb[position.ticker.toUpperCase()];
    const livePrice = livePrices[position.ticker]?.price;

    if (stock && livePrice && livePrice > 0) {
      const ytd = calculateYTD(livePrice, stock.yearlyOpen);
      weightedYTD += (position.weight / 100) * ytd;
      totalWeight += position.weight;
    }
  }

  // Normalize if not all weights are accounted for
  if (totalWeight > 0 && totalWeight < 100) {
    weightedYTD = (weightedYTD / totalWeight) * 100;
  }

  return weightedYTD;
}

// Calculate weighted daily change
export function calculateWeightedDayChange(
  positions: Array<{ ticker: string; weight: number }>,
  livePrices: Record<string, { price: number | null; changePercent: number }>
): number {
  let weightedChange = 0;
  let totalWeight = 0;

  for (const position of positions) {
    const priceData = livePrices[position.ticker];
    if (priceData && priceData.price !== null) {
      weightedChange += (position.weight / 100) * priceData.changePercent;
      totalWeight += position.weight;
    }
  }

  // Normalize if not all weights are accounted for
  if (totalWeight > 0 && totalWeight < 100) {
    weightedChange = (weightedChange / totalWeight) * 100;
  }

  return weightedChange;
}

// Calculate average PM score
export function calculateAvgPmScore(
  positions: Array<{ ticker: string; weight: number }>,
  stockDb: Record<string, StockData>
): number {
  let totalScore = 0;
  let count = 0;

  for (const position of positions) {
    const stock = stockDb[position.ticker.toUpperCase()];
    if (stock) {
      totalScore += stock.pmScore;
      count++;
    }
  }

  return count > 0 ? totalScore / count : 0;
}
