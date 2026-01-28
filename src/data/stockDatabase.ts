// Central registry for all stock metadata - Single source of truth
export interface StockData {
  ticker: string;
  name: string;
  assetClass: string;
  sector: string;
  yearlyClose: number; // Jan 2, 2026 CLOSE price - YTD baseline (2026 day one close)
  pmScore: number;
  lastUpdated: string;
}

// YTD_START constant - January 2, 2026 is the anchor for all YTD calculations
export const YTD_START = '2026-01-02';

// Initial database with real January 2, 2026 CLOSING prices (day one close)
export const stockDatabase: Record<string, StockData> = {
  // Mag 7 + Bitcoin (Core Portfolio)
  "NVDA": {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    assetClass: "AI Hardware",
    sector: "Technology",
    yearlyClose: 138.31, // Jan 2, 2026 CLOSE
    pmScore: 98,
    lastUpdated: "2026-01-28"
  },
  "MSFT": {
    ticker: "MSFT",
    name: "Microsoft Corp",
    assetClass: "Cloud/AI",
    sector: "Technology",
    yearlyClose: 418.58, // Jan 2, 2026 CLOSE
    pmScore: 94,
    lastUpdated: "2026-01-28"
  },
  "AAPL": {
    ticker: "AAPL",
    name: "Apple Inc.",
    assetClass: "Consumer Tech",
    sector: "Technology",
    yearlyClose: 243.85, // Jan 2, 2026 CLOSE
    pmScore: 89,
    lastUpdated: "2026-01-28"
  },
  "GOOGL": {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    assetClass: "Search/AI",
    sector: "Technology",
    yearlyClose: 189.43, // Jan 2, 2026 CLOSE
    pmScore: 92,
    lastUpdated: "2026-01-28"
  },
  "AMZN": {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    assetClass: "E-Commerce",
    sector: "Consumer Cyclical",
    yearlyClose: 220.22, // Jan 2, 2026 CLOSE
    pmScore: 90,
    lastUpdated: "2026-01-28"
  },
  "META": {
    ticker: "META",
    name: "Meta Platforms Inc.",
    assetClass: "Social/AI",
    sector: "Technology",
    yearlyClose: 599.24, // Jan 2, 2026 CLOSE
    pmScore: 91,
    lastUpdated: "2026-01-28"
  },
  "TSLA": {
    ticker: "TSLA",
    name: "Tesla Inc.",
    assetClass: "Auto/Robotics",
    sector: "Consumer Cyclical",
    yearlyClose: 379.28, // Jan 2, 2026 CLOSE
    pmScore: 85,
    lastUpdated: "2026-01-28"
  },
  "BTC-USD": {
    ticker: "BTC-USD",
    name: "Bitcoin",
    assetClass: "Digital Assets",
    sector: "Cryptocurrency",
    yearlyClose: 96886.88, // Jan 2, 2026 CLOSE
    pmScore: 88,
    lastUpdated: "2026-01-28"
  },

  // Innovation Portfolio
  "RKLB": {
    ticker: "RKLB",
    name: "Rocket Lab USA",
    assetClass: "Space",
    sector: "Aerospace",
    yearlyClose: 24.96, // Jan 2, 2026 CLOSE
    pmScore: 94,
    lastUpdated: "2026-01-28"
  },
  "SMCI": {
    ticker: "SMCI",
    name: "Super Micro Computer",
    assetClass: "Data Center",
    sector: "Technology",
    yearlyClose: 30.05, // Jan 2, 2026 CLOSE
    pmScore: 78,
    lastUpdated: "2026-01-28"
  },
  "VRT": {
    ticker: "VRT",
    name: "Vertiv Holdings",
    assetClass: "Data Center",
    sector: "Industrials",
    yearlyClose: 118.30, // Jan 2, 2026 CLOSE
    pmScore: 86,
    lastUpdated: "2026-01-28"
  },
  "AVGO": {
    ticker: "AVGO",
    name: "Broadcom Inc.",
    assetClass: "AI Hardware",
    sector: "Technology",
    yearlyClose: 231.98, // Jan 2, 2026 CLOSE
    pmScore: 93,
    lastUpdated: "2026-01-28"
  },
  "IONQ": {
    ticker: "IONQ",
    name: "IonQ Inc.",
    assetClass: "Quantum",
    sector: "Technology",
    yearlyClose: 43.10, // Jan 2, 2026 CLOSE
    pmScore: 82,
    lastUpdated: "2026-01-28"
  },

  // Robotics Portfolio
  "ISRG": {
    ticker: "ISRG",
    name: "Intuitive Surgical",
    assetClass: "Auto/Robotics",
    sector: "Healthcare",
    yearlyClose: 524.03, // Jan 2, 2026 CLOSE
    pmScore: 91,
    lastUpdated: "2026-01-28"
  },
  "ABB": {
    ticker: "ABB",
    name: "ABB Ltd",
    assetClass: "Auto/Robotics",
    sector: "Industrials",
    yearlyClose: 53.52, // Jan 2, 2026 CLOSE
    pmScore: 84,
    lastUpdated: "2026-01-28"
  },
  "FANUY": {
    ticker: "FANUY",
    name: "Fanuc Corporation",
    assetClass: "Auto/Robotics",
    sector: "Industrials",
    yearlyClose: 13.08, // Jan 2, 2026 CLOSE
    pmScore: 80,
    lastUpdated: "2026-01-28"
  },
  "PATH": {
    ticker: "PATH",
    name: "UiPath Inc.",
    assetClass: "Auto/Robotics",
    sector: "Technology",
    yearlyClose: 12.93, // Jan 2, 2026 CLOSE
    pmScore: 75,
    lastUpdated: "2026-01-28"
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
