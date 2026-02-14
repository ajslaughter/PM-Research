import { NextRequest, NextResponse } from "next/server";

interface StockEntry {
    ticker: string;
    name: string;
    sector: string;
    industry: string;
    weight: number;
}

// ===== S&P 500 =====
const SP500_MAP: StockEntry[] = [
    // TECHNOLOGY
    { ticker: "MSFT", name: "Microsoft", sector: "Technology", industry: "Software - Infrastructure", weight: 6.5 },
    { ticker: "ORCL", name: "Oracle", sector: "Technology", industry: "Software - Infrastructure", weight: 1.3 },
    { ticker: "PLTR", name: "Palantir", sector: "Technology", industry: "Software - Infrastructure", weight: 0.4 },
    { ticker: "SNPS", name: "Synopsys", sector: "Technology", industry: "Software - Infrastructure", weight: 0.3 },
    { ticker: "CDNS", name: "Cadence", sector: "Technology", industry: "Software - Infrastructure", weight: 0.25 },
    { ticker: "FTNT", name: "Fortinet", sector: "Technology", industry: "Software - Infrastructure", weight: 0.2 },
    { ticker: "CRM", name: "Salesforce", sector: "Technology", industry: "Software - Application", weight: 0.8 },
    { ticker: "ADBE", name: "Adobe", sector: "Technology", industry: "Software - Application", weight: 0.6 },
    { ticker: "INTU", name: "Intuit", sector: "Technology", industry: "Software - Application", weight: 0.45 },
    { ticker: "NOW", name: "ServiceNow", sector: "Technology", industry: "Software - Application", weight: 0.5 },
    { ticker: "ADP", name: "ADP", sector: "Technology", industry: "Software - Application", weight: 0.3 },
    { ticker: "UBER", name: "Uber", sector: "Technology", industry: "Software - Application", weight: 0.35 },
    { ticker: "AAPL", name: "Apple", sector: "Technology", industry: "Consumer Electronics", weight: 7.0 },
    { ticker: "NVDA", name: "NVIDIA", sector: "Technology", industry: "Semiconductors", weight: 6.0 },
    { ticker: "AVGO", name: "Broadcom", sector: "Technology", industry: "Semiconductors", weight: 2.0 },
    { ticker: "AMD", name: "AMD", sector: "Technology", industry: "Semiconductors", weight: 0.7 },
    { ticker: "QCOM", name: "Qualcomm", sector: "Technology", industry: "Semiconductors", weight: 0.5 },
    { ticker: "TXN", name: "Texas Inst.", sector: "Technology", industry: "Semiconductors", weight: 0.5 },
    { ticker: "MU", name: "Micron", sector: "Technology", industry: "Semiconductors", weight: 0.35 },
    { ticker: "INTC", name: "Intel", sector: "Technology", industry: "Semiconductors", weight: 0.3 },
    { ticker: "LRCX", name: "Lam Research", sector: "Technology", industry: "Semiconductors", weight: 0.3 },
    { ticker: "KLAC", name: "KLA Corp", sector: "Technology", industry: "Semiconductors", weight: 0.25 },
    { ticker: "AMAT", name: "Applied Mat.", sector: "Technology", industry: "Semiconductors", weight: 0.3 },
    { ticker: "ADI", name: "Analog Dev.", sector: "Technology", industry: "Semiconductors", weight: 0.3 },
    { ticker: "MRVL", name: "Marvell", sector: "Technology", industry: "Semiconductors", weight: 0.2 },
    { ticker: "ON", name: "ON Semi", sector: "Technology", industry: "Semiconductors", weight: 0.15 },
    { ticker: "IBM", name: "IBM", sector: "Technology", industry: "IT Services", weight: 0.5 },
    { ticker: "ACN", name: "Accenture", sector: "Technology", industry: "IT Services", weight: 0.5 },
    { ticker: "FIS", name: "FIS", sector: "Technology", industry: "IT Services", weight: 0.2 },
    { ticker: "CSCO", name: "Cisco", sector: "Technology", industry: "Communication Equip.", weight: 0.5 },
    { ticker: "MSI", name: "Motorola", sector: "Technology", industry: "Communication Equip.", weight: 0.2 },
    { ticker: "APH", name: "Amphenol", sector: "Technology", industry: "Electronic Equip.", weight: 0.25 },
    { ticker: "GLW", name: "Corning", sector: "Technology", industry: "Electronic Equip.", weight: 0.1 },
    // CONSUMER CYCLICAL
    { ticker: "AMZN", name: "Amazon", sector: "Consumer Cyclical", industry: "Internet Retail", weight: 3.8 },
    { ticker: "TSLA", name: "Tesla", sector: "Consumer Cyclical", industry: "Auto Manufacturers", weight: 2.0 },
    { ticker: "GM", name: "GM", sector: "Consumer Cyclical", industry: "Auto Manufacturers", weight: 0.15 },
    { ticker: "F", name: "Ford", sector: "Consumer Cyclical", industry: "Auto Manufacturers", weight: 0.1 },
    { ticker: "HD", name: "Home Depot", sector: "Consumer Cyclical", industry: "Home Improvement", weight: 0.9 },
    { ticker: "LOW", name: "Lowe's", sector: "Consumer Cyclical", industry: "Home Improvement", weight: 0.4 },
    { ticker: "MCD", name: "McDonald's", sector: "Consumer Cyclical", industry: "Restaurants", weight: 0.5 },
    { ticker: "SBUX", name: "Starbucks", sector: "Consumer Cyclical", industry: "Restaurants", weight: 0.25 },
    { ticker: "CMG", name: "Chipotle", sector: "Consumer Cyclical", industry: "Restaurants", weight: 0.2 },
    { ticker: "YUM", name: "Yum! Brands", sector: "Consumer Cyclical", industry: "Restaurants", weight: 0.1 },
    { ticker: "BKNG", name: "Booking", sector: "Consumer Cyclical", industry: "Travel Services", weight: 0.4 },
    { ticker: "ABNB", name: "Airbnb", sector: "Consumer Cyclical", industry: "Travel Services", weight: 0.2 },
    { ticker: "NKE", name: "Nike", sector: "Consumer Cyclical", industry: "Apparel", weight: 0.3 },
    { ticker: "TJX", name: "TJX", sector: "Consumer Cyclical", industry: "Apparel", weight: 0.3 },
    { ticker: "ROST", name: "Ross Stores", sector: "Consumer Cyclical", industry: "Apparel", weight: 0.1 },
    { ticker: "ORLY", name: "O'Reilly", sector: "Consumer Cyclical", industry: "Auto Parts", weight: 0.15 },
    { ticker: "AZO", name: "AutoZone", sector: "Consumer Cyclical", industry: "Auto Parts", weight: 0.15 },
    // COMMUNICATION
    { ticker: "GOOGL", name: "Alphabet A", sector: "Communication", industry: "Internet Content", weight: 2.0 },
    { ticker: "GOOG", name: "Alphabet C", sector: "Communication", industry: "Internet Content", weight: 1.7 },
    { ticker: "META", name: "Meta", sector: "Communication", industry: "Internet Content", weight: 2.8 },
    { ticker: "NFLX", name: "Netflix", sector: "Communication", industry: "Entertainment", weight: 0.8 },
    { ticker: "DIS", name: "Disney", sector: "Communication", industry: "Entertainment", weight: 0.5 },
    { ticker: "WBD", name: "Warner Bros", sector: "Communication", industry: "Entertainment", weight: 0.08 },
    { ticker: "TMUS", name: "T-Mobile", sector: "Communication", industry: "Telecom", weight: 0.35 },
    { ticker: "VZ", name: "Verizon", sector: "Communication", industry: "Telecom", weight: 0.25 },
    { ticker: "T", name: "AT&T", sector: "Communication", industry: "Telecom", weight: 0.2 },
    { ticker: "SNAP", name: "Snap", sector: "Communication", industry: "Interactive Media", weight: 0.05 },
    { ticker: "PINS", name: "Pinterest", sector: "Communication", industry: "Interactive Media", weight: 0.05 },
    // FINANCIALS
    { ticker: "JPM", name: "JPMorgan", sector: "Financials", industry: "Banks - Diversified", weight: 1.5 },
    { ticker: "BAC", name: "BofA", sector: "Financials", industry: "Banks - Diversified", weight: 0.7 },
    { ticker: "WFC", name: "Wells Fargo", sector: "Financials", industry: "Banks - Diversified", weight: 0.5 },
    { ticker: "C", name: "Citigroup", sector: "Financials", industry: "Banks - Diversified", weight: 0.3 },
    { ticker: "USB", name: "US Bancorp", sector: "Financials", industry: "Banks - Diversified", weight: 0.15 },
    { ticker: "V", name: "Visa", sector: "Financials", industry: "Credit Services", weight: 1.1 },
    { ticker: "MA", name: "Mastercard", sector: "Financials", industry: "Credit Services", weight: 0.9 },
    { ticker: "AXP", name: "AmEx", sector: "Financials", industry: "Credit Services", weight: 0.4 },
    { ticker: "COF", name: "Capital One", sector: "Financials", industry: "Credit Services", weight: 0.15 },
    { ticker: "BRK-B", name: "Berkshire", sector: "Financials", industry: "Insurance - Diversified", weight: 1.8 },
    { ticker: "GS", name: "Goldman", sector: "Financials", industry: "Capital Markets", weight: 0.5 },
    { ticker: "MS", name: "Morgan Stanley", sector: "Financials", industry: "Capital Markets", weight: 0.4 },
    { ticker: "SCHW", name: "Schwab", sector: "Financials", industry: "Capital Markets", weight: 0.3 },
    { ticker: "BLK", name: "BlackRock", sector: "Financials", industry: "Capital Markets", weight: 0.35 },
    { ticker: "ICE", name: "ICE", sector: "Financials", industry: "Capital Markets", weight: 0.2 },
    { ticker: "CME", name: "CME Group", sector: "Financials", industry: "Capital Markets", weight: 0.2 },
    { ticker: "SPGI", name: "S&P Global", sector: "Financials", industry: "Financial Data", weight: 0.35 },
    { ticker: "MCO", name: "Moody's", sector: "Financials", industry: "Financial Data", weight: 0.2 },
    { ticker: "PGR", name: "Progressive", sector: "Financials", industry: "Insurance", weight: 0.3 },
    { ticker: "CB", name: "Chubb", sector: "Financials", industry: "Insurance", weight: 0.25 },
    { ticker: "MET", name: "MetLife", sector: "Financials", industry: "Insurance", weight: 0.1 },
    { ticker: "AFL", name: "Aflac", sector: "Financials", industry: "Insurance", weight: 0.1 },
    { ticker: "AIG", name: "AIG", sector: "Financials", industry: "Insurance", weight: 0.1 },
    // HEALTHCARE
    { ticker: "LLY", name: "Eli Lilly", sector: "Healthcare", industry: "Drug Manufacturers", weight: 1.7 },
    { ticker: "JNJ", name: "J&J", sector: "Healthcare", industry: "Drug Manufacturers", weight: 0.9 },
    { ticker: "ABBV", name: "AbbVie", sector: "Healthcare", industry: "Drug Manufacturers", weight: 0.8 },
    { ticker: "MRK", name: "Merck", sector: "Healthcare", industry: "Drug Manufacturers", weight: 0.6 },
    { ticker: "PFE", name: "Pfizer", sector: "Healthcare", industry: "Drug Manufacturers", weight: 0.4 },
    { ticker: "BMY", name: "Bristol-Myers", sector: "Healthcare", industry: "Drug Manufacturers", weight: 0.25 },
    { ticker: "AMGN", name: "Amgen", sector: "Healthcare", industry: "Drug Manufacturers", weight: 0.4 },
    { ticker: "GILD", name: "Gilead", sector: "Healthcare", industry: "Drug Manufacturers", weight: 0.25 },
    { ticker: "REGN", name: "Regeneron", sector: "Healthcare", industry: "Drug Manufacturers", weight: 0.2 },
    { ticker: "VRTX", name: "Vertex", sector: "Healthcare", industry: "Drug Manufacturers", weight: 0.25 },
    { ticker: "UNH", name: "UnitedHealth", sector: "Healthcare", industry: "Healthcare Plans", weight: 1.3 },
    { ticker: "ELV", name: "Elevance", sector: "Healthcare", industry: "Healthcare Plans", weight: 0.25 },
    { ticker: "CI", name: "Cigna", sector: "Healthcare", industry: "Healthcare Plans", weight: 0.25 },
    { ticker: "HUM", name: "Humana", sector: "Healthcare", industry: "Healthcare Plans", weight: 0.1 },
    { ticker: "ABT", name: "Abbott", sector: "Healthcare", industry: "Medical Devices", weight: 0.5 },
    { ticker: "BSX", name: "Boston Sci.", sector: "Healthcare", industry: "Medical Devices", weight: 0.35 },
    { ticker: "MDT", name: "Medtronic", sector: "Healthcare", industry: "Medical Devices", weight: 0.25 },
    { ticker: "ISRG", name: "Intuitive Surg.", sector: "Healthcare", industry: "Medical Devices", weight: 0.45 },
    { ticker: "SYK", name: "Stryker", sector: "Healthcare", industry: "Medical Devices", weight: 0.3 },
    { ticker: "EW", name: "Edwards Life", sector: "Healthcare", industry: "Medical Devices", weight: 0.1 },
    { ticker: "TMO", name: "Thermo Fisher", sector: "Healthcare", industry: "Diagnostics", weight: 0.5 },
    { ticker: "DHR", name: "Danaher", sector: "Healthcare", industry: "Diagnostics", weight: 0.4 },
    { ticker: "A", name: "Agilent", sector: "Healthcare", industry: "Diagnostics", weight: 0.1 },
    { ticker: "MCK", name: "McKesson", sector: "Healthcare", industry: "Medical Distrib.", weight: 0.2 },
    { ticker: "COR", name: "Cencora", sector: "Healthcare", industry: "Medical Distrib.", weight: 0.1 },
    // INDUSTRIALS
    { ticker: "GE", name: "GE Aero", sector: "Industrials", industry: "Aerospace & Defense", weight: 0.9 },
    { ticker: "RTX", name: "RTX", sector: "Industrials", industry: "Aerospace & Defense", weight: 0.4 },
    { ticker: "LMT", name: "Lockheed", sector: "Industrials", industry: "Aerospace & Defense", weight: 0.3 },
    { ticker: "BA", name: "Boeing", sector: "Industrials", industry: "Aerospace & Defense", weight: 0.3 },
    { ticker: "GD", name: "General Dyn.", sector: "Industrials", industry: "Aerospace & Defense", weight: 0.2 },
    { ticker: "NOC", name: "Northrop", sector: "Industrials", industry: "Aerospace & Defense", weight: 0.15 },
    { ticker: "HWM", name: "Howmet", sector: "Industrials", industry: "Aerospace & Defense", weight: 0.15 },
    { ticker: "TDG", name: "TransDigm", sector: "Industrials", industry: "Aerospace & Defense", weight: 0.2 },
    { ticker: "CAT", name: "Caterpillar", sector: "Industrials", industry: "Farm & Heavy Equip.", weight: 0.5 },
    { ticker: "DE", name: "Deere", sector: "Industrials", industry: "Farm & Heavy Equip.", weight: 0.3 },
    { ticker: "UNP", name: "Union Pacific", sector: "Industrials", industry: "Railroads", weight: 0.4 },
    { ticker: "CSX", name: "CSX", sector: "Industrials", industry: "Railroads", weight: 0.15 },
    { ticker: "NSC", name: "Norfolk So.", sector: "Industrials", industry: "Railroads", weight: 0.1 },
    { ticker: "HON", name: "Honeywell", sector: "Industrials", industry: "Specialty Industrial", weight: 0.4 },
    { ticker: "ETN", name: "Eaton", sector: "Industrials", industry: "Specialty Industrial", weight: 0.35 },
    { ticker: "EMR", name: "Emerson", sector: "Industrials", industry: "Specialty Industrial", weight: 0.2 },
    { ticker: "ITW", name: "Illinois Tool", sector: "Industrials", industry: "Specialty Industrial", weight: 0.2 },
    { ticker: "JCI", name: "Johnson Ctrl.", sector: "Industrials", industry: "Building Products", weight: 0.1 },
    { ticker: "CARR", name: "Carrier", sector: "Industrials", industry: "Building Products", weight: 0.15 },
    { ticker: "WM", name: "Waste Mgmt", sector: "Industrials", industry: "Waste Management", weight: 0.2 },
    { ticker: "RSG", name: "Republic Svcs", sector: "Industrials", industry: "Waste Management", weight: 0.15 },
    { ticker: "VRSK", name: "Verisk", sector: "Industrials", industry: "Consulting", weight: 0.1 },
    { ticker: "PWR", name: "Quanta Svcs", sector: "Industrials", industry: "Electrical Equip.", weight: 0.15 },
    { ticker: "FAST", name: "Fastenal", sector: "Industrials", industry: "Electrical Equip.", weight: 0.1 },
    // CONSUMER DEFENSIVE
    { ticker: "WMT", name: "Walmart", sector: "Consumer Defensive", industry: "Discount Stores", weight: 1.0 },
    { ticker: "COST", name: "Costco", sector: "Consumer Defensive", industry: "Discount Stores", weight: 0.9 },
    { ticker: "TGT", name: "Target", sector: "Consumer Defensive", industry: "Discount Stores", weight: 0.15 },
    { ticker: "DG", name: "Dollar Gen.", sector: "Consumer Defensive", industry: "Discount Stores", weight: 0.05 },
    { ticker: "PG", name: "P&G", sector: "Consumer Defensive", industry: "Household Products", weight: 0.8 },
    { ticker: "CL", name: "Colgate", sector: "Consumer Defensive", industry: "Household Products", weight: 0.2 },
    { ticker: "KMB", name: "Kimberly-Clark", sector: "Consumer Defensive", industry: "Household Products", weight: 0.1 },
    { ticker: "KO", name: "Coca-Cola", sector: "Consumer Defensive", industry: "Beverages", weight: 0.5 },
    { ticker: "PEP", name: "PepsiCo", sector: "Consumer Defensive", industry: "Beverages", weight: 0.5 },
    { ticker: "MDLZ", name: "Mondelez", sector: "Consumer Defensive", industry: "Beverages", weight: 0.2 },
    { ticker: "STZ", name: "Constellation", sector: "Consumer Defensive", industry: "Beverages", weight: 0.1 },
    { ticker: "MO", name: "Altria", sector: "Consumer Defensive", industry: "Tobacco", weight: 0.15 },
    { ticker: "PM", name: "Philip Morris", sector: "Consumer Defensive", industry: "Tobacco", weight: 0.4 },
    { ticker: "GIS", name: "General Mills", sector: "Consumer Defensive", industry: "Packaged Foods", weight: 0.08 },
    { ticker: "HSY", name: "Hershey", sector: "Consumer Defensive", industry: "Packaged Foods", weight: 0.08 },
    { ticker: "SJM", name: "JM Smucker", sector: "Consumer Defensive", industry: "Packaged Foods", weight: 0.05 },
    { ticker: "K", name: "Kellanova", sector: "Consumer Defensive", industry: "Packaged Foods", weight: 0.05 },
    // ENERGY
    { ticker: "XOM", name: "Exxon", sector: "Energy", industry: "Oil & Gas Integrated", weight: 1.2 },
    { ticker: "CVX", name: "Chevron", sector: "Energy", industry: "Oil & Gas Integrated", weight: 0.7 },
    { ticker: "COP", name: "ConocoPhillips", sector: "Energy", industry: "Oil & Gas E&P", weight: 0.4 },
    { ticker: "EOG", name: "EOG Resources", sector: "Energy", industry: "Oil & Gas E&P", weight: 0.2 },
    { ticker: "PXD", name: "Pioneer", sector: "Energy", industry: "Oil & Gas E&P", weight: 0.15 },
    { ticker: "DVN", name: "Devon Energy", sector: "Energy", industry: "Oil & Gas E&P", weight: 0.08 },
    { ticker: "FANG", name: "Diamondback", sector: "Energy", industry: "Oil & Gas E&P", weight: 0.1 },
    { ticker: "WMB", name: "Williams", sector: "Energy", industry: "Oil & Gas Midstream", weight: 0.12 },
    { ticker: "KMI", name: "Kinder Morgan", sector: "Energy", industry: "Oil & Gas Midstream", weight: 0.08 },
    { ticker: "OKE", name: "ONEOK", sector: "Energy", industry: "Oil & Gas Midstream", weight: 0.1 },
    { ticker: "SLB", name: "Schlumberger", sector: "Energy", industry: "Oil & Gas Equipment", weight: 0.15 },
    { ticker: "HAL", name: "Halliburton", sector: "Energy", industry: "Oil & Gas Equipment", weight: 0.06 },
    { ticker: "BKR", name: "Baker Hughes", sector: "Energy", industry: "Oil & Gas Equipment", weight: 0.08 },
    // REAL ESTATE
    { ticker: "PLD", name: "Prologis", sector: "Real Estate", industry: "REIT - Industrial", weight: 0.3 },
    { ticker: "AMT", name: "American Tower", sector: "Real Estate", industry: "REIT - Infrastructure", weight: 0.2 },
    { ticker: "EQIX", name: "Equinix", sector: "Real Estate", industry: "REIT - Infrastructure", weight: 0.2 },
    { ticker: "CCI", name: "Crown Castle", sector: "Real Estate", industry: "REIT - Infrastructure", weight: 0.1 },
    { ticker: "PSA", name: "Public Storage", sector: "Real Estate", industry: "REIT - Storage", weight: 0.12 },
    { ticker: "SPG", name: "Simon Property", sector: "Real Estate", industry: "REIT - Retail", weight: 0.12 },
    { ticker: "WELL", name: "Welltower", sector: "Real Estate", industry: "REIT - Healthcare", weight: 0.1 },
    { ticker: "O", name: "Realty Income", sector: "Real Estate", industry: "REIT - Retail", weight: 0.1 },
    { ticker: "DLR", name: "Digital Realty", sector: "Real Estate", industry: "REIT - Infrastructure", weight: 0.1 },
    // UTILITIES
    { ticker: "NEE", name: "NextEra", sector: "Utilities", industry: "Utilities - Regulated", weight: 0.4 },
    { ticker: "SO", name: "Southern Co", sector: "Utilities", industry: "Utilities - Regulated", weight: 0.2 },
    { ticker: "DUK", name: "Duke Energy", sector: "Utilities", industry: "Utilities - Regulated", weight: 0.2 },
    { ticker: "CEG", name: "Constellation", sector: "Utilities", industry: "Utilities - Regulated", weight: 0.15 },
    { ticker: "SRE", name: "Sempra", sector: "Utilities", industry: "Utilities - Regulated", weight: 0.12 },
    { ticker: "AEP", name: "AEP", sector: "Utilities", industry: "Utilities - Regulated", weight: 0.12 },
    { ticker: "D", name: "Dominion", sector: "Utilities", industry: "Utilities - Regulated", weight: 0.1 },
    { ticker: "EXC", name: "Exelon", sector: "Utilities", industry: "Utilities - Regulated", weight: 0.1 },
    { ticker: "ED", name: "Con Edison", sector: "Utilities", industry: "Utilities - Regulated", weight: 0.08 },
    { ticker: "ES", name: "Eversource", sector: "Utilities", industry: "Utilities - Regulated", weight: 0.05 },
    { ticker: "XEL", name: "Xcel Energy", sector: "Utilities", industry: "Utilities - Regulated", weight: 0.06 },
    // BASIC MATERIALS
    { ticker: "LIN", name: "Linde", sector: "Basic Materials", industry: "Specialty Chemicals", weight: 0.5 },
    { ticker: "SHW", name: "Sherwin-W.", sector: "Basic Materials", industry: "Specialty Chemicals", weight: 0.2 },
    { ticker: "APD", name: "Air Products", sector: "Basic Materials", industry: "Specialty Chemicals", weight: 0.2 },
    { ticker: "ECL", name: "Ecolab", sector: "Basic Materials", industry: "Specialty Chemicals", weight: 0.15 },
    { ticker: "FCX", name: "Freeport", sector: "Basic Materials", industry: "Copper", weight: 0.12 },
    { ticker: "NEM", name: "Newmont", sector: "Basic Materials", industry: "Gold", weight: 0.12 },
    { ticker: "NUE", name: "Nucor", sector: "Basic Materials", industry: "Steel", weight: 0.08 },
    { ticker: "DOW", name: "Dow", sector: "Basic Materials", industry: "Chemicals", weight: 0.08 },
    { ticker: "DD", name: "DuPont", sector: "Basic Materials", industry: "Chemicals", weight: 0.08 },
    { ticker: "CRH", name: "CRH", sector: "Basic Materials", industry: "Building Materials", weight: 0.12 },
];

// ===== DOW JONES 30 =====
const DOW30_MAP: StockEntry[] = [
    { ticker: "AAPL", name: "Apple", sector: "Technology", industry: "Consumer Electronics", weight: 3.2 },
    { ticker: "MSFT", name: "Microsoft", sector: "Technology", industry: "Software", weight: 3.0 },
    { ticker: "UNH", name: "UnitedHealth", sector: "Healthcare", industry: "Healthcare Plans", weight: 8.5 },
    { ticker: "GS", name: "Goldman Sachs", sector: "Financials", industry: "Capital Markets", weight: 7.5 },
    { ticker: "HD", name: "Home Depot", sector: "Consumer Cyclical", industry: "Home Improvement", weight: 5.8 },
    { ticker: "AMGN", name: "Amgen", sector: "Healthcare", industry: "Drug Manufacturers", weight: 4.5 },
    { ticker: "CAT", name: "Caterpillar", sector: "Industrials", industry: "Farm & Heavy Equip.", weight: 5.2 },
    { ticker: "V", name: "Visa", sector: "Financials", industry: "Credit Services", weight: 4.1 },
    { ticker: "MCD", name: "McDonald's", sector: "Consumer Cyclical", industry: "Restaurants", weight: 4.3 },
    { ticker: "CRM", name: "Salesforce", sector: "Technology", industry: "Software", weight: 4.2 },
    { ticker: "TRV", name: "Travelers", sector: "Financials", industry: "Insurance", weight: 3.7 },
    { ticker: "AXP", name: "AmEx", sector: "Financials", industry: "Credit Services", weight: 4.0 },
    { ticker: "BA", name: "Boeing", sector: "Industrials", industry: "Aerospace & Defense", weight: 2.5 },
    { ticker: "JPM", name: "JPMorgan", sector: "Financials", industry: "Banks", weight: 3.8 },
    { ticker: "IBM", name: "IBM", sector: "Technology", industry: "IT Services", weight: 3.3 },
    { ticker: "NVDA", name: "NVIDIA", sector: "Technology", industry: "Semiconductors", weight: 2.0 },
    { ticker: "MMM", name: "3M", sector: "Industrials", industry: "Specialty Industrial", weight: 2.0 },
    { ticker: "JNJ", name: "J&J", sector: "Healthcare", industry: "Drug Manufacturers", weight: 2.5 },
    { ticker: "PG", name: "P&G", sector: "Consumer Defensive", industry: "Household Products", weight: 2.5 },
    { ticker: "DIS", name: "Disney", sector: "Communication", industry: "Entertainment", weight: 1.6 },
    { ticker: "MRK", name: "Merck", sector: "Healthcare", industry: "Drug Manufacturers", weight: 1.5 },
    { ticker: "WMT", name: "Walmart", sector: "Consumer Defensive", industry: "Discount Stores", weight: 1.2 },
    { ticker: "NKE", name: "Nike", sector: "Consumer Cyclical", industry: "Apparel", weight: 1.1 },
    { ticker: "KO", name: "Coca-Cola", sector: "Consumer Defensive", industry: "Beverages", weight: 1.0 },
    { ticker: "DOW", name: "Dow", sector: "Basic Materials", industry: "Chemicals", weight: 0.7 },
    { ticker: "CSCO", name: "Cisco", sector: "Technology", industry: "Communication Equip.", weight: 0.8 },
    { ticker: "INTC", name: "Intel", sector: "Technology", industry: "Semiconductors", weight: 0.3 },
    { ticker: "VZ", name: "Verizon", sector: "Communication", industry: "Telecom", weight: 0.6 },
    { ticker: "SHW", name: "Sherwin-W.", sector: "Basic Materials", industry: "Specialty Chemicals", weight: 5.0 },
    { ticker: "AMZN", name: "Amazon", sector: "Consumer Cyclical", industry: "Internet Retail", weight: 3.0 },
];

// ===== NASDAQ 100 =====
const NASDAQ100_MAP: StockEntry[] = [
    { ticker: "AAPL", name: "Apple", sector: "Technology", industry: "Consumer Electronics", weight: 9.0 },
    { ticker: "MSFT", name: "Microsoft", sector: "Technology", industry: "Software", weight: 8.5 },
    { ticker: "NVDA", name: "NVIDIA", sector: "Technology", industry: "Semiconductors", weight: 7.5 },
    { ticker: "AMZN", name: "Amazon", sector: "Consumer Cyclical", industry: "Internet Retail", weight: 5.0 },
    { ticker: "META", name: "Meta", sector: "Communication", industry: "Internet Content", weight: 4.5 },
    { ticker: "AVGO", name: "Broadcom", sector: "Technology", industry: "Semiconductors", weight: 4.0 },
    { ticker: "GOOGL", name: "Alphabet A", sector: "Communication", industry: "Internet Content", weight: 3.0 },
    { ticker: "GOOG", name: "Alphabet C", sector: "Communication", industry: "Internet Content", weight: 2.8 },
    { ticker: "TSLA", name: "Tesla", sector: "Consumer Cyclical", industry: "Auto Manufacturers", weight: 3.2 },
    { ticker: "COST", name: "Costco", sector: "Consumer Defensive", industry: "Discount Stores", weight: 2.5 },
    { ticker: "NFLX", name: "Netflix", sector: "Communication", industry: "Entertainment", weight: 2.0 },
    { ticker: "AMD", name: "AMD", sector: "Technology", industry: "Semiconductors", weight: 1.5 },
    { ticker: "ADBE", name: "Adobe", sector: "Technology", industry: "Software", weight: 1.3 },
    { ticker: "CRM", name: "Salesforce", sector: "Technology", industry: "Software", weight: 1.2 },
    { ticker: "QCOM", name: "Qualcomm", sector: "Technology", industry: "Semiconductors", weight: 1.1 },
    { ticker: "INTU", name: "Intuit", sector: "Technology", industry: "Software", weight: 1.0 },
    { ticker: "TMUS", name: "T-Mobile", sector: "Communication", industry: "Telecom", weight: 1.0 },
    { ticker: "AMGN", name: "Amgen", sector: "Healthcare", industry: "Drug Manufacturers", weight: 1.0 },
    { ticker: "ISRG", name: "Intuitive Surg.", sector: "Healthcare", industry: "Medical Devices", weight: 1.0 },
    { ticker: "TXN", name: "Texas Inst.", sector: "Technology", industry: "Semiconductors", weight: 0.9 },
    { ticker: "BKNG", name: "Booking", sector: "Consumer Cyclical", industry: "Travel Services", weight: 0.9 },
    { ticker: "NOW", name: "ServiceNow", sector: "Technology", industry: "Software", weight: 0.9 },
    { ticker: "AMAT", name: "Applied Mat.", sector: "Technology", industry: "Semiconductors", weight: 0.8 },
    { ticker: "LRCX", name: "Lam Research", sector: "Technology", industry: "Semiconductors", weight: 0.7 },
    { ticker: "MU", name: "Micron", sector: "Technology", industry: "Semiconductors", weight: 0.6 },
    { ticker: "ADI", name: "Analog Dev.", sector: "Technology", industry: "Semiconductors", weight: 0.6 },
    { ticker: "KLAC", name: "KLA Corp", sector: "Technology", industry: "Semiconductors", weight: 0.5 },
    { ticker: "SNPS", name: "Synopsys", sector: "Technology", industry: "Software", weight: 0.5 },
    { ticker: "CDNS", name: "Cadence", sector: "Technology", industry: "Software", weight: 0.5 },
    { ticker: "ADP", name: "ADP", sector: "Technology", industry: "Software", weight: 0.5 },
    { ticker: "PANW", name: "Palo Alto", sector: "Technology", industry: "Cybersecurity", weight: 0.5 },
    { ticker: "CRWD", name: "CrowdStrike", sector: "Technology", industry: "Cybersecurity", weight: 0.5 },
    { ticker: "FTNT", name: "Fortinet", sector: "Technology", industry: "Cybersecurity", weight: 0.4 },
    { ticker: "MRVL", name: "Marvell", sector: "Technology", industry: "Semiconductors", weight: 0.4 },
    { ticker: "UBER", name: "Uber", sector: "Technology", industry: "Software", weight: 0.4 },
    { ticker: "PEP", name: "PepsiCo", sector: "Consumer Defensive", industry: "Beverages", weight: 1.2 },
    { ticker: "LIN", name: "Linde", sector: "Basic Materials", industry: "Specialty Chemicals", weight: 0.8 },
    { ticker: "REGN", name: "Regeneron", sector: "Healthcare", industry: "Drug Manufacturers", weight: 0.5 },
    { ticker: "VRTX", name: "Vertex", sector: "Healthcare", industry: "Drug Manufacturers", weight: 0.5 },
    { ticker: "GILD", name: "Gilead", sector: "Healthcare", industry: "Drug Manufacturers", weight: 0.4 },
    { ticker: "MELI", name: "MercadoLibre", sector: "Consumer Cyclical", industry: "Internet Retail", weight: 0.5 },
    { ticker: "ABNB", name: "Airbnb", sector: "Consumer Cyclical", industry: "Travel Services", weight: 0.4 },
    { ticker: "PYPL", name: "PayPal", sector: "Financials", industry: "Credit Services", weight: 0.4 },
    { ticker: "INTC", name: "Intel", sector: "Technology", industry: "Semiconductors", weight: 0.3 },
    { ticker: "ON", name: "ON Semi", sector: "Technology", industry: "Semiconductors", weight: 0.3 },
    { ticker: "DXCM", name: "DexCom", sector: "Healthcare", industry: "Medical Devices", weight: 0.2 },
    { ticker: "DASH", name: "DoorDash", sector: "Technology", industry: "Software", weight: 0.3 },
    { ticker: "ORLY", name: "O'Reilly", sector: "Consumer Cyclical", industry: "Auto Parts", weight: 0.3 },
    { ticker: "CSX", name: "CSX", sector: "Industrials", industry: "Railroads", weight: 0.3 },
    { ticker: "PCAR", name: "PACCAR", sector: "Industrials", industry: "Farm & Heavy Equip.", weight: 0.3 },
];

// ===== ETFs =====
const ETF_MAP: StockEntry[] = [
    // Equity Index
    { ticker: "SPY", name: "S&P 500", sector: "Equity", industry: "US Large Cap", weight: 8.0 },
    { ticker: "VOO", name: "Vanguard S&P", sector: "Equity", industry: "US Large Cap", weight: 5.0 },
    { ticker: "IVV", name: "iShares S&P", sector: "Equity", industry: "US Large Cap", weight: 4.0 },
    { ticker: "QQQ", name: "Nasdaq 100", sector: "Equity", industry: "US Growth", weight: 6.0 },
    { ticker: "DIA", name: "Dow Jones", sector: "Equity", industry: "US Large Cap", weight: 2.0 },
    { ticker: "IWM", name: "Russell 2000", sector: "Equity", industry: "US Small Cap", weight: 2.5 },
    { ticker: "VTI", name: "Total Market", sector: "Equity", industry: "US Total", weight: 3.0 },
    { ticker: "MDY", name: "MidCap 400", sector: "Equity", industry: "US Mid Cap", weight: 1.0 },
    // Sector ETFs
    { ticker: "XLK", name: "Tech Select", sector: "Sector", industry: "Technology", weight: 3.0 },
    { ticker: "XLF", name: "Financial", sector: "Sector", industry: "Financials", weight: 1.5 },
    { ticker: "XLV", name: "Healthcare", sector: "Sector", industry: "Healthcare", weight: 1.5 },
    { ticker: "XLE", name: "Energy", sector: "Sector", industry: "Energy", weight: 1.5 },
    { ticker: "XLI", name: "Industrial", sector: "Sector", industry: "Industrials", weight: 1.0 },
    { ticker: "XLP", name: "Staples", sector: "Sector", industry: "Consumer Defensive", weight: 0.8 },
    { ticker: "XLY", name: "Discretionary", sector: "Sector", industry: "Consumer Cyclical", weight: 1.0 },
    { ticker: "XLC", name: "Communication", sector: "Sector", industry: "Communication", weight: 0.8 },
    { ticker: "XLRE", name: "Real Estate", sector: "Sector", industry: "Real Estate", weight: 0.5 },
    { ticker: "XLU", name: "Utilities", sector: "Sector", industry: "Utilities", weight: 0.5 },
    { ticker: "XLB", name: "Materials", sector: "Sector", industry: "Materials", weight: 0.5 },
    // Thematic
    { ticker: "ARKK", name: "ARK Innovation", sector: "Thematic", industry: "Innovation", weight: 0.8 },
    { ticker: "SOXX", name: "Semiconductor", sector: "Thematic", industry: "Semiconductors", weight: 1.5 },
    { ticker: "SMH", name: "VanEck Semi", sector: "Thematic", industry: "Semiconductors", weight: 1.0 },
    { ticker: "HACK", name: "Cybersecurity", sector: "Thematic", industry: "Cybersecurity", weight: 0.5 },
    { ticker: "TAN", name: "Solar", sector: "Thematic", industry: "Clean Energy", weight: 0.3 },
    { ticker: "LIT", name: "Lithium & Battery", sector: "Thematic", industry: "Clean Energy", weight: 0.3 },
    { ticker: "UFO", name: "Space", sector: "Thematic", industry: "Space & Defense", weight: 0.2 },
    // Fixed Income
    { ticker: "BND", name: "Total Bond", sector: "Fixed Income", industry: "Aggregate", weight: 2.0 },
    { ticker: "TLT", name: "20+ Yr Treasury", sector: "Fixed Income", industry: "Long-Term", weight: 1.5 },
    { ticker: "SHY", name: "1-3 Yr Treasury", sector: "Fixed Income", industry: "Short-Term", weight: 1.0 },
    { ticker: "LQD", name: "IG Corporate", sector: "Fixed Income", industry: "Corporate", weight: 1.0 },
    { ticker: "HYG", name: "High Yield", sector: "Fixed Income", industry: "High Yield", weight: 0.8 },
    { ticker: "TIP", name: "TIPS", sector: "Fixed Income", industry: "Inflation-Protected", weight: 0.5 },
    // Commodities
    { ticker: "GLD", name: "Gold", sector: "Commodities", industry: "Precious Metals", weight: 2.0 },
    { ticker: "SLV", name: "Silver", sector: "Commodities", industry: "Precious Metals", weight: 0.5 },
    { ticker: "USO", name: "Oil", sector: "Commodities", industry: "Energy", weight: 0.5 },
    { ticker: "DBA", name: "Agriculture", sector: "Commodities", industry: "Agriculture", weight: 0.3 },
    // International
    { ticker: "EFA", name: "EAFE", sector: "International", industry: "Developed", weight: 1.5 },
    { ticker: "VWO", name: "Emerging Mkts", sector: "International", industry: "Emerging", weight: 1.0 },
    { ticker: "EWJ", name: "Japan", sector: "International", industry: "Japan", weight: 0.5 },
    { ticker: "FXI", name: "China Large", sector: "International", industry: "China", weight: 0.5 },
    { ticker: "EWZ", name: "Brazil", sector: "International", industry: "Brazil", weight: 0.3 },
    { ticker: "INDA", name: "India", sector: "International", industry: "India", weight: 0.4 },
    { ticker: "EWG", name: "Germany", sector: "International", industry: "Germany", weight: 0.3 },
    { ticker: "EWU", name: "UK", sector: "International", industry: "UK", weight: 0.3 },
];

// ===== CRYPTO =====
const CRYPTO_MAP: StockEntry[] = [
    { ticker: "BTC-USD", name: "Bitcoin", sector: "Layer 1", industry: "Store of Value", weight: 55.0 },
    { ticker: "ETH-USD", name: "Ethereum", sector: "Layer 1", industry: "Smart Contracts", weight: 15.0 },
    { ticker: "SOL-USD", name: "Solana", sector: "Layer 1", industry: "Smart Contracts", weight: 4.0 },
    { ticker: "BNB-USD", name: "BNB", sector: "Layer 1", industry: "Exchange", weight: 3.5 },
    { ticker: "XRP-USD", name: "XRP", sector: "Layer 1", industry: "Payments", weight: 3.0 },
    { ticker: "ADA-USD", name: "Cardano", sector: "Layer 1", industry: "Smart Contracts", weight: 1.5 },
    { ticker: "DOGE-USD", name: "Dogecoin", sector: "Meme", industry: "Meme Coins", weight: 2.0 },
    { ticker: "AVAX-USD", name: "Avalanche", sector: "Layer 1", industry: "Smart Contracts", weight: 1.0 },
    { ticker: "DOT-USD", name: "Polkadot", sector: "Layer 1", industry: "Interoperability", weight: 0.8 },
    { ticker: "LINK-USD", name: "Chainlink", sector: "DeFi", industry: "Oracles", weight: 1.0 },
    { ticker: "MATIC-USD", name: "Polygon", sector: "Layer 2", industry: "Scaling", weight: 0.6 },
    { ticker: "UNI7083-USD", name: "Uniswap", sector: "DeFi", industry: "DEX", weight: 0.5 },
    { ticker: "SHIB-USD", name: "Shiba Inu", sector: "Meme", industry: "Meme Coins", weight: 0.5 },
    { ticker: "LTC-USD", name: "Litecoin", sector: "Layer 1", industry: "Payments", weight: 0.5 },
    { ticker: "ATOM-USD", name: "Cosmos", sector: "Layer 1", industry: "Interoperability", weight: 0.4 },
    { ticker: "NEAR-USD", name: "NEAR Protocol", sector: "Layer 1", industry: "Smart Contracts", weight: 0.4 },
    { ticker: "APT21794-USD", name: "Aptos", sector: "Layer 1", industry: "Smart Contracts", weight: 0.3 },
    { ticker: "OP-USD", name: "Optimism", sector: "Layer 2", industry: "Scaling", weight: 0.3 },
    { ticker: "ARB11841-USD", name: "Arbitrum", sector: "Layer 2", industry: "Scaling", weight: 0.3 },
    { ticker: "FIL-USD", name: "Filecoin", sector: "DeFi", industry: "Storage", weight: 0.2 },
    // Crypto ETFs/Stocks
    { ticker: "IBIT", name: "iShares Bitcoin", sector: "Crypto ETF", industry: "Bitcoin ETF", weight: 3.0 },
    { ticker: "COIN", name: "Coinbase", sector: "Crypto Stock", industry: "Exchange", weight: 1.5 },
    { ticker: "MSTR", name: "MicroStrategy", sector: "Crypto Stock", industry: "Bitcoin Holder", weight: 1.0 },
    { ticker: "MARA", name: "Marathon Digital", sector: "Crypto Stock", industry: "Mining", weight: 0.3 },
    { ticker: "RIOT", name: "Riot Platforms", sector: "Crypto Stock", industry: "Mining", weight: 0.2 },
    { ticker: "CLSK", name: "CleanSpark", sector: "Crypto Stock", industry: "Mining", weight: 0.15 },
];

// ===== FUTURES (proxied via ETFs) =====
const FUTURES_MAP: StockEntry[] = [
    // Equity Index Futures (proxied)
    { ticker: "SPY", name: "E-mini S&P 500", sector: "Equity Index", industry: "US Large Cap", weight: 8.0 },
    { ticker: "QQQ", name: "E-mini Nasdaq", sector: "Equity Index", industry: "US Tech", weight: 6.0 },
    { ticker: "DIA", name: "E-mini Dow", sector: "Equity Index", industry: "US Blue Chip", weight: 3.0 },
    { ticker: "IWM", name: "E-mini Russell", sector: "Equity Index", industry: "US Small Cap", weight: 2.0 },
    // Energy
    { ticker: "USO", name: "Crude Oil (WTI)", sector: "Energy", industry: "Crude Oil", weight: 5.0 },
    { ticker: "BNO", name: "Brent Crude", sector: "Energy", industry: "Crude Oil", weight: 2.0 },
    { ticker: "UNG", name: "Natural Gas", sector: "Energy", industry: "Natural Gas", weight: 1.5 },
    { ticker: "UGA", name: "Gasoline", sector: "Energy", industry: "Refined Products", weight: 0.5 },
    // Metals
    { ticker: "GLD", name: "Gold", sector: "Metals", industry: "Precious Metals", weight: 5.0 },
    { ticker: "SLV", name: "Silver", sector: "Metals", industry: "Precious Metals", weight: 1.5 },
    { ticker: "PPLT", name: "Platinum", sector: "Metals", industry: "Precious Metals", weight: 0.5 },
    { ticker: "CPER", name: "Copper", sector: "Metals", industry: "Industrial Metals", weight: 1.0 },
    // Agriculture
    { ticker: "CORN", name: "Corn", sector: "Agriculture", industry: "Grains", weight: 1.0 },
    { ticker: "WEAT", name: "Wheat", sector: "Agriculture", industry: "Grains", weight: 0.8 },
    { ticker: "SOYB", name: "Soybeans", sector: "Agriculture", industry: "Grains", weight: 0.8 },
    { ticker: "CANE", name: "Sugar", sector: "Agriculture", industry: "Softs", weight: 0.3 },
    { ticker: "JO", name: "Coffee", sector: "Agriculture", industry: "Softs", weight: 0.3 },
    { ticker: "NIB", name: "Cocoa", sector: "Agriculture", industry: "Softs", weight: 0.2 },
    { ticker: "COW", name: "Livestock", sector: "Agriculture", industry: "Livestock", weight: 0.3 },
    // Bonds
    { ticker: "TLT", name: "30-Yr Treasury", sector: "Interest Rates", industry: "Long-Term", weight: 3.0 },
    { ticker: "IEF", name: "10-Yr Treasury", sector: "Interest Rates", industry: "Medium-Term", weight: 2.0 },
    { ticker: "SHY", name: "2-Yr Treasury", sector: "Interest Rates", industry: "Short-Term", weight: 1.5 },
    // Currencies
    { ticker: "UUP", name: "US Dollar", sector: "Currencies", industry: "Dollar Index", weight: 2.0 },
    { ticker: "FXE", name: "Euro", sector: "Currencies", industry: "Major", weight: 1.0 },
    { ticker: "FXY", name: "Japanese Yen", sector: "Currencies", industry: "Major", weight: 0.8 },
    { ticker: "FXB", name: "British Pound", sector: "Currencies", industry: "Major", weight: 0.5 },
    // Volatility
    { ticker: "VIXY", name: "VIX Short-Term", sector: "Volatility", industry: "Volatility", weight: 1.0 },
];

// ===== WORLD =====
const WORLD_MAP: StockEntry[] = [
    // United States
    { ticker: "SPY", name: "S&P 500", sector: "United States", industry: "US Equity", weight: 25.0 },
    { ticker: "QQQ", name: "Nasdaq 100", sector: "United States", industry: "US Tech", weight: 10.0 },
    // Europe
    { ticker: "EWG", name: "Germany (DAX)", sector: "Europe", industry: "Germany", weight: 3.0 },
    { ticker: "EWU", name: "United Kingdom", sector: "Europe", industry: "UK", weight: 2.5 },
    { ticker: "EWQ", name: "France", sector: "Europe", industry: "France", weight: 2.0 },
    { ticker: "EWI", name: "Italy", sector: "Europe", industry: "Italy", weight: 0.8 },
    { ticker: "EWP", name: "Spain", sector: "Europe", industry: "Spain", weight: 0.6 },
    { ticker: "EWL", name: "Switzerland", sector: "Europe", industry: "Switzerland", weight: 1.5 },
    { ticker: "EWD", name: "Sweden", sector: "Europe", industry: "Sweden", weight: 0.5 },
    { ticker: "EWN", name: "Netherlands", sector: "Europe", industry: "Netherlands", weight: 1.0 },
    // Asia Pacific
    { ticker: "EWJ", name: "Japan (Nikkei)", sector: "Asia Pacific", industry: "Japan", weight: 5.0 },
    { ticker: "FXI", name: "China", sector: "Asia Pacific", industry: "China", weight: 3.0 },
    { ticker: "EWY", name: "South Korea", sector: "Asia Pacific", industry: "South Korea", weight: 1.5 },
    { ticker: "EWT", name: "Taiwan", sector: "Asia Pacific", industry: "Taiwan", weight: 1.5 },
    { ticker: "EWA", name: "Australia", sector: "Asia Pacific", industry: "Australia", weight: 1.5 },
    { ticker: "INDA", name: "India", sector: "Asia Pacific", industry: "India", weight: 2.5 },
    { ticker: "EWS", name: "Singapore", sector: "Asia Pacific", industry: "Singapore", weight: 0.4 },
    { ticker: "THD", name: "Thailand", sector: "Asia Pacific", industry: "Thailand", weight: 0.3 },
    { ticker: "VNM", name: "Vietnam", sector: "Asia Pacific", industry: "Vietnam", weight: 0.2 },
    { ticker: "EPHE", name: "Philippines", sector: "Asia Pacific", industry: "Philippines", weight: 0.2 },
    // Americas (ex-US)
    { ticker: "EWC", name: "Canada", sector: "Americas", industry: "Canada", weight: 2.5 },
    { ticker: "EWZ", name: "Brazil", sector: "Americas", industry: "Brazil", weight: 1.5 },
    { ticker: "EWW", name: "Mexico", sector: "Americas", industry: "Mexico", weight: 0.5 },
    // Middle East & Africa
    { ticker: "KSA", name: "Saudi Arabia", sector: "Middle East & Africa", industry: "Saudi Arabia", weight: 1.0 },
    { ticker: "EIS", name: "Israel", sector: "Middle East & Africa", industry: "Israel", weight: 0.5 },
    { ticker: "EZA", name: "South Africa", sector: "Middle East & Africa", industry: "South Africa", weight: 0.4 },
    { ticker: "TUR", name: "Turkey", sector: "Middle East & Africa", industry: "Turkey", weight: 0.2 },
];

// ===== THEMES =====
const THEMES_MAP: StockEntry[] = [
    // ── AI & MACHINE LEARNING ──
    // Models
    { ticker: "MSFT", name: "Microsoft", sector: "AI", industry: "Models", weight: 5.0 },
    { ticker: "GOOGL", name: "Alphabet", sector: "AI", industry: "Models", weight: 3.5 },
    { ticker: "META", name: "Meta", sector: "AI", industry: "Models", weight: 3.0 },
    { ticker: "AMZN", name: "Amazon", sector: "AI", industry: "Models", weight: 2.0 },
    // Data
    { ticker: "PLTR", name: "Palantir", sector: "AI", industry: "Data", weight: 1.5 },
    { ticker: "SNOW", name: "Snowflake", sector: "AI", industry: "Data", weight: 0.8 },
    { ticker: "MDB", name: "MongoDB", sector: "AI", industry: "Data", weight: 0.5 },
    { ticker: "DDOG", name: "Datadog", sector: "AI", industry: "Data", weight: 0.6 },
    // Robotics (AI)
    { ticker: "TSLA", name: "Tesla (Optimus)", sector: "AI", industry: "Robotics", weight: 1.5 },
    { ticker: "PATH", name: "UiPath", sector: "AI", industry: "Robotics", weight: 0.3 },
    // Energy (AI)
    { ticker: "CRWV", name: "CoreWeave", sector: "AI", industry: "Energy", weight: 0.8 },
    { ticker: "IREN", name: "Iris Energy", sector: "AI", industry: "Energy", weight: 0.3 },
    { ticker: "CORZ", name: "Core Scientific", sector: "AI", industry: "Energy", weight: 0.3 },
    // AGI
    { ticker: "AI", name: "C3.ai", sector: "AI", industry: "AGI", weight: 0.3 },
    { ticker: "BBAI", name: "BigBear.ai", sector: "AI", industry: "AGI", weight: 0.15 },
    // Security (AI)
    { ticker: "CRWD", name: "CrowdStrike", sector: "AI", industry: "Security", weight: 0.8 },
    { ticker: "PANW", name: "Palo Alto", sector: "AI", industry: "Security", weight: 0.8 },
    // PaaS
    { ticker: "NOW", name: "ServiceNow", sector: "AI", industry: "PaaS", weight: 0.7 },
    { ticker: "CRM", name: "Salesforce", sector: "AI", industry: "PaaS", weight: 0.6 },
    // Edge
    { ticker: "QCOM", name: "Qualcomm", sector: "AI", industry: "Edge", weight: 0.5 },
    { ticker: "INTC", name: "Intel", sector: "AI", industry: "Edge", weight: 0.3 },
    // Hardware
    { ticker: "NVDA", name: "NVIDIA", sector: "AI", industry: "Hardware", weight: 6.0 },
    { ticker: "AVGO", name: "Broadcom", sector: "AI", industry: "Hardware", weight: 2.0 },
    { ticker: "AMD", name: "AMD", sector: "AI", industry: "Hardware", weight: 1.0 },
    // H-SaaS
    { ticker: "ADBE", name: "Adobe", sector: "AI", industry: "H-SaaS", weight: 0.5 },
    { ticker: "INTU", name: "Intuit", sector: "AI", industry: "H-SaaS", weight: 0.4 },
    // Hybrid Cloud
    { ticker: "IBM", name: "IBM", sector: "AI", industry: "Hybrid Cloud", weight: 0.5 },
    { ticker: "ORCL", name: "Oracle", sector: "AI", industry: "Hybrid Cloud", weight: 0.6 },

    // ── SEMICONDUCTORS ──
    // Compute
    { ticker: "NVDA", name: "NVIDIA", sector: "Semiconductors", industry: "Compute", weight: 5.0 },
    { ticker: "AMD", name: "AMD", sector: "Semiconductors", industry: "Compute", weight: 1.2 },
    { ticker: "INTC", name: "Intel", sector: "Semiconductors", industry: "Compute", weight: 0.6 },
    // Analog
    { ticker: "ADI", name: "Analog Devices", sector: "Semiconductors", industry: "Analog", weight: 0.5 },
    { ticker: "TXN", name: "Texas Inst.", sector: "Semiconductors", industry: "Analog", weight: 0.7 },
    { ticker: "MCHP", name: "Microchip", sector: "Semiconductors", industry: "Analog", weight: 0.3 },
    // Foundries
    { ticker: "TSM", name: "TSMC", sector: "Semiconductors", industry: "Foundries", weight: 2.0 },
    { ticker: "GFS", name: "GlobalFoundries", sector: "Semiconductors", industry: "Foundries", weight: 0.3 },
    { ticker: "UMC", name: "UMC", sector: "Semiconductors", industry: "Foundries", weight: 0.15 },
    // Design Tools (EDA)
    { ticker: "SNPS", name: "Synopsys", sector: "Semiconductors", industry: "Design Tools", weight: 0.5 },
    { ticker: "CDNS", name: "Cadence", sector: "Semiconductors", industry: "Design Tools", weight: 0.5 },
    // Memory
    { ticker: "MU", name: "Micron", sector: "Semiconductors", industry: "Memory", weight: 0.5 },
    { ticker: "WDC", name: "Western Digital", sector: "Semiconductors", industry: "Memory", weight: 0.2 },
    { ticker: "STX", name: "Seagate", sector: "Semiconductors", industry: "Memory", weight: 0.15 },
    // Wireless
    { ticker: "QCOM", name: "Qualcomm", sector: "Semiconductors", industry: "Wireless", weight: 0.7 },
    { ticker: "MRVL", name: "Marvell", sector: "Semiconductors", industry: "Wireless", weight: 0.3 },
    { ticker: "SWKS", name: "Skyworks", sector: "Semiconductors", industry: "Wireless", weight: 0.2 },
    // Lithography
    { ticker: "ASML", name: "ASML", sector: "Semiconductors", industry: "Lithography", weight: 1.5 },
    { ticker: "LRCX", name: "Lam Research", sector: "Semiconductors", industry: "Lithography", weight: 0.5 },
    // Packaging
    { ticker: "AMAT", name: "Applied Mat.", sector: "Semiconductors", industry: "Packaging", weight: 0.5 },
    { ticker: "KLAC", name: "KLA Corp", sector: "Semiconductors", industry: "Packaging", weight: 0.4 },
    { ticker: "AMKR", name: "Amkor", sector: "Semiconductors", industry: "Packaging", weight: 0.1 },
    // Next-Gen
    { ticker: "AVGO", name: "Broadcom", sector: "Semiconductors", industry: "Next-Gen", weight: 1.5 },
    { ticker: "ON", name: "ON Semi", sector: "Semiconductors", industry: "Next-Gen", weight: 0.2 },
    { ticker: "WOLF", name: "Wolfspeed", sector: "Semiconductors", industry: "Next-Gen", weight: 0.1 },

    // ── CYBERSECURITY ──
    // Zero Trust
    { ticker: "ZS", name: "Zscaler", sector: "Cybersecurity", industry: "ZeroTrust", weight: 0.5 },
    { ticker: "OKTA", name: "Okta", sector: "Cybersecurity", industry: "ZeroTrust", weight: 0.4 },
    // Network
    { ticker: "PANW", name: "Palo Alto", sector: "Cybersecurity", industry: "Network", weight: 1.5 },
    { ticker: "FTNT", name: "Fortinet", sector: "Cybersecurity", industry: "Network", weight: 0.8 },
    { ticker: "CSCO", name: "Cisco", sector: "Cybersecurity", industry: "Network", weight: 0.5 },
    // Identity IAM
    { ticker: "OKTA", name: "Okta", sector: "Cybersecurity", industry: "Identity IAM", weight: 0.4 },
    { ticker: "CYBR", name: "CyberArk", sector: "Cybersecurity", industry: "Identity IAM", weight: 0.3 },
    // ThreatOps
    { ticker: "MNDT", name: "Mandiant", sector: "Cybersecurity", industry: "ThreatOps", weight: 0.2 },
    { ticker: "RPD", name: "Rapid7", sector: "Cybersecurity", industry: "ThreatOps", weight: 0.15 },
    // Endpoint
    { ticker: "CRWD", name: "CrowdStrike", sector: "Cybersecurity", industry: "Endpoint", weight: 1.5 },
    { ticker: "S", name: "SentinelOne", sector: "Cybersecurity", industry: "Endpoint", weight: 0.3 },
    // Cloud Security
    { ticker: "WDAY", name: "Workday", sector: "Cybersecurity", industry: "Cloud", weight: 0.4 },
    { ticker: "VRNS", name: "Varonis", sector: "Cybersecurity", industry: "Cloud", weight: 0.15 },
    // SIEM
    { ticker: "SPLK", name: "Splunk", sector: "Cybersecurity", industry: "SIEM", weight: 0.3 },
    { ticker: "DDOG", name: "Datadog", sector: "Cybersecurity", industry: "SIEM", weight: 0.5 },
    // App Security
    { ticker: "QLYS", name: "Qualys", sector: "Cybersecurity", industry: "App Security", weight: 0.15 },
    { ticker: "TENB", name: "Tenable", sector: "Cybersecurity", industry: "App Security", weight: 0.15 },

    // ── INDUSTRIAL AUTOMATION ──
    // Robotics
    { ticker: "ISRG", name: "Intuitive Surg.", sector: "Industrial Automation", industry: "Robotics", weight: 2.0 },
    { ticker: "TER", name: "Teradyne", sector: "Industrial Automation", industry: "Robotics", weight: 0.5 },
    { ticker: "FANUY", name: "Fanuc", sector: "Industrial Automation", industry: "Robotics", weight: 0.4 },
    { ticker: "ABB", name: "ABB", sector: "Industrial Automation", industry: "Robotics", weight: 0.4 },
    // Machine Vision
    { ticker: "KEYS", name: "Keysight", sector: "Industrial Automation", industry: "Machine Vision", weight: 0.3 },
    { ticker: "CGNX", name: "Cognex", sector: "Industrial Automation", industry: "Machine Vision", weight: 0.2 },
    // IoT
    { ticker: "CSCO", name: "Cisco (IoT)", sector: "Industrial Automation", industry: "IoT", weight: 0.4 },
    { ticker: "KEYS", name: "Keysight", sector: "Industrial Automation", industry: "IoT", weight: 0.2 },
    // Logistics
    { ticker: "SYM", name: "Symbotic", sector: "Industrial Automation", industry: "Logistics", weight: 0.3 },
    { ticker: "GXO", name: "GXO Logistics", sector: "Industrial Automation", industry: "Logistics", weight: 0.2 },
    // Automation Software
    { ticker: "PATH", name: "UiPath", sector: "Industrial Automation", industry: "Automation", weight: 0.3 },
    { ticker: "ANSS", name: "Ansys", sector: "Industrial Automation", industry: "Software", weight: 0.3 },
    { ticker: "PTC", name: "PTC", sector: "Industrial Automation", industry: "Software", weight: 0.2 },
    // 3D Printing
    { ticker: "DDD", name: "3D Systems", sector: "Industrial Automation", industry: "3D Printing", weight: 0.1 },
    { ticker: "DM", name: "Desktop Metal", sector: "Industrial Automation", industry: "3D Printing", weight: 0.05 },
    { ticker: "MKFG", name: "Markforged", sector: "Industrial Automation", industry: "3D Printing", weight: 0.05 },

    // ── DEFENSE & AEROSPACE ──
    // Drones
    { ticker: "AVAV", name: "AeroVironment", sector: "Defense & Aerospace", industry: "Drones", weight: 0.4 },
    { ticker: "KTOS", name: "Kratos", sector: "Defense & Aerospace", industry: "Drones", weight: 0.3 },
    { ticker: "JOBY", name: "Joby Aviation", sector: "Defense & Aerospace", industry: "Drones", weight: 0.15 },
    // SpaceTech
    { ticker: "RKLB", name: "Rocket Lab", sector: "Defense & Aerospace", industry: "SpaceTech", weight: 0.5 },
    { ticker: "ASTS", name: "AST SpaceMobile", sector: "Defense & Aerospace", industry: "SpaceTech", weight: 0.3 },
    { ticker: "LUNR", name: "Intuitive Machines", sector: "Defense & Aerospace", industry: "SpaceTech", weight: 0.2 },
    { ticker: "RDW", name: "Redwire", sector: "Defense & Aerospace", industry: "SpaceTech", weight: 0.15 },
    { ticker: "PL", name: "Planet Labs", sector: "Defense & Aerospace", industry: "SpaceTech", weight: 0.1 },
    // Weapons
    { ticker: "LMT", name: "Lockheed", sector: "Defense & Aerospace", industry: "Weapons", weight: 1.5 },
    { ticker: "RTX", name: "RTX", sector: "Defense & Aerospace", industry: "Weapons", weight: 1.0 },
    { ticker: "NOC", name: "Northrop", sector: "Defense & Aerospace", industry: "Weapons", weight: 0.6 },
    // Aviation
    { ticker: "BA", name: "Boeing", sector: "Defense & Aerospace", industry: "Aviation", weight: 1.5 },
    { ticker: "GE", name: "GE Aerospace", sector: "Defense & Aerospace", industry: "Aviation", weight: 1.0 },
    { ticker: "TDG", name: "TransDigm", sector: "Defense & Aerospace", industry: "Aviation", weight: 0.4 },
    { ticker: "HWM", name: "Howmet", sector: "Defense & Aerospace", industry: "Aviation", weight: 0.3 },
    // Missiles
    { ticker: "GD", name: "General Dynamics", sector: "Defense & Aerospace", industry: "Missiles", weight: 0.5 },
    { ticker: "LHX", name: "L3Harris", sector: "Defense & Aerospace", industry: "Missiles", weight: 0.4 },
    // CyberDefense
    { ticker: "BAH", name: "Booz Allen", sector: "Defense & Aerospace", industry: "CyberDefense", weight: 0.3 },
    { ticker: "LDOS", name: "Leidos", sector: "Defense & Aerospace", industry: "CyberDefense", weight: 0.3 },
    { ticker: "PLTR", name: "Palantir", sector: "Defense & Aerospace", industry: "CyberDefense", weight: 0.5 },
    // Manufacturing
    { ticker: "HII", name: "Huntington Ingalls", sector: "Defense & Aerospace", industry: "Manufacturing", weight: 0.3 },
    { ticker: "BWXT", name: "BWX Tech", sector: "Defense & Aerospace", industry: "Manufacturing", weight: 0.2 },

    // ── SOFTWARE ──
    // OS
    { ticker: "MSFT", name: "Microsoft", sector: "Software", industry: "OS", weight: 3.0 },
    { ticker: "AAPL", name: "Apple", sector: "Software", industry: "OS", weight: 2.5 },
    { ticker: "GOOG", name: "Google (Android)", sector: "Software", industry: "OS", weight: 1.5 },
    // Collaboration
    { ticker: "TEAM", name: "Atlassian", sector: "Software", industry: "Collaboration", weight: 0.4 },
    { ticker: "ZM", name: "Zoom", sector: "Software", industry: "Collaboration", weight: 0.3 },
    { ticker: "DOCU", name: "DocuSign", sector: "Software", industry: "Collaboration", weight: 0.2 },
    // Gaming
    { ticker: "RBLX", name: "Roblox", sector: "Software", industry: "Gaming", weight: 0.4 },
    { ticker: "EA", name: "EA", sector: "Software", industry: "Gaming", weight: 0.5 },
    { ticker: "TTWO", name: "Take-Two", sector: "Software", industry: "Gaming", weight: 0.4 },
    { ticker: "U", name: "Unity", sector: "Software", industry: "Gaming", weight: 0.2 },
    // E-Commerce
    { ticker: "SHOP", name: "Shopify", sector: "Software", industry: "E-Commerce", weight: 0.6 },
    { ticker: "BIGC", name: "BigCommerce", sector: "Software", industry: "E-Commerce", weight: 0.05 },
    { ticker: "ETSY", name: "Etsy", sector: "Software", industry: "E-Commerce", weight: 0.15 },
    // Database
    { ticker: "MDB", name: "MongoDB", sector: "Software", industry: "Database", weight: 0.3 },
    { ticker: "ESTC", name: "Elastic", sector: "Software", industry: "Database", weight: 0.15 },
    // DevOps
    { ticker: "GTLB", name: "GitLab", sector: "Software", industry: "DevOps", weight: 0.15 },
    { ticker: "CFLT", name: "Confluent", sector: "Software", industry: "DevOps", weight: 0.1 },
    { ticker: "HSHM", name: "HashiCorp", sector: "Software", industry: "DevOps", weight: 0.1 },

    // ── QUANTUM COMPUTING ──
    // Hardware
    { ticker: "IONQ", name: "IonQ", sector: "Quantum Computing", industry: "Hardware", weight: 0.5 },
    { ticker: "RGTI", name: "Rigetti", sector: "Quantum Computing", industry: "Hardware", weight: 0.2 },
    { ticker: "QBTS", name: "D-Wave", sector: "Quantum Computing", industry: "Hardware", weight: 0.15 },
    // Software
    { ticker: "QUBT", name: "Quantum Comp.", sector: "Quantum Computing", industry: "Software", weight: 0.1 },
    { ticker: "ARQQ", name: "Arqit Quantum", sector: "Quantum Computing", industry: "Software", weight: 0.05 },
    // Networking
    { ticker: "QCOM", name: "Qualcomm (QC)", sector: "Quantum Computing", industry: "Networking", weight: 0.3 },
    // Cloud
    { ticker: "MSFT", name: "Azure Quantum", sector: "Quantum Computing", industry: "Cloud", weight: 0.5 },
    { ticker: "GOOGL", name: "Google (Willow)", sector: "Quantum Computing", industry: "Cloud", weight: 0.4 },
    { ticker: "IBM", name: "IBM Quantum", sector: "Quantum Computing", industry: "Cloud", weight: 0.3 },
    // Enabling Tech
    { ticker: "HON", name: "Honeywell", sector: "Quantum Computing", industry: "Enabling Tech", weight: 0.3 },
    { ticker: "AMAT", name: "Applied Mat.", sector: "Quantum Computing", industry: "Enabling Tech", weight: 0.2 },

    // ── CLEAN ENERGY ──
    // Solar
    { ticker: "FSLR", name: "First Solar", sector: "Clean Energy", industry: "Solar", weight: 0.6 },
    { ticker: "ENPH", name: "Enphase", sector: "Clean Energy", industry: "Solar", weight: 0.4 },
    { ticker: "SEDG", name: "SolarEdge", sector: "Clean Energy", industry: "Solar", weight: 0.15 },
    { ticker: "RUN", name: "Sunrun", sector: "Clean Energy", industry: "Solar", weight: 0.1 },
    // Nuclear
    { ticker: "CEG", name: "Constellation", sector: "Clean Energy", industry: "Nuclear", weight: 1.0 },
    { ticker: "OKLO", name: "Oklo", sector: "Clean Energy", industry: "Nuclear", weight: 0.3 },
    { ticker: "SMR", name: "NuScale", sector: "Clean Energy", industry: "Nuclear", weight: 0.2 },
    { ticker: "BWXT", name: "BWX Tech", sector: "Clean Energy", industry: "Nuclear", weight: 0.3 },
    // Wind
    { ticker: "NEE", name: "NextEra", sector: "Clean Energy", industry: "Wind", weight: 1.5 },
    { ticker: "AES", name: "AES Corp", sector: "Clean Energy", industry: "Wind", weight: 0.2 },
    // Hydrogen
    { ticker: "PLUG", name: "Plug Power", sector: "Clean Energy", industry: "Hydrogen", weight: 0.15 },
    { ticker: "BE", name: "Bloom Energy", sector: "Clean Energy", industry: "Hydrogen", weight: 0.15 },
    { ticker: "BLDP", name: "Ballard Power", sector: "Clean Energy", industry: "Hydrogen", weight: 0.05 },
    // EV & Battery
    { ticker: "TSLA", name: "Tesla", sector: "Clean Energy", industry: "EV & Battery", weight: 1.5 },
    { ticker: "RIVN", name: "Rivian", sector: "Clean Energy", industry: "EV & Battery", weight: 0.2 },
    { ticker: "QS", name: "QuantumScape", sector: "Clean Energy", industry: "EV & Battery", weight: 0.1 },
    { ticker: "ALB", name: "Albemarle", sector: "Clean Energy", industry: "EV & Battery", weight: 0.2 },
    // Grid Infrastructure
    { ticker: "PWR", name: "Quanta Services", sector: "Clean Energy", industry: "Grid", weight: 0.3 },
    { ticker: "VRT", name: "Vertiv", sector: "Clean Energy", industry: "Grid", weight: 0.3 },
    { ticker: "ETN", name: "Eaton", sector: "Clean Energy", industry: "Grid", weight: 0.3 },

    // ── E-COMMERCE ──
    // Marketplace
    { ticker: "AMZN", name: "Amazon", sector: "E-Commerce", industry: "Marketplace", weight: 5.0 },
    { ticker: "BABA", name: "Alibaba", sector: "E-Commerce", industry: "Marketplace", weight: 1.0 },
    { ticker: "MELI", name: "MercadoLibre", sector: "E-Commerce", industry: "Marketplace", weight: 0.5 },
    { ticker: "PDD", name: "PDD/Temu", sector: "E-Commerce", industry: "Marketplace", weight: 0.4 },
    { ticker: "ETSY", name: "Etsy", sector: "E-Commerce", industry: "Marketplace", weight: 0.15 },
    // Payments
    { ticker: "V", name: "Visa", sector: "E-Commerce", industry: "Payments", weight: 1.0 },
    { ticker: "MA", name: "Mastercard", sector: "E-Commerce", industry: "Payments", weight: 0.8 },
    { ticker: "PYPL", name: "PayPal", sector: "E-Commerce", industry: "Payments", weight: 0.4 },
    { ticker: "SQ", name: "Block", sector: "E-Commerce", industry: "Payments", weight: 0.3 },
    { ticker: "AFRM", name: "Affirm", sector: "E-Commerce", industry: "Payments", weight: 0.15 },
    // Delivery
    { ticker: "UBER", name: "Uber", sector: "E-Commerce", industry: "Delivery", weight: 0.5 },
    { ticker: "DASH", name: "DoorDash", sector: "E-Commerce", industry: "Delivery", weight: 0.3 },
    // Platform
    { ticker: "SHOP", name: "Shopify", sector: "E-Commerce", industry: "Platform", weight: 0.6 },
    { ticker: "WIX", name: "Wix", sector: "E-Commerce", industry: "Platform", weight: 0.1 },

    // ── BLOCKCHAIN & WEB3 ──
    // Exchange
    { ticker: "COIN", name: "Coinbase", sector: "Blockchain & Web3", industry: "Exchange", weight: 1.0 },
    // Bitcoin
    { ticker: "MSTR", name: "MicroStrategy", sector: "Blockchain & Web3", industry: "Bitcoin", weight: 0.8 },
    { ticker: "IBIT", name: "iShares Bitcoin", sector: "Blockchain & Web3", industry: "Bitcoin", weight: 1.5 },
    // Mining
    { ticker: "MARA", name: "Marathon", sector: "Blockchain & Web3", industry: "Mining", weight: 0.3 },
    { ticker: "RIOT", name: "Riot", sector: "Blockchain & Web3", industry: "Mining", weight: 0.2 },
    { ticker: "CLSK", name: "CleanSpark", sector: "Blockchain & Web3", industry: "Mining", weight: 0.15 },
    // Payments
    { ticker: "SQ", name: "Block", sector: "Blockchain & Web3", industry: "Payments", weight: 0.4 },
    { ticker: "PYPL", name: "PayPal", sector: "Blockchain & Web3", industry: "Payments", weight: 0.3 },

    // ── BIOTECH & GENOMICS ──
    // Gene Therapy
    { ticker: "CRSP", name: "CRISPR Ther.", sector: "Biotech & Genomics", industry: "Gene Therapy", weight: 0.3 },
    { ticker: "NTLA", name: "Intellia", sector: "Biotech & Genomics", industry: "Gene Therapy", weight: 0.15 },
    { ticker: "BEAM", name: "Beam Ther.", sector: "Biotech & Genomics", industry: "Gene Therapy", weight: 0.1 },
    // Drug Discovery
    { ticker: "LLY", name: "Eli Lilly", sector: "Biotech & Genomics", industry: "Drug Discovery", weight: 2.0 },
    { ticker: "REGN", name: "Regeneron", sector: "Biotech & Genomics", industry: "Drug Discovery", weight: 0.5 },
    { ticker: "VRTX", name: "Vertex", sector: "Biotech & Genomics", industry: "Drug Discovery", weight: 0.4 },
    { ticker: "MRNA", name: "Moderna", sector: "Biotech & Genomics", industry: "Drug Discovery", weight: 0.3 },
    // Diagnostics
    { ticker: "ILMN", name: "Illumina", sector: "Biotech & Genomics", industry: "Diagnostics", weight: 0.3 },
    { ticker: "TMO", name: "Thermo Fisher", sector: "Biotech & Genomics", industry: "Diagnostics", weight: 0.5 },
    { ticker: "A", name: "Agilent", sector: "Biotech & Genomics", industry: "Diagnostics", weight: 0.2 },
    // Med Devices
    { ticker: "ISRG", name: "Intuitive Surg.", sector: "Biotech & Genomics", industry: "Med Devices", weight: 0.8 },
    { ticker: "DXCM", name: "DexCom", sector: "Biotech & Genomics", industry: "Med Devices", weight: 0.2 },
    // Weight Loss
    { ticker: "NVO", name: "Novo Nordisk", sector: "Biotech & Genomics", industry: "Weight Loss", weight: 1.0 },
    { ticker: "LLY", name: "Eli Lilly (GLP-1)", sector: "Biotech & Genomics", industry: "Weight Loss", weight: 0.8 },
    { ticker: "AMGN", name: "Amgen", sector: "Biotech & Genomics", industry: "Weight Loss", weight: 0.3 },
];

// Filter registry
const FILTER_MAP: Record<string, { stocks: StockEntry[]; label: string }> = {
    "sp500": { stocks: SP500_MAP, label: "S&P 500" },
    "dow30": { stocks: DOW30_MAP, label: "Dow Jones 30" },
    "nasdaq100": { stocks: NASDAQ100_MAP, label: "Nasdaq 100" },
    "etf": { stocks: ETF_MAP, label: "ETFs" },
    "crypto": { stocks: CRYPTO_MAP, label: "Crypto" },
    "futures": { stocks: FUTURES_MAP, label: "Futures" },
    "world": { stocks: WORLD_MAP, label: "World" },
    "themes": { stocks: THEMES_MAP, label: "Themes" },
};

// Sector colors
const SECTOR_COLORS: Record<string, string> = {
    "Technology": "#9d4edd",
    "Financials": "#3b82f6",
    "Healthcare": "#06b6d4",
    "Consumer Cyclical": "#f97316",
    "Communication": "#ec4899",
    "Industrials": "#6b7280",
    "Consumer Defensive": "#22c55e",
    "Energy": "#eab308",
    "Utilities": "#a855f7",
    "Real Estate": "#14b8a6",
    "Basic Materials": "#78716c",
    // ETF sectors
    "Equity": "#3b82f6",
    "Sector": "#9d4edd",
    "Thematic": "#f97316",
    "Fixed Income": "#22c55e",
    "Commodities": "#eab308",
    "International": "#06b6d4",
    // Crypto sectors
    "Layer 1": "#f97316",
    "Layer 2": "#9d4edd",
    "DeFi": "#3b82f6",
    "Meme": "#eab308",
    "Crypto ETF": "#22c55e",
    "Crypto Stock": "#06b6d4",
    // Futures sectors
    "Equity Index": "#3b82f6",
    "Metals": "#eab308",
    "Agriculture": "#22c55e",
    "Interest Rates": "#9d4edd",
    "Currencies": "#06b6d4",
    "Volatility": "#ef4444",
    // World sectors
    "United States": "#3b82f6",
    "Europe": "#22c55e",
    "Asia Pacific": "#ef4444",
    "Americas": "#f97316",
    "Middle East & Africa": "#eab308",
    // Theme sectors
    "AI": "#9d4edd",
    "Semiconductors": "#6366f1",
    "Cybersecurity": "#ef4444",
    "Industrial Automation": "#f97316",
    "Defense & Aerospace": "#64748b",
    "Software": "#3b82f6",
    "Quantum Computing": "#06b6d4",
    "Clean Energy": "#22c55e",
    "E-Commerce": "#f59e0b",
    "Blockchain & Web3": "#eab308",
    "Biotech & Genomics": "#ec4899",
};

export async function GET(req: NextRequest) {
    const filter = req.nextUrl.searchParams.get("filter") || "sp500";
    const config = FILTER_MAP[filter];

    if (!config) {
        return NextResponse.json({ error: "Invalid filter" }, { status: 400 });
    }

    try {
        const stockList = config.stocks;
        const tickers = stockList.map((s) => s.ticker);
        const changes: Record<string, number> = {};
        const prices: Record<string, number> = {};

        const batchSize = 15;
        const batches = Array.from({ length: Math.ceil(tickers.length / batchSize) }, (_, i) =>
            tickers.slice(i * batchSize, (i + 1) * batchSize)
        );

        for (const batch of batches) {
            await Promise.all(
                batch.map(async (ticker) => {
                    try {
                        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=1d`;
                        const res = await fetch(url, {
                            headers: { "User-Agent": "Mozilla/5.0" },
                            next: { revalidate: 60 },
                        });
                        if (!res.ok) return;
                        const data = await res.json();
                        const meta = data.chart?.result?.[0]?.meta;
                        if (meta?.regularMarketPrice && meta?.chartPreviousClose) {
                            const pct = ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100;
                            changes[ticker] = Math.round(pct * 100) / 100;
                            prices[ticker] = Math.round(meta.regularMarketPrice * 100) / 100;
                        }
                    } catch {}
                })
            );
        }

        const sectors: Record<string, Array<{
            ticker: string;
            name: string;
            industry: string;
            weight: number;
            change: number;
            price: number;
        }>> = {};

        for (const stock of stockList) {
            if (!sectors[stock.sector]) sectors[stock.sector] = [];
            sectors[stock.sector].push({
                ticker: stock.ticker,
                name: stock.name,
                industry: stock.industry,
                weight: stock.weight,
                change: changes[stock.ticker] ?? 0,
                price: prices[stock.ticker] ?? 0,
            });
        }

        const sectorMeta: Record<string, { totalWeight: number; weightedChange: number; color: string }> = {};
        for (const [sector, stocks] of Object.entries(sectors)) {
            let totalWeight = 0;
            let weightedChange = 0;
            for (const s of stocks) {
                totalWeight += s.weight;
                weightedChange += s.weight * s.change;
            }
            sectorMeta[sector] = {
                totalWeight,
                weightedChange: totalWeight > 0 ? weightedChange / totalWeight : 0,
                color: SECTOR_COLORS[sector] || "#6b7280",
            };
        }

        return NextResponse.json({ sectors, sectorMeta, label: config.label });
    } catch {
        return NextResponse.json({ error: "Failed to fetch market map" }, { status: 500 });
    }
}
