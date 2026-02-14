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
 * Verified closing prices from December 31, 2025 (TradingView standard)
 * Source: Official exchange data via Polygon.io / Yahoo Finance
 */
export const coreBaselines: Record<string, BaselinePrice> = {
  'NVDA': { ticker: 'NVDA', price: 186.50, date: BASELINE_DATE },
  'MSFT': { ticker: 'MSFT', price: 484.39, date: BASELINE_DATE },
  'AAPL': { ticker: 'AAPL', price: 272.26, date: BASELINE_DATE },
  'GOOGL': { ticker: 'GOOGL', price: 316.90, date: BASELINE_DATE },
  'AMZN': { ticker: 'AMZN', price: 231.34, date: BASELINE_DATE },
  'META': { ticker: 'META', price: 662.72, date: BASELINE_DATE },
  'TSLA': { ticker: 'TSLA', price: 457.80, date: BASELINE_DATE },
  'BTC-USD': { ticker: 'BTC-USD', price: 87508.83, date: BASELINE_DATE },
  'AVGO': { ticker: 'AVGO', price: 352.78, date: BASELINE_DATE },
};

/**
 * Robotics Portfolio
 * Verified closing prices from December 31, 2025 (TradingView standard)
 * Source: Official exchange data via Polygon.io / Yahoo Finance
 */
export const roboticsBaselines: Record<string, BaselinePrice> = {
  'ISRG': { ticker: 'ISRG', price: 566.78, date: BASELINE_DATE },
  'FANUY': { ticker: 'FANUY', price: 19.65, date: BASELINE_DATE },
  'PATH': { ticker: 'PATH', price: 16.50, date: BASELINE_DATE },
  'TER': { ticker: 'TER', price: 193.56, date: BASELINE_DATE },
  'TSLA': { ticker: 'TSLA', price: 457.80, date: BASELINE_DATE },
  'SYM': { ticker: 'SYM', price: 59.50, date: BASELINE_DATE },
};

/**
 * AI Infrastructure Portfolio
 * Verified closing prices from December 31, 2025 (TradingView standard)
 * Source: Official exchange data via Polygon.io / Yahoo Finance
 */
export const aiInfraBaselines: Record<string, BaselinePrice> = {
  'IREN': { ticker: 'IREN', price: 37.77, date: BASELINE_DATE },
  'CORZ': { ticker: 'CORZ', price: 14.56, date: BASELINE_DATE },
  'CRWV': { ticker: 'CRWV', price: 71.61, date: BASELINE_DATE },
  'APLD': { ticker: 'APLD', price: 24.52, date: BASELINE_DATE },
  'NBIS': { ticker: 'NBIS', price: 83.71, date: BASELINE_DATE },
  'WULF': { ticker: 'WULF', price: 11.49, date: BASELINE_DATE },
};

/**
 * Energy Renaissance Portfolio
 * Verified closing prices from December 31, 2025 (TradingView standard)
 * Source: Official exchange data via Polygon.io / Yahoo Finance
 */
export const energyBaselines: Record<string, BaselinePrice> = {
  'CEG': { ticker: 'CEG', price: 353.27, date: BASELINE_DATE },
  'OKLO': { ticker: 'OKLO', price: 71.76, date: BASELINE_DATE },
  'VRT': { ticker: 'VRT', price: 169.47, date: BASELINE_DATE },
  'BWXT': { ticker: 'BWXT', price: 172.84, date: BASELINE_DATE },
  'SMR': { ticker: 'SMR', price: 14.17, date: BASELINE_DATE },
  'PWR': { ticker: 'PWR', price: 422.06, date: BASELINE_DATE },
};

/**
 * Orbital & Space Portfolio
 * Verified closing prices from December 31, 2025 (TradingView standard)
 * Source: Official exchange data via Polygon.io / Yahoo Finance
 */
export const spaceBaselines: Record<string, BaselinePrice> = {
  'RKLB': { ticker: 'RKLB', price: 69.76, date: BASELINE_DATE },
  'ASTS': { ticker: 'ASTS', price: 72.63, date: BASELINE_DATE },
  'LUNR': { ticker: 'LUNR', price: 16.23, date: BASELINE_DATE },
  'RDW': { ticker: 'RDW', price: 7.60, date: BASELINE_DATE },
  'PL': { ticker: 'PL', price: 19.72, date: BASELINE_DATE },
};

/**
 * Quantum Computing Portfolio
 * Verified closing prices from December 31, 2025 (TradingView standard)
 * Source: Official exchange data via Polygon.io / Yahoo Finance
 */
export const quantumBaselines: Record<string, BaselinePrice> = {
  'IONQ': { ticker: 'IONQ', price: 44.87, date: BASELINE_DATE },
  'RGTI': { ticker: 'RGTI', price: 22.15, date: BASELINE_DATE },
  'QBTS': { ticker: 'QBTS', price: 26.15, date: BASELINE_DATE },
  'QUBT': { ticker: 'QUBT', price: 10.33, date: BASELINE_DATE },
};

/**
 * Combined baseline lookup - All tracked assets
 * Use this for YTD calculations throughout the application
 */
export const baselines: Record<string, BaselinePrice> = {
  ...coreBaselines,
  ...roboticsBaselines,
  ...aiInfraBaselines,
  ...energyBaselines,
  ...spaceBaselines,
  ...quantumBaselines,
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
