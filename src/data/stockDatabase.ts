// Central registry for all stock metadata - Single source of truth
export interface StockData {
  ticker: string;
  name: string;
  assetClass: string;
  sector: string;
  yearlyClose: number; // Dec 31, 2025 close price - YTD baseline (TradingView standard)
  pmScore: number;
  lastUpdated: string;
  ipoDate?: string; // IPO or first trading date (YYYY-MM-DD) - used for CAGR eligibility
}

// YTD_START constant - December 31, 2025 is the anchor for all YTD calculations (TradingView standard)
export const YTD_START = '2025-12-31';

// Initial database with December 31, 2025 close prices
export const stockDatabase: Record<string, StockData> = {
  // Mag 7 + Bitcoin (Core Portfolio)
  "NVDA": {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    assetClass: "AI Hardware",
    sector: "Technology",
    yearlyClose: 189.84, // Dec 31, 2025 close (TradingView standard)
    pmScore: 98,
    lastUpdated: "2026-01-29",
    ipoDate: "1999-01-22"
  },
  "MSFT": {
    ticker: "MSFT",
    name: "Microsoft Corp",
    assetClass: "Cloud/AI",
    sector: "Technology",
    yearlyClose: 484.39, // Dec 31, 2025 close (TradingView standard)
    pmScore: 94,
    lastUpdated: "2026-01-29",
    ipoDate: "1986-03-13"
  },
  "AAPL": {
    ticker: "AAPL",
    name: "Apple Inc.",
    assetClass: "Consumer Tech",
    sector: "Technology",
    yearlyClose: 272.26, // Dec 31, 2025 close (TradingView standard)
    pmScore: 89,
    lastUpdated: "2026-01-29",
    ipoDate: "1980-12-12"
  },
  "GOOGL": {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    assetClass: "Search/AI",
    sector: "Technology",
    yearlyClose: 316.90, // Dec 31, 2025 close (TradingView standard)
    pmScore: 92,
    lastUpdated: "2026-01-29",
    ipoDate: "2004-08-19"
  },
  "AMZN": {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    assetClass: "E-Commerce",
    sector: "Consumer Cyclical",
    yearlyClose: 231.34, // Dec 31, 2025 close (TradingView standard)
    pmScore: 90,
    lastUpdated: "2026-01-29",
    ipoDate: "1997-05-15"
  },
  "META": {
    ticker: "META",
    name: "Meta Platforms Inc.",
    assetClass: "Social/AI",
    sector: "Technology",
    yearlyClose: 662.72, // Dec 31, 2025 close (TradingView standard)
    pmScore: 91,
    lastUpdated: "2026-01-29",
    ipoDate: "2012-05-18"
  },
  "TSLA": {
    ticker: "TSLA",
    name: "Tesla Inc.",
    assetClass: "Auto/Robotics",
    sector: "Consumer Cyclical",
    yearlyClose: 457.80, // Dec 31, 2025 close (TradingView standard)
    pmScore: 85,
    lastUpdated: "2026-01-29",
    ipoDate: "2010-06-29"
  },
  "BTC-USD": {
    ticker: "BTC-USD",
    name: "Bitcoin",
    assetClass: "Digital Assets",
    sector: "Cryptocurrency",
    yearlyClose: 88742.00, // Dec 31, 2025 close (TradingView standard)
    pmScore: 88,
    lastUpdated: "2026-01-29",
    ipoDate: "2009-01-03" // Bitcoin genesis block
  },

  // Innovation Portfolio
  "RKLB": {
    ticker: "RKLB",
    name: "Rocket Lab USA",
    assetClass: "Space",
    sector: "Aerospace",
    yearlyClose: 70.63, // Dec 31, 2025 close (TradingView standard)
    pmScore: 94,
    lastUpdated: "2026-01-29",
    ipoDate: "2021-08-25" // SPAC merger - less than 10 years
  },
  "SMCI": {
    ticker: "SMCI",
    name: "Super Micro Computer",
    assetClass: "Data Center",
    sector: "Technology",
    yearlyClose: 29.96, // Dec 31, 2025 close (TradingView standard)
    pmScore: 78,
    lastUpdated: "2026-01-29",
    ipoDate: "2007-03-29"
  },
  "VRT": {
    ticker: "VRT",
    name: "Vertiv Holdings",
    assetClass: "Data Center",
    sector: "Industrials",
    yearlyClose: 169.47, // Dec 31, 2025 close (TradingView standard)
    pmScore: 86,
    lastUpdated: "2026-01-29",
    ipoDate: "2020-02-07" // SPAC merger - less than 10 years
  },
  "AVGO": {
    ticker: "AVGO",
    name: "Broadcom Inc.",
    assetClass: "AI Hardware",
    sector: "Technology",
    yearlyClose: 352.78, // Dec 31, 2025 close (TradingView standard)
    pmScore: 93,
    lastUpdated: "2026-01-29",
    ipoDate: "2009-08-06" // IPO as Avago Technologies
  },
  "IONQ": {
    ticker: "IONQ",
    name: "IonQ Inc.",
    assetClass: "Quantum",
    sector: "Technology",
    yearlyClose: 46.01, // Dec 31, 2025 close (TradingView standard)
    pmScore: 82,
    lastUpdated: "2026-01-29",
    ipoDate: "2021-10-01" // SPAC merger - less than 10 years
  },

  // Robotics Portfolio
  "ISRG": {
    ticker: "ISRG",
    name: "Intuitive Surgical",
    assetClass: "Auto/Robotics",
    sector: "Healthcare",
    yearlyClose: 566.78, // Dec 31, 2025 close (TradingView standard)
    pmScore: 91,
    lastUpdated: "2026-01-29",
    ipoDate: "2000-06-13"
  },
  "ABB": {
    ticker: "ABB",
    name: "ABB Ltd",
    assetClass: "Auto/Robotics",
    sector: "Industrials",
    yearlyClose: 73.51, // Dec 31, 2025 close (TradingView standard)
    pmScore: 84,
    lastUpdated: "2026-01-29",
    ipoDate: "1988-01-01" // NYSE listing
  },
  "FANUY": {
    ticker: "FANUY",
    name: "Fanuc Corporation",
    assetClass: "Auto/Robotics",
    sector: "Industrials",
    yearlyClose: 19.65, // Dec 31, 2025 close (TradingView standard)
    pmScore: 80,
    lastUpdated: "2026-01-29",
    ipoDate: "1990-01-01" // ADR trading since early 1990s
  },
  "PATH": {
    ticker: "PATH",
    name: "UiPath Inc.",
    assetClass: "Auto/Robotics",
    sector: "Technology",
    yearlyClose: 16.50, // Dec 31, 2025 close (TradingView standard)
    pmScore: 75,
    lastUpdated: "2026-01-29",
    ipoDate: "2021-04-21" // IPO - less than 10 years
  },
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
