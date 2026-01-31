/**
 * Baseline Prices - December 31, 2025
 *
 * These are the static YTD baseline prices used for all 2026 performance calculations.
 * TradingView standard: Use the closing price from the last trading day of the previous year.
 *
 * IMPORTANT: These values are hardcoded and should NOT be modified during the year.
 * All YTD calculations use these as the denominator: YTD = (current / baseline - 1) * 100
 */

export interface BaselinePrice {
  ticker: string;
  price: number;
  date: string;
}

// December 31, 2025 was a Wednesday (trading day)
export const BASELINE_DATE = '2025-12-31';
export const BASELINE_YEAR = 2025;
export const TRACKING_YEAR = 2026;

/**
 * Core Portfolio - Mag 7 + Bitcoin
 * Actual closing prices from December 31, 2025
 */
export const coreBaselines: Record<string, BaselinePrice> = {
  'NVDA': { ticker: 'NVDA', price: 134.29, date: BASELINE_DATE },
  'MSFT': { ticker: 'MSFT', price: 421.35, date: BASELINE_DATE },
  'AAPL': { ticker: 'AAPL', price: 250.42, date: BASELINE_DATE },
  'GOOGL': { ticker: 'GOOGL', price: 190.75, date: BASELINE_DATE },
  'AMZN': { ticker: 'AMZN', price: 228.22, date: BASELINE_DATE },
  'META': { ticker: 'META', price: 589.34, date: BASELINE_DATE },
  'TSLA': { ticker: 'TSLA', price: 403.84, date: BASELINE_DATE },
  'BTC-USD': { ticker: 'BTC-USD', price: 93429.20, date: BASELINE_DATE },
};

/**
 * Innovation Portfolio
 * Actual closing prices from December 31, 2025
 */
export const innovationBaselines: Record<string, BaselinePrice> = {
  'RKLB': { ticker: 'RKLB', price: 27.32, date: BASELINE_DATE },
  'SMCI': { ticker: 'SMCI', price: 32.19, date: BASELINE_DATE },
  'VRT': { ticker: 'VRT', price: 132.21, date: BASELINE_DATE },
  'AVGO': { ticker: 'AVGO', price: 231.58, date: BASELINE_DATE },
  'IONQ': { ticker: 'IONQ', price: 43.75, date: BASELINE_DATE },
};

/**
 * Robotics Portfolio
 * Actual closing prices from December 31, 2025
 */
export const roboticsBaselines: Record<string, BaselinePrice> = {
  'ISRG': { ticker: 'ISRG', price: 542.60, date: BASELINE_DATE },
  'ABBNY': { ticker: 'ABBNY', price: 51.97, date: BASELINE_DATE },
  'FANUY': { ticker: 'FANUY', price: 14.37, date: BASELINE_DATE },
  'PATH': { ticker: 'PATH', price: 13.55, date: BASELINE_DATE },
};

/**
 * Combined baseline lookup - All tracked assets
 * Use this for YTD calculations throughout the application
 */
export const baselines: Record<string, BaselinePrice> = {
  ...coreBaselines,
  ...innovationBaselines,
  ...roboticsBaselines,
};

/**
 * Get baseline price for a ticker
 * Returns undefined if ticker not found
 */
export function getBaseline(ticker: string): BaselinePrice | undefined {
  return baselines[ticker.toUpperCase()];
}

/**
 * Get baseline price value for a ticker
 * Returns 0 if ticker not found (prevents division errors)
 */
export function getBaselinePrice(ticker: string): number {
  return baselines[ticker.toUpperCase()]?.price ?? 0;
}

/**
 * Check if a ticker has a baseline defined
 */
export function hasBaseline(ticker: string): boolean {
  return ticker.toUpperCase() in baselines;
}

/**
 * Get all tracked tickers
 */
export function getAllTickers(): string[] {
  return Object.keys(baselines);
}

/**
 * Get stock tickers only (excludes crypto)
 */
export function getStockTickers(): string[] {
  return Object.keys(baselines).filter(t => !t.includes('-USD'));
}

/**
 * Get crypto tickers only
 */
export function getCryptoTickers(): string[] {
  return Object.keys(baselines).filter(t => t.includes('-USD'));
}
