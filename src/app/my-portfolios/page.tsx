"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useUserPortfolios, UserPortfolio } from "@/context/UserPortfolioContext";
import { useStockDatabase } from "@/context/AdminContext";
import { calculateYTD } from "@/services/stockService";
import {
    Briefcase,
    Plus,
    Trash2,
    Loader2,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Zap,
    AlertCircle,
} from "lucide-react";
import SectorBadge from "@/components/SectorBadge";

// Price data type
interface PriceData {
    price: number | null;
    change: number;
    changePercent: number;
    isLive: boolean;
}

function PortfolioCard({
    portfolio,
    onDelete,
    stockDb,
}: {
    portfolio: UserPortfolio;
    onDelete: (id: string) => void;
    stockDb: Record<string, { name: string; assetClass: string; yearlyClose: number; pmScore: number }>;
}) {
    const [expanded, setExpanded] = useState(false);
    const [prices, setPrices] = useState<Record<string, PriceData>>({});
    const [isLoadingPrices, setIsLoadingPrices] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const hasFetchedRef = useRef(false);

    const tickers = portfolio.positions.map(p => p.ticker).join(',');

    // Fetch prices when expanded
    useEffect(() => {
        if (!expanded || hasFetchedRef.current || !tickers) return;
        hasFetchedRef.current = true;
        setIsLoadingPrices(true);

        fetch(`/api/prices?tickers=${tickers}&ts=${Date.now()}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.prices) {
                    setPrices(data.prices);
                }
            })
            .catch(() => {})
            .finally(() => setIsLoadingPrices(false));
    }, [expanded, tickers]);

    // Calculate weighted YTD
    const weightedYTD = useMemo(() => {
        if (Object.keys(prices).length === 0) return null;
        let totalWeightedReturn = 0;
        let totalWeight = 0;
        for (const pos of portfolio.positions) {
            const priceData = prices[pos.ticker];
            const stock = stockDb[pos.ticker];
            if (priceData?.price && stock?.yearlyClose && stock.yearlyClose > 0) {
                const ytd = calculateYTD(priceData.price, stock.yearlyClose);
                totalWeightedReturn += ytd * pos.weight;
                totalWeight += pos.weight;
            }
        }
        return totalWeight > 0 ? totalWeightedReturn / totalWeight : 0;
    }, [prices, portfolio.positions, stockDb]);

    const handleDelete = () => {
        if (confirmDelete) {
            onDelete(portfolio.id);
        } else {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pm-card overflow-hidden"
        >
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-5 flex items-center justify-between text-left"
            >
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-pm-green/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-pm-green" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-white truncate">{portfolio.name}</h3>
                        <p className="text-xs text-pm-muted truncate">
                            {portfolio.positions.length} position{portfolio.positions.length !== 1 ? 's' : ''}
                            {portfolio.description ? ` \u00B7 ${portfolio.description}` : ''}
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

            {/* Expanded Content */}
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
                                            {portfolio.positions.map(pos => {
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

                            {/* Actions */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-pm-border">
                                <span className="text-xs text-pm-muted">
                                    Created {new Date(portfolio.created_at).toLocaleDateString()}
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

export default function MyPortfoliosPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { portfolios, isLoading, error, deletePortfolio, refreshPortfolios } = useUserPortfolios();
    const { stockDb } = useStockDatabase();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refreshPortfolios();
        setIsRefreshing(false);
    }, [refreshPortfolios]);

    const handleDelete = useCallback(async (id: string) => {
        await deletePortfolio(id);
    }, [deletePortfolio]);

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
                        <h1 className="text-3xl font-bold mb-4">My Portfolios</h1>
                        <p className="text-pm-muted mb-8">
                            Sign in or create an account to build and track your own custom stock portfolios with live pricing.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link
                                href="/login?redirectTo=/my-portfolios"
                                className="btn-primary px-6 py-3"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup?redirectTo=/my-portfolios"
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

    if (authLoading || isLoading) {
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
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-pm-purple/5 rounded-full blur-3xl" />

            <div className="relative max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Zap className="w-8 h-8 text-pm-green" />
                                <div className="absolute inset-0 blur-md bg-pm-green/30" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                    My Portfolios
                                </h1>
                                <p className="text-pm-muted text-sm">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="flex items-center gap-1.5 text-sm text-pm-muted hover:text-pm-green transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <Link
                                href="/my-portfolios/create"
                                className="btn-primary flex items-center gap-2 px-4 py-2"
                            >
                                <Plus className="w-4 h-4" />
                                Create Portfolio
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Error */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                    </motion.div>
                )}

                {/* Portfolio List */}
                {portfolios.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pm-card p-12 text-center"
                    >
                        <Briefcase className="w-16 h-16 text-pm-muted mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">No Portfolios Yet</h2>
                        <p className="text-pm-muted mb-6">
                            Create your first custom portfolio by selecting any stocks from our coverage universe.
                        </p>
                        <Link
                            href="/my-portfolios/create"
                            className="btn-primary inline-flex items-center gap-2 px-6 py-3"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Portfolio
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {portfolios.map((portfolio, index) => (
                            <motion.div
                                key={portfolio.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * index }}
                            >
                                <PortfolioCard
                                    portfolio={portfolio}
                                    onDelete={handleDelete}
                                    stockDb={stockDb}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Disclaimer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 text-center"
                >
                    <p className="text-xs text-pm-muted max-w-2xl mx-auto">
                        Custom portfolios are for research tracking purposes only. PM Research does not provide personalized investment advice.
                        Always conduct your own research before making investment decisions.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
