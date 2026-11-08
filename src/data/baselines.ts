/**
 * Baseline Prices - December 31, 2025
 *
 * These are the static YTD baseline prices used for all 2026 performance calculations.
 * TradingView standard: Use the closing price from the last trading day of the previous year.
 *
 * IMPORTANT: These values are hardcoded. Only change them for a stock split (divide by
 * the split ratio so they match post-split prices) or at the year rollover.
 * All YTD calculations use these as the denominator: YTD = (current / baseline - 1) * 100
 *
 * Audit: `npm run audit:prices` compares every value here against Yahoo Finance
 * and flags mismatches and splits.
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
 * Core Watchlist - Mag 7 + Bitcoin
 * Verified closing prices from December 31, 2025 (TradingView standard)
 * Source: Yahoo Finance daily closes (split-adjusted), re-verified 2026-11-08
 */
export const coreBaselines: Record<string, BaselinePrice> = {
  'NVDA': { ticker: 'NVDA', price: 186.50, date: BASELINE_DATE },
  'MSFT': { ticker: 'MSFT', price: 483.62, date: BASELINE_DATE },
  'AAPL': { ticker: 'AAPL', price: 271.86, date: BASELINE_DATE },
  'GOOGL': { ticker: 'GOOGL', price: 313.00, date: BASELINE_DATE },
  'AMZN': { ticker: 'AMZN', price: 230.82, date: BASELINE_DATE },
  'META': { ticker: 'META', price: 660.09, date: BASELINE_DATE },
  'TSLA': { ticker: 'TSLA', price: 449.72, date: BASELINE_DATE },
  'BTC-USD': { ticker: 'BTC-USD', price: 87508.83, date: BASELINE_DATE },
  'AVGO': { ticker: 'AVGO', price: 346.10, date: BASELINE_DATE },
};

/**
 * Robotics Watchlist
 * Verified closing prices from December 31, 2025 (TradingView standard)
 * Source: Yahoo Finance daily closes (split-adjusted), re-verified 2026-11-08
 */
export const roboticsBaselines: Record<string, BaselinePrice> = {
  'ISRG': { ticker: 'ISRG', price: 566.36, date: BASELINE_DATE },
  'FANUY': { ticker: 'FANUY', price: 19.47, date: BASELINE_DATE },
  'TER': { ticker: 'TER', price: 193.56, date: BASELINE_DATE },
  'TSLA': { ticker: 'TSLA', price: 449.72, date: BASELINE_DATE },
  'SYM': { ticker: 'SYM', price: 59.50, date: BASELINE_DATE },
};

/**
 * AI Infrastructure Watchlist
 * Verified closing prices from December 31, 2025 (TradingView standard)
 * Source: Yahoo Finance daily closes (split-adjusted), re-verified 2026-11-08
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
 * Energy Renaissance Watchlist
 * Verified closing prices from December 31, 2025 (TradingView standard)
 * Source: Yahoo Finance daily closes (split-adjusted), re-verified 2026-11-08
 */
export const energyBaselines: Record<string, BaselinePrice> = {
  'CEG': { ticker: 'CEG', price: 353.27, date: BASELINE_DATE },
  'OKLO': { ticker: 'OKLO', price: 71.76, date: BASELINE_DATE },
  'VRT': { ticker: 'VRT', price: 162.01, date: BASELINE_DATE },
  'BWXT': { ticker: 'BWXT', price: 172.84, date: BASELINE_DATE },
  'SMR': { ticker: 'SMR', price: 14.17, date: BASELINE_DATE },
  'PWR': { ticker: 'PWR', price: 422.06, date: BASELINE_DATE },
};

/**
 * Orbital & Space Watchlist
 * Verified closing prices from December 31, 2025 (TradingView standard)
 * Source: Yahoo Finance daily closes (split-adjusted), re-verified 2026-11-08
 */
export const spaceBaselines: Record<string, BaselinePrice> = {
  'RKLB': { ticker: 'RKLB', price: 69.76, date: BASELINE_DATE },
  'ASTS': { ticker: 'ASTS', price: 72.63, date: BASELINE_DATE },
  'LUNR': { ticker: 'LUNR', price: 16.23, date: BASELINE_DATE },
  'RDW': { ticker: 'RDW', price: 7.60, date: BASELINE_DATE },
  'PL': { ticker: 'PL', price: 19.72, date: BASELINE_DATE },
};

/**
 * Quantum Computing Watchlist
 * Verified closing prices from December 31, 2025 (TradingView standard)
 * Source: Yahoo Finance daily closes (split-adjusted), re-verified 2026-11-08
 */
export const quantumBaselines: Record<string, BaselinePrice> = {
  'IONQ': { ticker: 'IONQ', price: 44.87, date: BASELINE_DATE },
  'RGTI': { ticker: 'RGTI', price: 22.15, date: BASELINE_DATE },
  'QBTS': { ticker: 'QBTS', price: 26.15, date: BASELINE_DATE },
  'QUBT': { ticker: 'QUBT', price: 10.26, date: BASELINE_DATE },
};

/**
 * Defense & Intelligence Watchlist
 * Verified closing prices from December 31, 2025 (TradingView standard)
 * Source: Yahoo Finance daily closes (split-adjusted), re-verified 2026-11-08
 */
export const defenseBaselines: Record<string, BaselinePrice> = {
  'PLTR': { ticker: 'PLTR', price: 177.75, date: BASELINE_DATE },
  'CRWD': { ticker: 'CRWD', price: 117.19, date: BASELINE_DATE }, // 4:1 split on 2026-07-02 (pre-split close was 468.76)
  'PANW': { ticker: 'PANW', price: 184.20, date: BASELINE_DATE },
  'KTOS': { ticker: 'KTOS', price: 75.91, date: BASELINE_DATE },
  'BAH': { ticker: 'BAH', price: 84.36, date: BASELINE_DATE },
  'LDOS': { ticker: 'LDOS', price: 180.40, date: BASELINE_DATE },
};

/**
 * Biotech Watchlist
 * Verified closing prices from December 31, 2025 (TradingView standard)
 * Source: Yahoo Finance daily closes (split-adjusted), re-verified 2026-11-08
 */
export const biotechBaselines: Record<string, BaselinePrice> = {
  'STOK': { ticker: 'STOK', price: 31.74, date: BASELINE_DATE },
  'CRSP': { ticker: 'CRSP', price: 52.44, date: BASELINE_DATE },
  'NTLA': { ticker: 'NTLA', price: 8.99, date: BASELINE_DATE },
  'BEAM': { ticker: 'BEAM', price: 27.72, date: BASELINE_DATE },
  'EDIT': { ticker: 'EDIT', price: 2.05, date: BASELINE_DATE },
  'TWST': { ticker: 'TWST', price: 31.72, date: BASELINE_DATE },
};

/**
 * Semiconductors Watchlist
 * Verified closing prices from December 31, 2025 (TradingView standard)
 * Source: Yahoo Finance daily closes (split-adjusted), verified 2026-11-08
 */
export const semiconductorBaselines: Record<string, BaselinePrice> = {
  'NVDA': { ticker: 'NVDA', price: 186.50, date: BASELINE_DATE },
  'TSM': { ticker: 'TSM', price: 303.89, date: BASELINE_DATE },
  'AVGO': { ticker: 'AVGO', price: 346.10, date: BASELINE_DATE },
  'AMD': { ticker: 'AMD', price: 214.16, date: BASELINE_DATE },
  'ASML': { ticker: 'ASML', price: 1069.86, date: BASELINE_DATE },
  'MU': { ticker: 'MU', price: 285.41, date: BASELINE_DATE },
  'MRVL': { ticker: 'MRVL', price: 84.98, date: BASELINE_DATE },
};

/**
 * 2026 quarter-end closes (split-adjusted), used for the quarterly performance strip.
 * Source: Yahoo Finance daily closes, verified 2026-11-08.
 * The quarter in progress is computed live against the most recent quarter-end close.
 */
export const QUARTER_END_DATES = ['2026-03-31', '2026-06-30', '2026-09-30', '2026-12-31'] as const;

export const quarterEndCloses: Record<string, Record<string, number>> = {
  '2026-03-31': {
    'AAPL': 253.79,
    'AMZN': 208.27,
    'APLD': 23.74,
    'ASTS': 82.87,
    'AVGO': 309.51,
    'BAH': 78.03,
    'BEAM': 23.83,
    'BTC-USD': 68233.31,
    'BWXT': 204.49,
    'CEG': 279.25,
    'CORZ': 14.96,
    'CRSP': 47.57,
    'CRWD': 97.60,
    'CRWV': 77.47,
    'EDIT': 2.47,
    'FANUY': 17.28,
    'GOOGL': 287.56,
    'IONQ': 28.83,
    'IREN': 34.28,
    'ISRG': 460.99,
    'KTOS': 70.51,
    'LDOS': 155.52,
    'LUNR': 18.56,
    'META': 572.13,
    'MSFT': 370.17,
    'NBIS': 103.76,
    'NTLA': 12.82,
    'NVDA': 174.40,
    'OKLO': 49.59,
    'PANW': 160.32,
    'PL': 27.95,
    'PLTR': 146.28,
    'PWR': 549.02,
    'QBTS': 14.43,
    'QUBT': 6.85,
    'RDW': 8.50,
    'RGTI': 14.04,
    'RKLB': 64.22,
    'SMR': 10.84,
    'STOK': 32.56,
    'SYM': 53.20,
    'TER': 296.46,
    'TSLA': 371.75,
    'TWST': 47.52,
    'VRT': 250.58,
    'WULF': 14.43,
    'TSM': 337.95,
    'AMD': 203.43,
    'ASML': 1320.83,
    'MU': 337.84,
    'MRVL': 99.05,
  },
  '2026-06-30': {
    'AAPL': 289.36,
    'AMZN': 238.34,
    'APLD': 37.30,
    'ASTS': 88.86,
    'AVGO': 377.75,
    'BAH': 60.67,
    'BEAM': 34.32,
    'BTC-USD': 58558.86,
    'BWXT': 194.65,
    'CEG': 248.37,
    'CORZ': 25.59,
    'CRSP': 54.54,
    'CRWD': 190.78,
    'CRWV': 99.54,
    'EDIT': 3.24,
    'FANUY': 22.88,
    'GOOGL': 357.37,
    'IONQ': 53.26,
    'IREN': 45.73,
    'ISRG': 397.68,
    'KTOS': 49.86,
    'LDOS': 102.97,
    'LUNR': 21.39,
    'META': 563.29,
    'MSFT': 373.02,
    'NBIS': 276.17,
    'NTLA': 16.92,
    'NVDA': 200.09,
    'OKLO': 52.33,
    'PANW': 341.02,
    'PL': 33.13,
    'PLTR': 116.67,
    'PWR': 720.04,
    'QBTS': 23.99,
    'QUBT': 9.70,
    'RDW': 12.23,
    'RGTI': 19.32,
    'RKLB': 101.65,
    'SMR': 10.03,
    'STOK': 32.72,
    'SYM': 44.95,
    'TER': 483.84,
    'TSLA': 420.60,
    'TWST': 102.88,
    'VRT': 334.82,
    'WULF': 24.70,
    'TSM': 477.57,
    'AMD': 580.91,
    'ASML': 1989.44,
    'MU': 1154.29,
    'MRVL': 297.89,
  },
  '2026-09-30': {
    'AAPL': 333.02,
    'AMZN': 249.15,
    'APLD': 24.37,
    'ASTS': 58.86,
    'AVGO': 351.19,
    'BAH': 69.42,
    'BEAM': 24.45,
    'BTC-USD': 83553.85,
    'BWXT': 137.00,
    'CEG': 254.02,
    'CORZ': 15.98,
    'CRSP': 55.32,
    'CRWD': 264.75,
    'CRWV': 87.12,
    'EDIT': 2.57,
    'FANUY': 18.87,
    'GOOGL': 344.08,
    'IONQ': 43.86,
    'IREN': 40.88,
    'ISRG': 406.63,
    'KTOS': 42.69,
    'LDOS': 121.83,
    'LUNR': 14.24,
    'META': 725.18,
    'MSFT': 512.90,
    'NBIS': 235.88,
    'NTLA': 12.06,
    'NVDA': 228.38,
    'OKLO': 37.02,
    'PANW': 397.31,
    'PL': 16.39,
    'PLTR': 187.05,
    'PWR': 642.51,
    'QBTS': 16.57,
    'QUBT': 8.45,
    'RDW': 10.44,
    'RGTI': 15.74,
    'RKLB': 69.68,
    'SMR': 7.90,
    'STOK': 26.00,
    'SYM': 42.07,
    'TER': 400.91,
    'TSLA': 354.81,
    'TWST': 193.24,
    'VRT': 241.31,
    'WULF': 14.80,
    'TSM': 456.19,
    'AMD': 611.76,
    'ASML': 1811.67,
    'MU': 1065.11,
    'MRVL': 264.21,
  },
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
  ...defenseBaselines,
  ...biotechBaselines,
  ...semiconductorBaselines,
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

/**
 * Get the close for a ticker on a quarter-end date (undefined if not recorded).
 */
export function getQuarterEndClose(ticker: string, date: string): number | undefined {
  return quarterEndCloses[date]?.[ticker.toUpperCase()];
}
