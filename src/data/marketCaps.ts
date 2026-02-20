/**
 * Fallback Market Cap Data - February 2026 Estimates
 *
 * These are approximate market capitalizations (in USD) used as a fallback
 * when live market cap API fetches fail. Market caps change slowly relative
 * to price, so even stale data is useful for display purposes.
 *
 * Values are sourced from public financial data and rounded to avoid
 * false precision. Updated periodically alongside baselines.ts.
 *
 * Format: value in raw USD (e.g., 3.4e12 = $3.4 Trillion)
 */

export const fallbackMarketCaps: Record<string, number> = {
  // Mag 7 + Bitcoin (Core Watchlist)
  'NVDA':    3400e9,   // ~$3.4T
  'MSFT':    3150e9,   // ~$3.15T
  'AAPL':    3700e9,   // ~$3.7T
  'GOOGL':   2350e9,   // ~$2.35T
  'AMZN':    2450e9,   // ~$2.45T
  'META':    1800e9,   // ~$1.8T
  'TSLA':    1100e9,   // ~$1.1T
  'BTC-USD': 1950e9,   // ~$1.95T
  'AVGO':    1050e9,   // ~$1.05T

  // AI Infrastructure
  'IREN':    5.0e9,    // ~$5.0B
  'CORZ':    4.5e9,    // ~$4.5B
  'CRWV':    35e9,     // ~$35B
  'APLD':    4.8e9,    // ~$4.8B
  'NBIS':    12e9,     // ~$12B
  'WULF':    2.5e9,    // ~$2.5B

  // Energy Renaissance
  'CEG':     92e9,     // ~$92B
  'OKLO':    6.5e9,    // ~$6.5B
  'VRT':     44e9,     // ~$44B
  'BWXT':    17e9,     // ~$17B
  'SMR':     4.5e9,    // ~$4.5B
  'PWR':     50e9,     // ~$50B

  // Robotics
  'ISRG':    205e9,    // ~$205B
  'FANUY':   36e9,     // ~$36B
  'TER':     31e9,     // ~$31B
  'SYM':     9.5e9,    // ~$9.5B

  // Orbital & Space
  'RKLB':    15e9,     // ~$15B
  'ASTS':    10.5e9,   // ~$10.5B
  'LUNR':    4.2e9,    // ~$4.2B
  'RDW':     2.1e9,    // ~$2.1B
  'PL':      5.2e9,    // ~$5.2B

  // Quantum Computing
  'IONQ':    10e9,     // ~$10B
  'RGTI':    7.5e9,    // ~$7.5B
  'QBTS':    5.5e9,    // ~$5.5B
  'QUBT':    3.2e9,    // ~$3.2B

  // Defense & Intelligence
  'PLTR':    275e9,    // ~$275B
  'CRWD':    97e9,     // ~$97B
  'PANW':    132e9,    // ~$132B
  'KTOS':    10.5e9,   // ~$10.5B
  'BAH':     20.5e9,   // ~$20.5B
  'LDOS':    23e9,     // ~$23B

  // Biotech
  'STOK':    1.5e9,    // ~$1.5B
  'CRSP':    4.2e9,    // ~$4.2B
  'NTLA':    1.6e9,    // ~$1.6B
  'BEAM':    2.8e9,    // ~$2.8B
  'EDIT':    350e6,    // ~$350M
  'TWST':    5.5e9,    // ~$5.5B
};

/**
 * Get fallback market cap for a ticker.
 * Returns null if ticker not in the fallback database.
 */
export function getFallbackMarketCap(ticker: string): number | null {
  return fallbackMarketCaps[ticker.toUpperCase()] ?? null;
}
