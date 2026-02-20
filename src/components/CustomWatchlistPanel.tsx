"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useUserWatchlists, UserWatchlistPosition } from "@/context/UserWatchlistContext";
import { useStockDatabase } from "@/context/AdminContext";
import { StockData } from "@/data/stockDatabase";
import { calculateYTD } from "@/services/stockService";
import Link from "next/link";
import SectorBadge from "@/components/SectorBadge";
import {
    Plus,
    X,
    Briefcase,
    Save,
    AlertCircle,
    Loader2,
    Scale,
    Trash2,
    LogIn,
    ExternalLink,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

interface SearchResult {
    ticker: string;
    name: string;
    assetClass: string;
    source: "local" | "api";
}

interface PriceData {
    price: number | null;
    change: number;
    changePercent: number;
    marketCap: number | null;
    isLive: boolean;
}

export default function CustomWatchlistPanel() {
    const { user } = useAuth();
    const { watchlists, createWatchlist, updateWatchlist } = useUserWatchlists();
    const { stockDb, addStock } = useStockDatabase();

    const existingWatchlist = watchlists[0] ?? null;

    const [name, setName] = useState("");
    const [positions, setPositions] = useState<UserWatchlistPosition[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddInput, setShowAddInput] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [apiResults, setApiResults] = useState<SearchResult[]>([]);
    const [isSearchingApi, setIsSearchingApi] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [prices, setPrices] = useState<Record<string, PriceData>>({});
    const [isLoadingPrices, setIsLoadingPrices] = useState(false);
    const [showPositions, setShowPositions] = useState(true);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const priceIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const addInputRef = useRef<HTMLInputElement | null>(null);

    // Load existing watchlist positions on mount
    useEffect(() => {
        if (existingWatchlist && !initialized) {
            setName(existingWatchlist.name);
            setPositions(existingWatchlist.positions);
            setInitialized(true);
        }
    }, [existingWatchlist, initialized]);

    // Fetch live prices for positions
    const fetchPrices = useCallback(async () => {
        if (positions.length === 0) return;
        const tickers = positions.map(p => p.ticker).join(",");
        setIsLoadingPrices(true);
        try {
            const res = await fetch(`/api/prices?tickers=${tickers}&ts=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                if (data?.prices) setPrices(data.prices);
            }
        } catch {
            // Silently fail
        } finally {
            setIsLoadingPrices(false);
        }
    }, [positions]);

    // Poll prices when positions exist
    useEffect(() => {
        if (positions.length === 0) {
            setPrices({});
            return;
        }
        fetchPrices();
        priceIntervalRef.current = setInterval(fetchPrices, 60000);
        return () => {
            if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
        };
    }, [fetchPrices, positions.length]);

    // Focus add input when shown
    useEffect(() => {
        if (showAddInput && addInputRef.current) {
            addInputRef.current.focus();
        }
    }, [showAddInput]);

    // Local stock search results
    const localResults = useMemo(() => {
        const addedTickers = new Set(positions.map(p => p.ticker));
        const query = searchQuery.toLowerCase().trim();
        if (!query) return [];

        return Object.values(stockDb)
            .filter(s =>
                !addedTickers.has(s.ticker) &&
                (s.ticker.toLowerCase().includes(query) ||
                 s.name.toLowerCase().includes(query) ||
                 s.sector.toLowerCase().includes(query) ||
                 s.assetClass.toLowerCase().includes(query))
            )
            .sort((a, b) => b.pmScore - a.pmScore)
            .slice(0, 6)
            .map(s => ({ ticker: s.ticker, name: s.name, assetClass: s.assetClass, source: "local" as const }));
    }, [stockDb, positions, searchQuery]);

    // Debounced API search for tickers not in local DB
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        setApiResults([]);

        const query = searchQuery.trim().toUpperCase();
        if (!query || query.length < 1) return;

        if (stockDb[query]) return;
        if (!/^[A-Z]{1,5}(-[A-Z]{1,5})?$/.test(query)) return;
        if (positions.some(p => p.ticker === query)) return;

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearchingApi(true);
            try {
                const res = await fetch(`/api/stock-info?ticker=${query}`);
                if (res.ok) {
                    const data = await res.json();
                    if (!stockDb[data.ticker]) {
                        setApiResults([{
                            ticker: data.ticker,
                            name: data.name,
                            assetClass: data.assetClass || "Unknown",
                            source: "api",
                        }]);
                    }
                }
            } catch {
                // Silently fail
            } finally {
                setIsSearchingApi(false);
            }
        }, 500);

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchQuery, stockDb, positions]);

    // Merge local + API results
    const allResults = useMemo((): SearchResult[] => {
        const addedTickers = new Set(positions.map(p => p.ticker));
        const merged: SearchResult[] = [...localResults];
        for (const r of apiResults) {
            if (!addedTickers.has(r.ticker) && !merged.some(m => m.ticker === r.ticker)) {
                merged.push(r);
            }
        }
        return merged;
    }, [localResults, apiResults, positions]);

    const totalWeight = useMemo(() => {
        return positions.reduce((sum, p) => sum + p.weight, 0);
    }, [positions]);

    // Calculate summary stats
    const summaryStats = useMemo(() => {
        if (positions.length === 0 || Object.keys(prices).length === 0) {
            return { weightedYTD: 0, weightedDay: 0, holdings: positions.length };
        }

        let totalWeightedYTD = 0;
        let totalWeightedDay = 0;
        let totalWeight = 0;

        for (const pos of positions) {
            const priceData = prices[pos.ticker];
            const stock = stockDb[pos.ticker];
            if (priceData?.price && priceData.price > 0) {
                const ytd = stock?.yearlyClose && stock.yearlyClose > 0
                    ? calculateYTD(priceData.price, stock.yearlyClose)
                    : 0;
                const w = pos.weight > 0 ? pos.weight : 1;
                totalWeightedYTD += ytd * w;
                totalWeightedDay += priceData.changePercent * w;
                totalWeight += w;
            }
        }

        return {
            weightedYTD: totalWeight > 0 ? totalWeightedYTD / totalWeight : 0,
            weightedDay: totalWeight > 0 ? totalWeightedDay / totalWeight : 0,
            holdings: positions.length,
        };
    }, [positions, prices, stockDb]);

    const addStockToPortfolio = useCallback(async (result: SearchResult) => {
        if (result.source === "api" && !stockDb[result.ticker]) {
            try {
                const res = await fetch(`/api/stock-info?ticker=${result.ticker}`);
                if (res.ok) {
                    const data = await res.json();
                    const newStock: StockData = {
                        ticker: data.ticker,
                        name: data.name,
                        assetClass: data.assetClass || "Unknown",
                        sector: data.sector || "Unknown",
                        yearlyClose: data.yearlyClose || data.currentPrice || 0,
                        pmScore: data.pmScore || 75,
                        lastUpdated: data.lastUpdated || new Date().toISOString().split("T")[0],
                    };
                    addStock(newStock);
                }
            } catch {
                // Still add position even if metadata fetch fails
            }
        }

        setPositions(prev => {
            if (prev.find(p => p.ticker === result.ticker)) return prev;
            return [...prev, { ticker: result.ticker, weight: 0 }];
        });
        setSearchQuery("");
        setApiResults([]);
    }, [stockDb, addStock]);

    const removeStock = useCallback((ticker: string) => {
        setPositions(prev => prev.filter(p => p.ticker !== ticker));
    }, []);

    const updateWeight = useCallback((ticker: string, weight: number) => {
        setPositions(prev =>
            prev.map(p => p.ticker === ticker ? { ...p, weight } : p)
        );
    }, []);

    const equalizeWeights = useCallback(() => {
        if (positions.length === 0) return;
        const equalWeight = Math.round((100 / positions.length) * 100) / 100;
        setPositions(prev => prev.map(p => ({ ...p, weight: equalWeight })));
    }, [positions.length]);

    const handleSave = async () => {
        setError(null);
        setSuccess(null);

        if (!name.trim()) {
            setError("Watchlist name is required");
            return;
        }
        if (positions.length === 0) {
            setError("Add at least one stock");
            return;
        }

        setIsSaving(true);
        try {
            if (existingWatchlist) {
                const ok = await updateWatchlist(existingWatchlist.id, {
                    name: name.trim(),
                    positions,
                });
                if (ok) {
                    setSuccess("Watchlist updated!");
                    setTimeout(() => setSuccess(null), 3000);
                } else {
                    setError("Failed to update. Try again.");
                }
            } else {
                const result = await createWatchlist(name.trim(), "", positions);
                if (result) {
                    setSuccess("Watchlist created!");
                    setTimeout(() => setSuccess(null), 3000);
                } else {
                    setError("Failed to create. Try again.");
                }
            }
        } catch {
            setError("Something went wrong. Try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Not logged in state
    if (!user) {
        return (
            <div className="pm-card p-6 text-center">
                <LogIn className="w-10 h-10 text-pm-green mx-auto mb-3" />
                <h3 className="font-bold text-white mb-2">Custom Watchlist</h3>
                <p className="text-xs text-pm-muted mb-4">
                    Create an account to build your own custom watchlist with any stock.
                </p>
                <div className="flex flex-col gap-2">
                    <Link
                        href="/signup?redirectTo=/watchlist"
                        className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-2 text-sm"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Create Account
                    </Link>
                    <Link
                        href="/login?redirectTo=/watchlist"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-pm-muted hover:text-pm-text transition-colors"
                    >
                        <LogIn className="w-4 h-4" />
                        Already have an account? Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Panel Header with Name */}
            <div className="pm-card p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-pm-green" />
                        <h3 className="font-bold text-white text-sm">
                            {existingWatchlist ? "My Watchlist" : "Custom Watchlist"}
                        </h3>
                    </div>
                    <span className="text-[10px] text-pm-muted font-mono">
                        {positions.length} stock{positions.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Name Input */}
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Watchlist name..."
                    maxLength={100}
                    className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm text-pm-text placeholder:text-pm-muted focus:outline-none focus:border-pm-green transition-colors"
                />
            </div>

            {/* Summary Stats */}
            {positions.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    <div className="pm-card p-3 border-l-2 border-l-pm-green">
                        <div className="text-[10px] text-pm-muted uppercase tracking-wider mb-0.5">YTD</div>
                        <div className={`text-sm font-bold font-mono ${summaryStats.weightedYTD >= 0 ? "text-pm-green" : "text-pm-red"}`}>
                            {isLoadingPrices && Object.keys(prices).length === 0 ? (
                                <div className="w-10 h-4 bg-pm-charcoal animate-pulse rounded" />
                            ) : (
                                <>{summaryStats.weightedYTD >= 0 ? "+" : ""}{summaryStats.weightedYTD.toFixed(2)}%</>
                            )}
                        </div>
                    </div>
                    <div className="pm-card p-3 border-l-2 border-l-pm-purple">
                        <div className="text-[10px] text-pm-muted uppercase tracking-wider mb-0.5">Today</div>
                        <div className={`text-sm font-bold font-mono ${summaryStats.weightedDay >= 0 ? "text-pm-green" : "text-pm-red"}`}>
                            {isLoadingPrices && Object.keys(prices).length === 0 ? (
                                <div className="w-10 h-4 bg-pm-charcoal animate-pulse rounded" />
                            ) : (
                                <>{summaryStats.weightedDay >= 0 ? "+" : ""}{summaryStats.weightedDay.toFixed(2)}%</>
                            )}
                        </div>
                    </div>
                    <div className="pm-card p-3 border-l-2 border-l-blue-500">
                        <div className="text-[10px] text-pm-muted uppercase tracking-wider mb-0.5">Holdings</div>
                        <div className="text-sm font-bold text-white">{summaryStats.holdings}</div>
                    </div>
                </div>
            )}

            {/* Add Stock Button / Input */}
            <div className="pm-card p-4">
                <AnimatePresence mode="wait">
                    {!showAddInput ? (
                        <motion.button
                            key="add-btn"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddInput(true)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-pm-border hover:border-pm-green text-pm-muted hover:text-pm-green transition-all group"
                        >
                            <div className="w-7 h-7 rounded-full bg-pm-green/10 group-hover:bg-pm-green/20 flex items-center justify-center transition-colors">
                                <Plus className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">Add Stock</span>
                        </motion.button>
                    ) : (
                        <motion.div
                            key="add-input"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-pm-muted">Type a ticker to add</span>
                                <button
                                    onClick={() => { setShowAddInput(false); setSearchQuery(""); }}
                                    className="ml-auto text-pm-muted hover:text-pm-text transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="relative">
                                <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pm-green" />
                                <input
                                    ref={addInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="AAPL, NVDA, TSLA..."
                                    className="w-full pl-9 pr-4 py-2.5 bg-pm-black border border-pm-green/50 rounded-lg text-sm text-pm-text placeholder:text-pm-muted focus:outline-none focus:border-pm-green transition-colors font-mono uppercase"
                                    onKeyDown={e => {
                                        if (e.key === "Escape") {
                                            setShowAddInput(false);
                                            setSearchQuery("");
                                        }
                                    }}
                                />
                                {isSearchingApi && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pm-muted animate-spin" />
                                )}
                            </div>

                            {/* Search Results */}
                            <AnimatePresence>
                                {searchQuery.trim() && (allResults.length > 0 || isSearchingApi) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-pm-border bg-pm-dark"
                                    >
                                        {allResults.map(result => (
                                            <button
                                                key={result.ticker}
                                                onClick={() => {
                                                    addStockToPortfolio(result);
                                                    setShowAddInput(false);
                                                }}
                                                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-pm-green/5 transition-colors text-left border-b border-pm-border/30 last:border-b-0"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="font-bold text-white text-xs w-14 flex-shrink-0 font-mono">
                                                        {result.ticker}
                                                    </span>
                                                    <span className="text-pm-muted text-xs truncate">
                                                        {result.name}
                                                    </span>
                                                    {result.source === "api" && (
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-pm-purple/20 text-pm-purple flex-shrink-0">
                                                            API
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-pm-green/10 flex items-center justify-center flex-shrink-0">
                                                    <Plus className="w-3.5 h-3.5 text-pm-green" />
                                                </div>
                                            </button>
                                        ))}
                                        {isSearchingApi && allResults.length === 0 && (
                                            <div className="px-3 py-3 text-center text-xs text-pm-muted">
                                                Searching...
                                            </div>
                                        )}
                                        {!isSearchingApi && allResults.length === 0 && searchQuery.trim() && (
                                            <div className="px-3 py-3 text-center text-xs text-pm-muted">
                                                No stocks found for &quot;{searchQuery.toUpperCase()}&quot;
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Positions List with Live Stats */}
            {positions.length > 0 && (
                <div className="pm-card overflow-hidden">
                    {/* Positions Header */}
                    <button
                        onClick={() => setShowPositions(!showPositions)}
                        className="w-full flex items-center justify-between p-4 text-left"
                    >
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-pm-text">
                                Positions
                            </h4>
                            {positions.length > 1 && (
                                <button
                                    onClick={e => { e.stopPropagation(); equalizeWeights(); }}
                                    className="flex items-center gap-1 text-[10px] text-pm-muted hover:text-pm-green transition-colors"
                                >
                                    <Scale className="w-3 h-3" />
                                    Equal
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={e => { e.stopPropagation(); fetchPrices(); }}
                                disabled={isLoadingPrices}
                                className="text-pm-muted hover:text-pm-green transition-colors disabled:opacity-50"
                                title="Refresh prices"
                            >
                                <RefreshCw className={`w-3 h-3 ${isLoadingPrices ? "animate-spin" : ""}`} />
                            </button>
                            {showPositions ? (
                                <ChevronUp className="w-4 h-4 text-pm-muted" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-pm-muted" />
                            )}
                        </div>
                    </button>

                    {/* Positions Table */}
                    <AnimatePresence>
                        {showPositions && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="px-4 pb-4 space-y-1.5 max-h-[50vh] overflow-y-auto">
                                    <AnimatePresence>
                                        {positions.map(pos => {
                                            const stock = stockDb[pos.ticker];
                                            const priceData = prices[pos.ticker];
                                            const currentPrice = priceData?.price ?? 0;
                                            const ytd = stock?.yearlyClose && currentPrice > 0
                                                ? calculateYTD(currentPrice, stock.yearlyClose)
                                                : 0;
                                            const dayChange = priceData?.changePercent ?? 0;
                                            const hasPriceData = currentPrice > 0;

                                            return (
                                                <motion.div
                                                    key={pos.ticker}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="bg-pm-black rounded-lg border border-pm-border p-3"
                                                >
                                                    {/* Row 1: Ticker + Price + Remove */}
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="font-bold text-sm text-white font-mono">{pos.ticker}</span>
                                                            {stock && (
                                                                <SectorBadge sector={stock.assetClass} size="sm" interactive={false} />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {hasPriceData && (
                                                                <span className="text-xs font-mono text-white">
                                                                    ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={() => removeStock(pos.ticker)}
                                                                className="p-0.5 text-pm-muted hover:text-pm-red transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Row 2: Name */}
                                                    <div className="text-[10px] text-pm-muted truncate mb-2">
                                                        {stock?.name || pos.ticker}
                                                    </div>

                                                    {/* Row 3: Stats Row */}
                                                    <div className="flex items-center justify-between">
                                                        {/* Weight Input */}
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                value={pos.weight || ""}
                                                                onChange={e => updateWeight(pos.ticker, parseFloat(e.target.value) || 0)}
                                                                min={0}
                                                                max={100}
                                                                step={0.01}
                                                                placeholder="0"
                                                                className="w-12 px-1.5 py-0.5 bg-pm-charcoal border border-pm-border rounded text-right text-[11px] text-white focus:outline-none focus:border-pm-green font-mono"
                                                            />
                                                            <span className="text-[10px] text-pm-muted">%w</span>
                                                        </div>

                                                        {/* Day Change + YTD */}
                                                        <div className="flex items-center gap-3">
                                                            {hasPriceData ? (
                                                                <>
                                                                    <span className={`text-[11px] font-mono ${dayChange >= 0 ? "text-pm-green" : "text-pm-red"}`}>
                                                                        {dayChange >= 0 ? "+" : ""}{dayChange.toFixed(2)}%
                                                                    </span>
                                                                    <span className={`text-[11px] font-mono font-bold flex items-center gap-0.5 ${ytd >= 0 ? "text-pm-green" : "text-pm-red"}`}>
                                                                        {ytd >= 0 ? (
                                                                            <TrendingUp className="w-3 h-3" />
                                                                        ) : (
                                                                            <TrendingDown className="w-3 h-3" />
                                                                        )}
                                                                        {ytd > 0 ? "+" : ""}{ytd.toFixed(2)}%
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="text-[11px] text-pm-muted">--</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>

                                {/* Weight Summary */}
                                <div className={`mx-4 mb-3 pt-2 border-t border-pm-border flex items-center justify-between text-xs ${
                                    Math.abs(totalWeight - 100) < 0.1 ? "text-pm-green" : "text-yellow-400"
                                }`}>
                                    <span>Total Weight:</span>
                                    <span className="font-bold font-mono">{totalWeight.toFixed(2)}%</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error / Success Messages */}
                    <div className="px-4 pb-4">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-xs"
                                >
                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>{error}</span>
                                    <button onClick={() => setError(null)} className="ml-auto">
                                        <X className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            )}
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="mb-3 p-2 bg-pm-green/10 border border-pm-green/30 rounded-lg text-pm-green text-xs text-center"
                                >
                                    {success}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={isSaving || positions.length === 0 || !name.trim()}
                            className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {existingWatchlist ? "Update Watchlist" : "Save Watchlist"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Empty state when no positions */}
            {positions.length === 0 && (
                <div className="pm-card p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-pm-green/10 flex items-center justify-center mx-auto mb-3">
                        <Plus className="w-6 h-6 text-pm-green/50" />
                    </div>
                    <p className="text-xs text-pm-muted">
                        Click &quot;Add Stock&quot; above to start building your custom watchlist.
                    </p>
                </div>
            )}
        </div>
    );
}
