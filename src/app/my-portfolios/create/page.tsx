"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useUserPortfolios, UserPortfolioPosition } from "@/context/UserPortfolioContext";
import { useStockDatabase } from "@/context/AdminContext";
import {
    Search,
    Plus,
    X,
    Briefcase,
    ArrowLeft,
    Save,
    AlertCircle,
    Loader2,
    Scale,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import SectorBadge from "@/components/SectorBadge";

export default function CreatePortfolioPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { createPortfolio } = useUserPortfolios();
    const { stockDb } = useStockDatabase();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [positions, setPositions] = useState<UserPortfolioPosition[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // All available stocks from the database
    const allStocks = useMemo(() => {
        return Object.values(stockDb).sort((a, b) => b.pmScore - a.pmScore);
    }, [stockDb]);

    // Filter stocks by search query, excluding already-added ones
    const filteredStocks = useMemo(() => {
        const addedTickers = new Set(positions.map(p => p.ticker));
        const query = searchQuery.toLowerCase().trim();

        if (!query) return allStocks.filter(s => !addedTickers.has(s.ticker));

        return allStocks.filter(s =>
            !addedTickers.has(s.ticker) &&
            (s.ticker.toLowerCase().includes(query) ||
             s.name.toLowerCase().includes(query) ||
             s.sector.toLowerCase().includes(query) ||
             s.assetClass.toLowerCase().includes(query))
        );
    }, [allStocks, positions, searchQuery]);

    // Calculate total weight
    const totalWeight = useMemo(() => {
        return positions.reduce((sum, p) => sum + p.weight, 0);
    }, [positions]);

    const addStock = useCallback((ticker: string) => {
        setPositions(prev => {
            if (prev.find(p => p.ticker === ticker)) return prev;
            // Default to equal weight
            const newCount = prev.length + 1;
            const equalWeight = Math.round((100 / newCount) * 100) / 100;
            const updated = prev.map(p => ({ ...p, weight: equalWeight }));
            return [...updated, { ticker, weight: equalWeight }];
        });
        setSearchQuery("");
    }, []);

    const removeStock = useCallback((ticker: string) => {
        setPositions(prev => {
            const filtered = prev.filter(p => p.ticker !== ticker);
            if (filtered.length === 0) return [];
            const equalWeight = Math.round((100 / filtered.length) * 100) / 100;
            return filtered.map(p => ({ ...p, weight: equalWeight }));
        });
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

        if (!name.trim()) {
            setError("Portfolio name is required");
            return;
        }
        if (positions.length === 0) {
            setError("Add at least one stock to your portfolio");
            return;
        }

        setIsSaving(true);

        try {
            const portfolio = await createPortfolio(name.trim(), description.trim(), positions);
            if (portfolio) {
                router.push("/my-portfolios");
            } else {
                setError("Failed to save portfolio. Please try again.");
            }
        } catch {
            setError("Failed to save portfolio. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Show login prompt if not authenticated
    if (!authLoading && !user) {
        return (
            <div className="relative min-h-screen pb-20 md:pb-0">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="relative max-w-2xl mx-auto px-6 py-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pm-card p-12"
                    >
                        <Briefcase className="w-16 h-16 text-pm-green mx-auto mb-6" />
                        <h1 className="text-3xl font-bold mb-4">Create Your Portfolio</h1>
                        <p className="text-pm-muted mb-8">
                            Sign in or create an account to build and track your own custom stock portfolios.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link
                                href="/login?redirectTo=/my-portfolios/create"
                                className="btn-primary px-6 py-3"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup?redirectTo=/my-portfolios/create"
                                className="px-6 py-3 rounded-lg border border-pm-border text-pm-text hover:border-pm-green transition-colors"
                            >
                                Create Account
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-pm-green" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pb-20 md:pb-0">
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-pm-green/5 rounded-full blur-3xl" />

            <div className="relative max-w-4xl mx-auto px-6 py-12">
                {/* Back Button */}
                <Link
                    href="/my-portfolios"
                    className="inline-flex items-center gap-2 text-pm-muted hover:text-pm-green transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to My Portfolios
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        <span className="text-pm-green">Create</span> Your Portfolio
                    </h1>
                    <p className="text-pm-muted mt-2">
                        Select stocks, set weights, and save your custom portfolio.
                    </p>
                </motion.div>

                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                            <button onClick={() => setError(null)} className="ml-auto">
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column: Portfolio details + stock search */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Portfolio Name & Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="pm-card p-6"
                        >
                            <h2 className="text-lg font-semibold mb-4">Portfolio Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-pm-text mb-2">
                                        Portfolio Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="e.g. My Growth Portfolio"
                                        maxLength={100}
                                        className="w-full px-4 py-3 bg-pm-black border border-pm-border rounded-lg text-pm-text placeholder:text-pm-muted focus:outline-none focus:border-pm-green transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-pm-text mb-2">
                                        Description (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="e.g. High-conviction AI and tech plays"
                                        maxLength={500}
                                        className="w-full px-4 py-3 bg-pm-black border border-pm-border rounded-lg text-pm-text placeholder:text-pm-muted focus:outline-none focus:border-pm-green transition-colors"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Stock Search */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="pm-card p-6"
                        >
                            <h2 className="text-lg font-semibold mb-4">Add Stocks</h2>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pm-muted" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search by ticker, name, or sector..."
                                    className="w-full pl-11 pr-4 py-3 bg-pm-black border border-pm-border rounded-lg text-pm-text placeholder:text-pm-muted focus:outline-none focus:border-pm-green transition-colors"
                                />
                            </div>

                            {/* Stock Results */}
                            <div className="max-h-80 overflow-y-auto space-y-1">
                                {filteredStocks.length === 0 ? (
                                    <p className="text-center text-pm-muted py-8 text-sm">
                                        {searchQuery ? "No stocks found matching your search." : "All available stocks have been added."}
                                    </p>
                                ) : (
                                    filteredStocks.map(stock => (
                                        <button
                                            key={stock.ticker}
                                            onClick={() => addStock(stock.ticker)}
                                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-pm-charcoal/80 transition-colors group text-left"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="font-bold text-white text-sm w-16 flex-shrink-0">
                                                    {stock.ticker}
                                                </span>
                                                <span className="text-pm-muted text-sm truncate">
                                                    {stock.name}
                                                </span>
                                                <SectorBadge sector={stock.assetClass} size="sm" interactive={false} />
                                            </div>
                                            <Plus className="w-4 h-4 text-pm-muted group-hover:text-pm-green flex-shrink-0 transition-colors" />
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right column: Selected positions */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="pm-card p-6 sticky top-24"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">
                                    Positions ({positions.length})
                                </h2>
                                {positions.length > 1 && (
                                    <button
                                        onClick={equalizeWeights}
                                        className="flex items-center gap-1 text-xs text-pm-muted hover:text-pm-green transition-colors"
                                        title="Equal weight all positions"
                                    >
                                        <Scale className="w-3 h-3" />
                                        Equal Weight
                                    </button>
                                )}
                            </div>

                            {positions.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Briefcase className="w-10 h-10 text-pm-muted mx-auto mb-3" />
                                    <p className="text-sm text-pm-muted">
                                        Search and add stocks to build your portfolio.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                    <AnimatePresence>
                                        {positions.map(pos => {
                                            const stock = stockDb[pos.ticker];
                                            return (
                                                <motion.div
                                                    key={pos.ticker}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="flex items-center gap-3 p-3 bg-pm-black rounded-lg border border-pm-border"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-sm text-white">{pos.ticker}</div>
                                                        <div className="text-xs text-pm-muted truncate">
                                                            {stock?.name || pos.ticker}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            value={pos.weight}
                                                            onChange={e => updateWeight(pos.ticker, parseFloat(e.target.value) || 0)}
                                                            min={0.01}
                                                            max={100}
                                                            step={0.01}
                                                            className="w-16 px-2 py-1 bg-pm-charcoal border border-pm-border rounded text-right text-sm text-white focus:outline-none focus:border-pm-green"
                                                        />
                                                        <span className="text-xs text-pm-muted">%</span>
                                                        <button
                                                            onClick={() => removeStock(pos.ticker)}
                                                            className="p-1 text-pm-muted hover:text-pm-red transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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
                                <div className={`mt-4 pt-4 border-t border-pm-border flex items-center justify-between text-sm ${
                                    Math.abs(totalWeight - 100) < 0.1 ? 'text-pm-green' : 'text-yellow-400'
                                }`}>
                                    <span>Total Weight:</span>
                                    <span className="font-bold">{totalWeight.toFixed(2)}%</span>
                                </div>
                            )}

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={isSaving || positions.length === 0 || !name.trim()}
                                className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Portfolio
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
