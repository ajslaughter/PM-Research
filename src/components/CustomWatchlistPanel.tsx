"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useUserWatchlists, UserWatchlistPosition } from "@/context/UserWatchlistContext";
import { useStockDatabase } from "@/context/AdminContext";
import { StockData } from "@/data/stockDatabase";
import Link from "next/link";
import SectorBadge from "@/components/SectorBadge";
import {
    Search,
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
} from "lucide-react";

interface SearchResult {
    ticker: string;
    name: string;
    assetClass: string;
    source: "local" | "api";
}

export default function CustomWatchlistPanel() {
    const { user } = useAuth();
    const { watchlists, createWatchlist, updateWatchlist } = useUserWatchlists();
    const { stockDb, addStock } = useStockDatabase();

    const existingWatchlist = watchlists[0] ?? null;

    const [name, setName] = useState("");
    const [positions, setPositions] = useState<UserWatchlistPosition[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [apiResults, setApiResults] = useState<SearchResult[]>([]);
    const [isSearchingApi, setIsSearchingApi] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load existing watchlist positions on mount
    useEffect(() => {
        if (existingWatchlist && !initialized) {
            setName(existingWatchlist.name);
            setPositions(existingWatchlist.positions);
            setInitialized(true);
        }
    }, [existingWatchlist, initialized]);

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
            .slice(0, 8)
            .map(s => ({ ticker: s.ticker, name: s.name, assetClass: s.assetClass, source: "local" as const }));
    }, [stockDb, positions, searchQuery]);

    // Debounced API search for tickers not in local DB
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        setApiResults([]);

        const query = searchQuery.trim().toUpperCase();
        if (!query || query.length < 1) return;

        // Check if the exact query matches a local stock - if so no need for API
        if (stockDb[query]) return;

        // Only call API if query looks like a ticker (1-5 uppercase letters or has hyphen like BTC-USD)
        if (!/^[A-Z]{1,5}(-[A-Z]{1,5})?$/.test(query)) return;

        // Already in positions
        if (positions.some(p => p.ticker === query)) return;

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearchingApi(true);
            try {
                const res = await fetch(`/api/stock-info?ticker=${query}`);
                if (res.ok) {
                    const data = await res.json();
                    // Don't add if it's already in local results
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
                // Silently fail - local results still available
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

    const addStockToPortfolio = useCallback(async (result: SearchResult) => {
        // If it's from the API and not in our local stockDb, add it
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
                    Sign in to build your own custom watchlist with any stock.
                </p>
                <Link
                    href="/login?redirectTo=/watchlist"
                    className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
                >
                    <LogIn className="w-4 h-4" />
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="pm-card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-5 h-5 text-pm-green" />
                    <h3 className="font-bold text-white">
                        {existingWatchlist ? "My Watchlist" : "Create Watchlist"}
                    </h3>
                </div>

                {/* Name Input */}
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Watchlist name..."
                    maxLength={100}
                    className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm text-pm-text placeholder:text-pm-muted focus:outline-none focus:border-pm-green transition-colors mb-4"
                />

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pm-muted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search any stock ticker..."
                        className="w-full pl-9 pr-4 py-2 bg-pm-black border border-pm-border rounded-lg text-sm text-pm-text placeholder:text-pm-muted focus:outline-none focus:border-pm-green transition-colors"
                    />
                    {isSearchingApi && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pm-muted animate-spin" />
                    )}
                </div>

                {/* Search Results Dropdown */}
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
                                    onClick={() => addStockToPortfolio(result)}
                                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-pm-charcoal/80 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-bold text-white text-xs w-14 flex-shrink-0">
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
                                    <Plus className="w-3.5 h-3.5 text-pm-muted flex-shrink-0" />
                                </button>
                            ))}
                            {isSearchingApi && allResults.length === 0 && (
                                <div className="px-3 py-3 text-center text-xs text-pm-muted">
                                    Searching...
                                </div>
                            )}
                            {!isSearchingApi && allResults.length === 0 && searchQuery.trim() && (
                                <div className="px-3 py-3 text-center text-xs text-pm-muted">
                                    No stocks found
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Positions List */}
            <div className="pm-card p-5">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-pm-text">
                        Positions ({positions.length})
                    </h4>
                    {positions.length > 1 && (
                        <button
                            onClick={equalizeWeights}
                            className="flex items-center gap-1 text-[10px] text-pm-muted hover:text-pm-green transition-colors"
                        >
                            <Scale className="w-3 h-3" />
                            Equal Weight
                        </button>
                    )}
                </div>

                {positions.length === 0 ? (
                    <div className="py-8 text-center">
                        <Search className="w-8 h-8 text-pm-muted/50 mx-auto mb-2" />
                        <p className="text-xs text-pm-muted">
                            Search for any stock above to start building your watchlist.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                        <AnimatePresence>
                            {positions.map(pos => {
                                const stock = stockDb[pos.ticker];
                                return (
                                    <motion.div
                                        key={pos.ticker}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex items-center gap-2 p-2.5 bg-pm-black rounded-lg border border-pm-border"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-xs text-white">{pos.ticker}</span>
                                                {stock && (
                                                    <SectorBadge sector={stock.assetClass} size="sm" interactive={false} />
                                                )}
                                            </div>
                                            <div className="text-[10px] text-pm-muted truncate">
                                                {stock?.name || pos.ticker}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="number"
                                                value={pos.weight || ""}
                                                onChange={e => updateWeight(pos.ticker, parseFloat(e.target.value) || 0)}
                                                min={0}
                                                max={100}
                                                step={0.01}
                                                placeholder="0"
                                                className="w-14 px-1.5 py-1 bg-pm-charcoal border border-pm-border rounded text-right text-xs text-white focus:outline-none focus:border-pm-green"
                                            />
                                            <span className="text-[10px] text-pm-muted">%</span>
                                            <button
                                                onClick={() => removeStock(pos.ticker)}
                                                className="p-1 text-pm-muted hover:text-pm-red transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* Weight Summary */}
                {positions.length > 0 && (
                    <div className={`mt-3 pt-3 border-t border-pm-border flex items-center justify-between text-xs ${
                        Math.abs(totalWeight - 100) < 0.1 ? "text-pm-green" : "text-yellow-400"
                    }`}>
                        <span>Total Weight:</span>
                        <span className="font-bold font-mono">{totalWeight.toFixed(2)}%</span>
                    </div>
                )}

                {/* Error / Success Messages */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-xs"
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
                            className="mt-3 p-2 bg-pm-green/10 border border-pm-green/30 rounded-lg text-pm-green text-xs text-center"
                        >
                            {success}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isSaving || positions.length === 0 || !name.trim()}
                    className="btn-primary w-full mt-4 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
    );
}
