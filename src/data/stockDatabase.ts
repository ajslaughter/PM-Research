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

  // Innovation Portfolio
  "RKLB": createStock("RKLB", "Rocket Lab USA", "Space", "Aerospace", 94, "2026-01-29"),
  "SMCI": createStock("SMCI", "Super Micro Computer", "Data Center", "Technology", 78, "2026-01-31"),
  "VRT": createStock("VRT", "Vertiv Holdings", "Data Center", "Industrials", 86, "2026-01-29"),
  "AVGO": createStock("AVGO", "Broadcom Inc.", "AI Hardware", "Technology", 93, "2026-01-29"),
  "IONQ": createStock("IONQ", "IonQ Inc.", "Quantum", "Technology", 82, "2026-01-31"),

  // Robotics Portfolio
  "ISRG": createStock("ISRG", "Intuitive Surgical", "Auto/Robotics", "Healthcare", 91, "2026-01-29"),
  "ABB": createStock("ABB", "ABB Ltd", "Auto/Robotics", "Industrials", 84, "2026-01-31"),  // NYSE ticker (corrected from ABBNY)
  "FANUY": createStock("FANUY", "Fanuc Corporation", "Auto/Robotics", "Industrials", 80, "2026-01-29"),
  "PATH": createStock("PATH", "UiPath Inc.", "Auto/Robotics", "Technology", 75, "2026-01-29"),
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
};
