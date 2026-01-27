// Central registry for all stock metadata - Single source of truth
export interface StockData {
  ticker: string;
  name: string;
  assetClass: string;
  sector: string;
  yearlyOpen: number; // Jan 2, 2026 open price - used for YTD calculation
  pmScore: number;
  lastUpdated: string;
}

// Initial database with real Jan 2, 2026 open prices
export const stockDatabase: Record<string, StockData> = {
  // Mag 7 + Bitcoin (Core Portfolio)
  "NVDA": {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    assetClass: "AI Hardware",
    sector: "Technology",
    yearlyOpen: 189.84,
    pmScore: 98,
    lastUpdated: "2026-01-02"
  },
  "MSFT": {
    ticker: "MSFT",
    name: "Microsoft Corp",
    assetClass: "Cloud/AI",
    sector: "Technology",
    yearlyOpen: 472.94,
    pmScore: 94,
    lastUpdated: "2026-01-02"
  },
  "AAPL": {
    ticker: "AAPL",
    name: "Apple Inc.",
    assetClass: "Consumer Tech",
    sector: "Technology",
    yearlyOpen: 271.01,
    pmScore: 89,
    lastUpdated: "2026-01-02"
  },
  "GOOGL": {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    assetClass: "Search/AI",
    sector: "Technology",
    yearlyOpen: 318.50,
    pmScore: 92,
    lastUpdated: "2026-01-02"
  },
  "AMZN": {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    assetClass: "E-Commerce",
    sector: "Consumer Cyclical",
    yearlyOpen: 234.80,
    pmScore: 90,
    lastUpdated: "2026-01-02"
  },
  "META": {
    ticker: "META",
    name: "Meta Platforms Inc.",
    assetClass: "Social/AI",
    sector: "Technology",
    yearlyOpen: 632.40,
    pmScore: 91,
    lastUpdated: "2026-01-02"
  },
  "TSLA": {
    ticker: "TSLA",
    name: "Tesla Inc.",
    assetClass: "Auto/Robotics",
    sector: "Consumer Cyclical",
    yearlyOpen: 475.52,
    pmScore: 85,
    lastUpdated: "2026-01-02"
  },
  "BTC-USD": {
    ticker: "BTC-USD",
    name: "Bitcoin",
    assetClass: "Digital Assets",
    sector: "Cryptocurrency",
    yearlyOpen: 87586.00,
    pmScore: 88,
    lastUpdated: "2026-01-02"
  },

  // Innovation Portfolio
  "RKLB": {
    ticker: "RKLB",
    name: "Rocket Lab USA",
    assetClass: "Space",
    sector: "Aerospace",
    yearlyOpen: 65.50,
    pmScore: 94,
    lastUpdated: "2026-01-02"
  },
  "SMCI": {
    ticker: "SMCI",
    name: "Super Micro Computer",
    assetClass: "Data Center",
    sector: "Technology",
    yearlyOpen: 35.20,
    pmScore: 78,
    lastUpdated: "2026-01-02"
  },
  "VRT": {
    ticker: "VRT",
    name: "Vertiv Holdings",
    assetClass: "Data Center",
    sector: "Industrials",
    yearlyOpen: 142.30,
    pmScore: 86,
    lastUpdated: "2026-01-02"
  },
  "AVGO": {
    ticker: "AVGO",
    name: "Broadcom Inc.",
    assetClass: "AI Hardware",
    sector: "Technology",
    yearlyOpen: 343.00,
    pmScore: 93,
    lastUpdated: "2026-01-02"
  },
  "IONQ": {
    ticker: "IONQ",
    name: "IonQ Inc.",
    assetClass: "Quantum",
    sector: "Technology",
    yearlyOpen: 52.80,
    pmScore: 82,
    lastUpdated: "2026-01-02"
  },

  // Robotics Portfolio
  "ISRG": {
    ticker: "ISRG",
    name: "Intuitive Surgical",
    assetClass: "Auto/Robotics",
    sector: "Healthcare",
    yearlyOpen: 566.36,
    pmScore: 91,
    lastUpdated: "2026-01-02"
  },
  "IRBT": {
    ticker: "IRBT",
    name: "iRobot Corporation",
    assetClass: "Auto/Robotics",
    sector: "Consumer Cyclical",
    yearlyOpen: 8.90,
    pmScore: 62,
    lastUpdated: "2026-01-02"
  },
  "ABB": {
    ticker: "ABB",
    name: "ABB Ltd",
    assetClass: "Auto/Robotics",
    sector: "Industrials",
    yearlyOpen: 57.20,
    pmScore: 84,
    lastUpdated: "2026-01-02"
  },
  "FANUY": {
    ticker: "FANUY",
    name: "Fanuc Corporation",
    assetClass: "Auto/Robotics",
    sector: "Industrials",
    yearlyOpen: 30.50,
    pmScore: 80,
    lastUpdated: "2026-01-02"
  },
  "PATH": {
    ticker: "PATH",
    name: "UiPath Inc.",
    assetClass: "Auto/Robotics",
    sector: "Technology",
    yearlyOpen: 14.80,
    pmScore: 75,
    lastUpdated: "2026-01-02"
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
