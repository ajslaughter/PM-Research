"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import WatchlistTable from "@/components/WatchlistTable";
import { WatchlistErrorBoundary } from "@/components/ErrorBoundary";
import { useAdmin, useStockDatabase } from "@/context/AdminContext";
import { useAuth } from "@/context/AuthContext";
import { useUserWatchlists, UserWatchlist } from "@/context/UserWatchlistContext";
import { calculateYTD } from "@/services/stockService";
import {
    Briefcase,
    Zap,
    Plus,
    FolderHeart,
    Trash2,
    TrendingUp,
    TrendingDown,
    ChevronDown,
    ChevronUp,
    Loader2,
} from "lucide-react";
import SectorBadge from "@/components/SectorBadge";

// ─── User's Custom Watchlist Card ────────────────────────────────────
interface PriceData {
    price: number | null;
    change: number;
    changePercent: number;
    isLive: boolean;
}

function MyWatchlistCard({
    watchlist,
    onDelete,
    stockDb,
}: {
    watchlist: UserWatchlist;
    onDelete: (id: string) => void;
    stockDb: Record<string, { name: string; assetClass: string; yearlyClose: number; pmScore: number }>;
}) {
    const [expanded, setExpanded] = useState(false);
    const [prices, setPrices] = useState<Record<string, PriceData>>({});
    const [isLoadingPrices, setIsLoadingPrices] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const hasFetchedRef = useRef(false);

    const tickers = watchlist.positions.map(p => p.ticker).join(',');

    useEffect(() => {
        if (!expanded || hasFetchedRef.current || !tickers) return;
        hasFetchedRef.current = true;
        setIsLoadingPrices(true);

        fetch(`/api/prices?tickers=${tickers}&ts=${Date.now()}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.prices) setPrices(data.prices);
            })
            .catch(() => {})
            .finally(() => setIsLoadingPrices(false));
    }, [expanded, tickers]);

    const weightedYTD = useMemo(() => {
        if (Object.keys(prices).length === 0) return null;
        let totalWeightedReturn = 0;
        let totalWeight = 0;
        for (const pos of watchlist.positions) {
            const priceData = prices[pos.ticker];
            const stock = stockDb[pos.ticker];
            if (priceData?.price && stock?.yearlyClose && stock.yearlyClose > 0) {
                const ytd = calculateYTD(priceData.price, stock.yearlyClose);
                totalWeightedReturn += ytd * pos.weight;
                totalWeight += pos.weight;
            }
        }
        return totalWeight > 0 ? totalWeightedReturn / totalWeight : 0;
    }, [prices, watchlist.positions, stockDb]);

    const handleDelete = () => {
        if (confirmDelete) {
            onDelete(watchlist.id);
        } else {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pm-card overflow-hidden border-pm-purple/30"
        >
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-5 flex items-center justify-between text-left"
            >
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-pm-purple/10 flex items-center justify-center flex-shrink-0">
                        <FolderHeart className="w-5 h-5 text-pm-purple" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-white truncate">{watchlist.name}</h3>
                        <p className="text-xs text-pm-muted truncate">
                            {watchlist.positions.length} position{watchlist.positions.length !== 1 ? 's' : ''}
                            {watchlist.description ? ` \u00B7 ${watchlist.description}` : ''}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {weightedYTD !== null && (
                        <span className={`text-sm font-mono font-bold ${weightedYTD >= 0 ? 'text-pm-green' : 'text-pm-red'}`}>
                            {weightedYTD >= 0 ? '+' : ''}{weightedYTD.toFixed(2)}%
                        </span>
                    )}
                    {expanded ? (
                        <ChevronUp className="w-5 h-5 text-pm-muted" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-pm-muted" />
                    )}
                </div>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 border-t border-pm-border pt-4">
                            {isLoadingPrices ? (
                                <div className="flex items-center justify-center py-8 gap-2 text-pm-muted">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Loading prices...</span>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="text-xs text-pm-muted uppercase border-b border-pm-border">
                                                <th className="pb-2 pr-4">Ticker</th>
                                                <th className="pb-2 pr-4">Sector</th>
                                                <th className="pb-2 text-right pr-4">Weight</th>
                                                <th className="pb-2 text-right pr-4">Price</th>
                                                <th className="pb-2 text-right">YTD</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-pm-border/50">
                                            {watchlist.positions.map(pos => {
                                                const stock = stockDb[pos.ticker];
                                                const priceData = prices[pos.ticker];
                                                const currentPrice = priceData?.price ?? 0;
                                                const ytd = stock?.yearlyClose && currentPrice > 0
                                                    ? calculateYTD(currentPrice, stock.yearlyClose)
                                                    : 0;
                                                return (
                                                    <tr key={pos.ticker} className="hover:bg-pm-charcoal/50">
                                                        <td className="py-2 pr-4">
                                                            <div>
                                                                <span className="font-bold text-white">{pos.ticker}</span>
                                                                <span className="text-xs text-pm-muted block">
                                                                    {stock?.name || pos.ticker}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2 pr-4">
                                                            <SectorBadge
                                                                sector={stock?.assetClass || 'Unknown'}
                                                                size="sm"
                                                                interactive={false}
                                                            />
                                                        </td>
                                                        <td className="py-2 text-right pr-4 font-mono text-pm-muted">
                                                            {pos.weight.toFixed(2)}%
                                                        </td>
                                                        <td className="py-2 text-right pr-4 font-mono text-white">
                                                            {currentPrice > 0
                                                                ? `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                                : '--'
                                                            }
                                                        </td>
                                                        <td className={`py-2 text-right font-mono font-bold ${ytd >= 0 ? 'text-pm-green' : 'text-pm-red'}`}>
                                                            {currentPrice > 0 ? (
                                                                <>
                                                                    {ytd >= 0 ? (
                                                                        <TrendingUp className="w-3 h-3 inline mr-1" />
                                                                    ) : (
                                                                        <TrendingDown className="w-3 h-3 inline mr-1" />
                                                                    )}
                                                                    {ytd > 0 ? '+' : ''}{ytd.toFixed(2)}%
                                                                </>
                                                            ) : '--'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-pm-border">
                                <span className="text-xs text-pm-muted">
                                    Created {new Date(watchlist.created_at).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={handleDelete}
                                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors ${
                                        confirmDelete
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            : 'text-pm-muted hover:text-pm-red'
                                    }`}
                                >
                                    <Trash2 className="w-3 h-3" />
                                    {confirmDelete ? 'Confirm Delete' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Main Watchlist Page ─────────────────────────────────────────────
export default function WatchlistPage() {
    const { watchlists, activeWatchlistId, setActiveWatchlistId } = useAdmin();
    const { user } = useAuth();
    const { watchlists: userWatchlists, isLoading: userWatchlistsLoading, deleteWatchlist } = useUserWatchlists();
    const { stockDb } = useStockDatabase();

    const selectedWatchlist = watchlists.find(p => p.id === activeWatchlistId) || watchlists[0];

    useEffect(() => {
        if (!selectedWatchlist && watchlists.length > 0) {
            setActiveWatchlistId(watchlists[0].id);
        }
    }, [watchlists, selectedWatchlist, setActiveWatchlistId]);

    const handleDeleteUserWatchlist = useCallback(async (id: string) => {
        await deleteWatchlist(id);
    }, [deleteWatchlist]);

    if (!selectedWatchlist) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-pm-muted">Loading watchlists...</p>
            </div>
        );
    }

    const userWatchlistItem = userWatchlists[0] ?? null;
    const showCreateButton = user && !userWatchlistsLoading && userWatchlists.length === 0;

    return (
        <div className="relative min-h-screen pb-20 md:pb-0">
            {/* Grid Background */}
            <div className="absolute inset-0 grid-bg opacity-30" />

            {/* Glow Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-pm-green/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-pm-purple/5 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="relative">
                            <Zap className="w-8 h-8 text-pm-green" />
                            <div className="absolute inset-0 blur-md bg-pm-green/30" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            PM Watchlist
                        </h1>
                    </div>
                </motion.div>

                {/* User's Custom Watchlist Section */}
                {user && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="mb-10"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-pm-text flex items-center gap-2">
                                <FolderHeart className="w-5 h-5 text-pm-purple" />
                                My Watchlist
                            </h2>
                            {showCreateButton && (
                                <Link
                                    href="/watchlist/create"
                                    className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Watchlist
                                </Link>
                            )}
                        </div>

                        {userWatchlistItem ? (
                            <MyWatchlistCard
                                watchlist={userWatchlistItem}
                                onDelete={handleDeleteUserWatchlist}
                                stockDb={stockDb}
                            />
                        ) : !userWatchlistsLoading ? (
                            <div className="pm-card p-6 text-center border-dashed border-pm-border">
                                <p className="text-sm text-pm-muted mb-3">
                                    You haven&apos;t created a custom watchlist yet.
                                </p>
                                <Link
                                    href="/watchlist/create"
                                    className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Watchlist
                                </Link>
                            </div>
                        ) : null}
                    </motion.div>
                )}

                {/* Watchlist Selector Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10"
                >
                    {watchlists.map((watchlist, index) => (
                        <motion.button
                            key={watchlist.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                            onClick={() => setActiveWatchlistId(watchlist.id)}
                            className={`text-left p-4 rounded-lg border transition-all ${
                                watchlist.id === activeWatchlistId
                                    ? 'bg-pm-green/10 border-pm-green text-pm-text'
                                    : 'bg-pm-charcoal/50 border-pm-border hover:border-pm-green/50 text-pm-muted hover:text-pm-text'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Briefcase className={`w-4 h-4 ${watchlist.id === activeWatchlistId ? 'text-pm-green' : ''}`} />
                                <span className="font-semibold text-sm truncate">{watchlist.name}</span>
                            </div>
                            <p className="text-xs text-pm-muted line-clamp-2">{watchlist.description}</p>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Selected Watchlist Header */}
                <motion.div
                    key={`header-${activeWatchlistId}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6"
                >
                    <h2 className="text-2xl font-bold text-pm-green">{selectedWatchlist.name}</h2>
                    <p className="text-pm-muted text-sm">{selectedWatchlist.description}</p>
                </motion.div>

                {/* Watchlist Table */}
                <motion.div
                    key={activeWatchlistId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <WatchlistErrorBoundary>
                        <WatchlistTable
                            watchlistId={selectedWatchlist.id}
                            watchlistName={selectedWatchlist.name}
                        />
                    </WatchlistErrorBoundary>
                </motion.div>
            </div>
        </div>
    );
}
