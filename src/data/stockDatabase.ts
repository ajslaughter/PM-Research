import { YTD_BASELINE_DATE, YTD_BASELINE_YEAR } from '@/lib/dateUtils';
import { getBaselinePrice, BASELINE_DATE } from '@/data/baselines';

// Central registry for all stock metadata
// NOTE: yearlyClose values are derived from baselines.ts (single source of truth)
export interface StockData {
  ticker: string;
  name: string;
  assetClass: string;
  sector: string;
  yearlyClose: number; // Derived from baselines.ts - Dec 31, 2025 close (TradingView standard)
  pmScore: number;
  lastUpdated: string;
}

// Re-export for backward compatibility
export const YTD_START = YTD_BASELINE_DATE;

/**
 * Helper to create stock entry with baseline from baselines.ts
 */
function createStock(
  ticker: string,
  name: string,
  assetClass: string,
  sector: string,
  pmScore: number,
  lastUpdated: string
): StockData {
  return {
    ticker,
    name,
    assetClass,
    sector,
    yearlyClose: getBaselinePrice(ticker), // From baselines.ts
    pmScore,
    lastUpdated,
  };
}

/**
 * Stock Database - Central registry for all stock metadata
 *
 * yearlyClose values are automatically derived from baselines.ts
 * to ensure a single source of truth for YTD calculations.
 */
export const stockDatabase: Record<string, StockData> = {
  // Mag 7 + Bitcoin (Core Portfolio)
  "NVDA": createStock("NVDA", "NVIDIA Corporation", "AI Hardware", "Technology", 98, "2026-01-31"),
  "MSFT": createStock("MSFT", "Microsoft Corp", "Cloud/AI", "Technology", 94, "2026-01-29"),
  "AAPL": createStock("AAPL", "Apple Inc.", "Consumer Tech", "Technology", 89, "2026-01-29"),
  "GOOGL": createStock("GOOGL", "Alphabet Inc.", "Search/AI", "Technology", 92, "2026-01-29"),
  "AMZN": createStock("AMZN", "Amazon.com Inc.", "E-Commerce", "Consumer Cyclical", 90, "2026-01-29"),
  "META": createStock("META", "Meta Platforms Inc.", "Social/AI", "Technology", 91, "2026-01-29"),
  "TSLA": createStock("TSLA", "Tesla Inc.", "Auto/Robotics", "Consumer Cyclical", 85, "2026-01-29"),
  "BTC-USD": createStock("BTC-USD", "Bitcoin", "Digital Assets", "Cryptocurrency", 88, "2026-01-31"),
  "AVGO": createStock("AVGO", "Broadcom Inc.", "AI Hardware", "Technology", 93, "2026-01-29"),

  // Robotics Portfolio
  "ISRG": createStock("ISRG", "Intuitive Surgical", "Auto/Robotics", "Healthcare", 91, "2026-01-29"),
  "FANUY": createStock("FANUY", "Fanuc Corporation", "Auto/Robotics", "Industrials", 80, "2026-01-29"),
  // AI Infrastructure Portfolio
  "IREN": createStock("IREN", "Iris Energy Limited", "AI Infrastructure", "Technology", 85, "2026-01-31"),
  "CORZ": createStock("CORZ", "Core Scientific Inc.", "AI Infrastructure", "Technology", 82, "2026-01-31"),
  "CRWV": createStock("CRWV", "CoreWeave Inc.", "AI Infrastructure", "Technology", 88, "2026-01-31"),
  "APLD": createStock("APLD", "Applied Digital Corp", "AI Infrastructure", "Technology", 79, "2026-01-31"),
  "NBIS": createStock("NBIS", "Nebius Group N.V.", "AI Infrastructure", "Technology", 84, "2026-01-31"),
  "WULF": createStock("WULF", "TeraWulf Inc.", "AI Infrastructure", "Technology", 81, "2026-02-14"),

  // Energy Renaissance Portfolio
  "CEG": createStock("CEG", "Constellation Energy", "Nuclear", "Energy", 90, "2026-01-31"),
  "OKLO": createStock("OKLO", "Oklo Inc.", "Nuclear", "Energy", 86, "2026-01-31"),
  "VRT": createStock("VRT", "Vertiv Holdings", "Data Center", "Industrials", 86, "2026-01-29"),
  "BWXT": createStock("BWXT", "BWX Technologies", "Nuclear", "Industrials", 87, "2026-01-31"),
  "SMR": createStock("SMR", "NuScale Power Corp", "Nuclear", "Energy", 84, "2026-02-13"),
  "PWR": createStock("PWR", "Quanta Services Inc.", "Grid Infrastructure", "Industrials", 84, "2026-02-13"),

  // Robotics Portfolio (additional tickers)
  "SYM": createStock("SYM", "Symbotic Inc.", "Auto/Robotics", "Technology", 81, "2026-02-12"),

  "TER": createStock("TER", "Teradyne Inc.", "Auto/Robotics", "Technology", 83, "2026-01-31"),

  // Orbital & Space Portfolio
  "RKLB": createStock("RKLB", "Rocket Lab USA", "Space", "Industrials", 91, "2026-02-12"),
  "ASTS": createStock("ASTS", "AST SpaceMobile", "Space", "Technology", 89, "2026-02-12"),
  "LUNR": createStock("LUNR", "Intuitive Machines", "Space", "Industrials", 84, "2026-02-12"),
  "RDW": createStock("RDW", "Redwire Corporation", "Space", "Industrials", 80, "2026-02-12"),
  "PL": createStock("PL", "Planet Labs PBC", "Space", "Technology", 78, "2026-02-12"),

  // Quantum Computing Portfolio
  "IONQ": createStock("IONQ", "IonQ Inc.", "Quantum", "Technology", 82, "2026-02-13"),
  "RGTI": createStock("RGTI", "Rigetti Computing", "Quantum", "Technology", 76, "2026-02-13"),
  "QBTS": createStock("QBTS", "D-Wave Quantum Inc.", "Quantum", "Technology", 74, "2026-02-13"),
  "QUBT": createStock("QUBT", "Quantum Computing Inc.", "Quantum", "Technology", 70, "2026-02-13"),

  // Defense & Intelligence Portfolio
  "PLTR": createStock("PLTR", "Palantir Technologies", "Defense/AI", "Technology", 93, "2026-02-14"),
  "CRWD": createStock("CRWD", "CrowdStrike Holdings", "Cybersecurity", "Technology", 90, "2026-02-14"),
  "PANW": createStock("PANW", "Palo Alto Networks", "Cybersecurity", "Technology", 88, "2026-02-14"),
  "KTOS": createStock("KTOS", "Kratos Defense & Security", "Defense/AI", "Industrials", 84, "2026-02-14"),
  "BAH": createStock("BAH", "Booz Allen Hamilton", "Defense/AI", "Technology", 82, "2026-02-14"),
  "LDOS": createStock("LDOS", "Leidos Holdings", "Defense/AI", "Technology", 80, "2026-02-14"),
};

// Asset class color mapping for UI
export const assetClassColors: Record<string, string> = {
  "AI Hardware": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Cloud/AI": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Consumer Tech": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Search/AI": "bg-green-500/20 text-green-400 border-green-500/30",
  "E-Commerce": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Social/AI": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "Auto/Robotics": "bg-red-500/20 text-red-400 border-red-500/30",
  "Digital Assets": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Space": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  "Quantum": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "Grid Infrastructure": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Data Center": "bg-teal-500/20 text-teal-400 border-teal-500/30",
  "AI Infrastructure": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Nuclear": "bg-lime-500/20 text-lime-400 border-lime-500/30",
  "Defense/AI": "bg-rose-500/20 text-rose-400 border-rose-500/30",
  "Cybersecurity": "bg-sky-500/20 text-sky-400 border-sky-500/30",
};
