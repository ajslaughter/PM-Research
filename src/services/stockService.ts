import { StockData, stockDatabase, YTD_START } from '@/data/stockDatabase';

// YTD baseline: December 31, 2025 (aligned with TradingView standard)
// All YTD returns calculated against this anchor date

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

// Calculate YTD return: (current / dec_31_close - 1) * 100, rounded to 2 decimals
// yearlyClose = Dec 31, 2025 close price (YTD baseline - TradingView standard)
export function calculateYTD(currentPrice: number, yearlyClose: number): number {
  if (!yearlyClose || yearlyClose === 0) return 0;
  const ytd = (currentPrice / yearlyClose - 1) * 100;
  return Math.round(ytd * 100) / 100; // Round to 2 decimal places
}

// Calculate weighted portfolio YTD - sum of (weight * individual YTD), rounded to 2 decimals
// Uses Dec 31, 2025 close prices as baseline for all positions (TradingView standard)
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
      const ytd = calculateYTD(livePrice, stock.yearlyClose);
      weightedYTD += (position.weight / 100) * ytd;
      totalWeight += position.weight;
    }
  }

  // Normalize if not all weights are accounted for
  if (totalWeight > 0 && totalWeight < 100) {
    weightedYTD = (weightedYTD / totalWeight) * 100;
  }

  // Round to 2 decimal places
  return Math.round(weightedYTD * 100) / 100;
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

// Calculate CAGR (Compound Annual Growth Rate)
// Formula: (endValue / startValue)^(1/years) - 1
export function calculateCAGR(currentPrice: number, historicalPrice: number, years: number): number {
  if (!historicalPrice || historicalPrice <= 0 || !currentPrice || currentPrice <= 0 || years <= 0) {
    return 0;
  }

  const cagr = (Math.pow(currentPrice / historicalPrice, 1 / years) - 1) * 100;
  return Math.round(cagr * 100) / 100; // Round to 2 decimal places
}

// Check if a stock has at least the required years of price history
export function hasMinimumHistory(ipoDate: string | undefined, requiredYears: number): boolean {
  if (!ipoDate) return false;

  const ipo = new Date(ipoDate);
  const now = new Date();
  const yearsOfHistory = (now.getTime() - ipo.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  return yearsOfHistory >= requiredYears;
}

// Get the date N years ago from today (for historical price fetching)
export function getDateYearsAgo(years: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
}

// Fetch historical prices for 10-year CAGR calculation
export async function fetchHistoricalPrices(
  tickers: string[],
  date: string
): Promise<Record<string, { price: number | null; date: string }>> {
  try {
    const response = await fetch(`/api/historical-price?tickers=${tickers.join(',')}&date=${date}`);
    if (!response.ok) throw new Error('Failed to fetch historical prices');
    const data = await response.json();
    return data.prices;
  } catch (error) {
    console.error('Error fetching historical prices:', error);
    return {};
  }
}
