"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PortfolioTable from "@/components/PortfolioTable";
import { PortfolioErrorBoundary } from "@/components/ErrorBoundary";
import { useAdmin, useStockDatabase } from "@/context/AdminContext";
import { useAuth } from "@/context/AuthContext";
import { useUserPortfolios, UserPortfolio } from "@/context/UserPortfolioContext";
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

// ─── User's Custom Portfolio Card ────────────────────────────────────
interface PriceData {
    price: number | null;
    change: number;
    changePercent: number;
    isLive: boolean;
}

function MyPortfolioCard({
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

// ─── Main Portfolio Page ─────────────────────────────────────────────
export default function PortfolioPage() {
    const { portfolios, activePortfolioId, setActivePortfolioId } = useAdmin();
    const { user } = useAuth();
    const { portfolios: userPortfolios, isLoading: userPortfoliosLoading, deletePortfolio } = useUserPortfolios();
    const { stockDb } = useStockDatabase();

    const selectedPortfolio = portfolios.find(p => p.id === activePortfolioId) || portfolios[0];

    useEffect(() => {
        if (!selectedPortfolio && portfolios.length > 0) {
            setActivePortfolioId(portfolios[0].id);
        }
    }, [portfolios, selectedPortfolio, setActivePortfolioId]);

    const handleDeleteUserPortfolio = useCallback(async (id: string) => {
        await deletePortfolio(id);
    }, [deletePortfolio]);

    if (!selectedPortfolio) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-pm-muted">Loading portfolios...</p>
            </div>
        );
    }

    const userPortfolio = userPortfolios[0] ?? null;
    const showCreateButton = user && !userPortfoliosLoading && userPortfolios.length === 0;

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
                            Portfolios
                        </h1>
                    </div>
                </motion.div>

                {/* User's Custom Portfolio Section */}
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
                                My Portfolio
                            </h2>
                            {showCreateButton && (
                                <Link
                                    href="/portfolio/create"
                                    className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Portfolio
                                </Link>
                            )}
                        </div>

                        {userPortfolio ? (
                            <MyPortfolioCard
                                portfolio={userPortfolio}
                                onDelete={handleDeleteUserPortfolio}
                                stockDb={stockDb}
                            />
                        ) : !userPortfoliosLoading ? (
                            <div className="pm-card p-6 text-center border-dashed border-pm-border">
                                <p className="text-sm text-pm-muted mb-3">
                                    You haven&apos;t created a custom portfolio yet.
                                </p>
                                <Link
                                    href="/portfolio/create"
                                    className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Portfolio
                                </Link>
                            </div>
                        ) : null}
                    </motion.div>
                )}

                {/* Model Portfolios Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-4"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-pm-text flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-pm-green" />
                            Model Portfolios
                        </h2>
                        <Link
                            href="/portfolio/create"
                            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Create Portfolio
                        </Link>
                    </div>
                </motion.div>

                {/* Portfolio Selector Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10"
                >
                    {portfolios.map((portfolio, index) => (
                        <motion.button
                            key={portfolio.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                            onClick={() => setActivePortfolioId(portfolio.id)}
                            className={`text-left p-4 rounded-lg border transition-all ${
                                portfolio.id === activePortfolioId
                                    ? 'bg-pm-green/10 border-pm-green text-pm-text'
                                    : 'bg-pm-charcoal/50 border-pm-border hover:border-pm-green/50 text-pm-muted hover:text-pm-text'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Briefcase className={`w-4 h-4 ${portfolio.id === activePortfolioId ? 'text-pm-green' : ''}`} />
                                <span className="font-semibold text-sm truncate">{portfolio.name}</span>
                            </div>
                            <p className="text-xs text-pm-muted line-clamp-2">{portfolio.description}</p>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Selected Portfolio Header */}
                <motion.div
                    key={`header-${activePortfolioId}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6"
                >
                    <h2 className="text-2xl font-bold text-pm-green">{selectedPortfolio.name}</h2>
                    <p className="text-pm-muted text-sm">{selectedPortfolio.description}</p>
                </motion.div>

                {/* Portfolio Table */}
                <motion.div
                    key={activePortfolioId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <PortfolioErrorBoundary>
                        <PortfolioTable
                            portfolioId={selectedPortfolio.id}
                            portfolioName={selectedPortfolio.name}
                        />
                    </PortfolioErrorBoundary>
                </motion.div>

                {/* Disclaimer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 text-center"
                >
                    <p className="text-xs text-pm-muted max-w-2xl mx-auto">
                        Model portfolio performance is hypothetical. Past performance does not guarantee future results.
                        PM Research provides research content and model portfolios—not personalized investment advice.
                        PM Scores reflect research depth and thesis development, not return predictions. Always conduct your own research before making investment decisions.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
