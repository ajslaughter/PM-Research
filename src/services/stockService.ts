import { StockData, stockDatabase } from '@/data/stockDatabase';
import { getBaselinePrice, hasBaseline, BASELINE_DATE } from '@/data/baselines';

/**
 * YTD Calculation Standards
 * -------------------------
 * Baseline: December 31, 2025 (TradingView standard - last trading day of previous year)
 * Formula: ((Current - Baseline) / Baseline) * 100
 *
 * IMPORTANT: baselines.ts is the SINGLE SOURCE OF TRUTH for all YTD denominators.
 * No fallback calculations or rolling 365-day math - strict baseline approach.
 */

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

/**
 * Calculate YTD return using the standard formula:
 * YTD = ((Current - Baseline) / Baseline) * 100
 *
 * @param currentPrice - Current market price
 * @param baseline - December 31, 2025 closing price (from baselines.ts)
 * @returns YTD percentage rounded to 2 decimal places
 */
export function calculateYTD(currentPrice: number, baseline: number): number {
  if (!baseline || baseline === 0) return 0;
  if (!currentPrice || currentPrice === 0) return 0;

  // Standard YTD formula: ((Current - Baseline) / Baseline) * 100
  const ytd = ((currentPrice - baseline) / baseline) * 100;
  return Math.round(ytd * 100) / 100;
}

/**
 * Calculate YTD return for a ticker using baselines.ts as single source of truth.
 * This is the PREFERRED method for all YTD calculations.
 *
 * @param ticker - Stock/crypto ticker symbol
 * @param currentPrice - Current market price
 * @returns YTD percentage rounded to 2 decimal places
 */
export function calculateYTDFromBaseline(ticker: string, currentPrice: number): number {
  const baseline = getBaselinePrice(ticker);
  if (!baseline || baseline === 0) {
    console.warn(`No baseline found for ticker: ${ticker}`);
    return 0;
  }
  return calculateYTD(currentPrice, baseline);
}

/**
 * Calculate weighted portfolio YTD return.
 * Formula: Sum of (weight * individual YTD) for all positions
 *
 * IMPORTANT: Uses baselines.ts as the SINGLE SOURCE OF TRUTH.
 * No fallback to stockDatabase - if baseline is missing, position is skipped.
 *
 * @param positions - Array of portfolio positions with ticker and weight
 * @param livePrices - Current live prices from API
 * @param _stockDb - Unused, kept for API compatibility (baselines.ts is source of truth)
 * @returns Weighted YTD percentage rounded to 2 decimal places
 */
export function calculateWeightedYTD(
  positions: Array<{ ticker: string; weight: number }>,
  livePrices: Record<string, { price: number | null; changePercent: number }>,
  _stockDb: Record<string, StockData>
): number {
  let weightedYTD = 0;
  let totalWeight = 0;

  for (const position of positions) {
    const ticker = position.ticker.toUpperCase();
    const livePrice = livePrices[position.ticker]?.price;

    if (livePrice && livePrice > 0) {
      // STRICT: Use only baselines.ts - no fallbacks
      if (!hasBaseline(ticker)) {
        console.warn(`Skipping ${ticker} in weighted YTD - no baseline defined`);
        continue;
      }

      const baseline = getBaselinePrice(ticker);
      const ytd = calculateYTD(livePrice, baseline);
      weightedYTD += (position.weight / 100) * ytd;
      totalWeight += position.weight;
    }
  }

  // Normalize if not all weights are accounted for
  if (totalWeight > 0 && totalWeight < 100) {
    weightedYTD = (weightedYTD / totalWeight) * 100;
  }

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
