"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscription } from "@/context/SubscriptionContext";
import { mockPortfolio, PortfolioPosition } from "@/lib/mockData";
import {
    Lock,
    TrendingUp,
    TrendingDown,
    ExternalLink,
    Sparkles,
} from "lucide-react";
import Link from "next/link";

// Format currency
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(value);
};

// Format percentage
const formatPercent = (value: number): string => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
};

// Asset class badge colors
const assetClassColors: Record<string, string> = {
    AI: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Orbital: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Automation: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Quantum: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    Energy: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

// Teaser row for guests
const teaserPosition: PortfolioPosition = {
    id: "teaser",
    ticker: "████",
    name: "AI Stock #1",
    assetClass: "AI",
    entryPrice: 0,
    currentPrice: 0,
    returnPercent: 94.4,
    status: "Open",
    entryDate: "2024-01-15",
    pmScore: 98,
};

export default function PortfolioTable() {
    const { isSubscribed } = useSubscription();

    const [prices, setPrices] = useState<Record<string, number>>({});
    const [isLoadingPrices, setIsLoadingPrices] = useState(true);

    // Fetch live prices on mount and every 60 seconds
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch("/api/prices");
                if (res.ok) {
                    const data = await res.json();
                    setPrices(data);
                    setIsLoadingPrices(false);
                }
            } catch (error) {
                console.error("Error fetching prices:", error);
                setIsLoadingPrices(false);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    // Merge mock data with live prices
    const livePortfolio = mockPortfolio.map((position) => {
        const livePrice = prices[position.ticker] || position.currentPrice; // Fallback to mock if fetch fails
        // Calculate return based on ENTRY price vs LIVE price
        const liveReturn = ((livePrice - position.entryPrice) / position.entryPrice) * 100;

        return {
            ...position,
            currentPrice: livePrice,
            returnPercent: liveReturn
        };
    });

    return (
        <div className="relative">
            {/* Table Container */}
            <div className="overflow-hidden rounded-lg border border-pm-border bg-pm-charcoal">
                {/* Table Header */}
                <div className="grid grid-cols-7 gap-4 bg-pm-dark border-b border-pm-border">
                    <div className="data-header">Ticker</div>
                    <div className="data-header">Asset Class</div>
                    <div className="data-header text-right">Entry Price</div>
                    <div className="data-header text-right">
                        Current Price
                        {isSubscribed && (
                            <span className="ml-1 text-[10px] text-pm-muted font-normal normal-case">
                                {isLoadingPrices ? "(Loading...)" : "(Live)"}
                            </span>
                        )}
                    </div>
                    <div className="data-header text-right">Return</div>
                    <div className="data-header text-center">PM Score</div>
                    <div className="data-header text-center">Status</div>
                </div>

                {/* Subscriber View - Full Data */}
                {isSubscribed ? (
                    <AnimatePresence>
                        {livePortfolio.map((position, index) => (
                            <motion.div
                                key={position.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="grid grid-cols-7 gap-4 hover:bg-pm-dark/50 transition-colors"
                            >
                                {/* Ticker */}
                                <div className="data-cell">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-semibold text-pm-text">
                                            {position.ticker}
                                        </span>
                                        <ExternalLink className="w-3 h-3 text-pm-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="text-xs text-pm-muted truncate">
                                        {position.name}
                                    </div>
                                </div>

                                {/* Asset Class */}
                                <div className="data-cell">
                                    <span
                                        className={`inline-block px-2 py-1 rounded text-xs font-mono border ${assetClassColors[position.assetClass]
                                            }`}
                                    >
                                        {position.assetClass}
                                    </span>
                                </div>

                                {/* Entry Price */}
                                <div className="data-cell text-right font-mono text-pm-text">
                                    {formatCurrency(position.entryPrice)}
                                </div>

                                {/* Current Price */}
                                <div className="data-cell text-right font-mono text-pm-text">
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={position.currentPrice}
                                            initial={{ opacity: 0.5, color: "#fff" }}
                                            animate={{ opacity: 1 }}
                                            className={isLoadingPrices ? "animate-pulse" : ""}
                                        >
                                            {formatCurrency(position.currentPrice)}
                                        </motion.span>
                                    </AnimatePresence>
                                </div>

                                {/* Return */}
                                <div className="data-cell text-right">
                                    <span
                                        className={`inline-flex items-center gap-1 font-mono font-medium ${position.returnPercent >= 0
                                            ? "return-positive"
                                            : "return-negative"
                                            }`}
                                    >
                                        {position.returnPercent >= 0 ? (
                                            <TrendingUp className="w-4 h-4" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4" />
                                        )}
                                        {formatPercent(position.returnPercent)}
                                    </span>
                                </div>

                                {/* PM Score */}
                                <div className="data-cell text-center">
                                    <span
                                        className={`pm-score ${position.pmScore >= 90
                                            ? "!bg-pm-green/20 !text-pm-green"
                                            : position.pmScore >= 70
                                                ? "!bg-yellow-500/20 !text-yellow-400"
                                                : "!bg-pm-red/20 !text-pm-red"
                                            }`}
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        {position.pmScore}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="data-cell text-center">
                                    <span
                                        className={
                                            position.status === "Open" ? "status-open" : "status-closed"
                                        }
                                    >
                                        {position.status}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    /* Guest View - Blurred with Teaser */
                    <div className="relative">
                        {/* Teaser Row */}
                        <div className="grid grid-cols-7 gap-4 border-b border-pm-border">
                            <div className="data-cell">
                                <span className="font-mono font-semibold text-pm-muted">
                                    {teaserPosition.ticker}
                                </span>
                                <div className="text-xs text-pm-muted">{teaserPosition.name}</div>
                            </div>
                            <div className="data-cell">
                                <span className="inline-block px-2 py-1 rounded text-xs font-mono border bg-purple-500/20 text-purple-400 border-purple-500/30">
                                    AI
                                </span>
                            </div>
                            <div className="data-cell text-right font-mono text-pm-muted">
                                ████
                            </div>
                            <div className="data-cell text-right font-mono text-pm-muted">
                                ████
                            </div>
                            <div className="data-cell text-right">
                                <span className="return-positive flex items-center justify-end gap-1">
                                    <TrendingUp className="w-4 h-4" />
                                    {formatPercent(teaserPosition.returnPercent)}
                                </span>
                            </div>
                            <div className="data-cell text-center">
                                <span className="pm-score !bg-pm-green/20 !text-pm-green">
                                    <Sparkles className="w-3 h-3" />
                                    {teaserPosition.pmScore}
                                </span>
                            </div>
                            <div className="data-cell text-center">
                                <span className="status-open">Open</span>
                            </div>
                        </div>

                        {/* Blurred Rows */}
                        <div className="blur-content select-none pointer-events-none">
                            {mockPortfolio.slice(0, 5).map((position) => (
                                <div
                                    key={position.id}
                                    className="grid grid-cols-7 gap-4 border-b border-pm-border"
                                >
                                    <div className="data-cell font-mono">{position.ticker}</div>
                                    <div className="data-cell">{position.assetClass}</div>
                                    <div className="data-cell text-right font-mono">
                                        {formatCurrency(position.entryPrice)}
                                    </div>
                                    <div className="data-cell text-right font-mono">
                                        {formatCurrency(position.currentPrice)}
                                    </div>
                                    <div className="data-cell text-right font-mono">
                                        {formatPercent(position.returnPercent)}
                                    </div>
                                    <div className="data-cell text-center">{position.pmScore}</div>
                                    <div className="data-cell text-center">{position.status}</div>
                                </div>
                            ))}
                        </div>

                        {/* Subscribe Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-pm-black via-pm-black/80 to-transparent"
                        >
                            <div className="pm-card border-pm-green/30 text-center p-8 max-w-md">
                                <Lock className="w-12 h-12 text-pm-green mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Subscribe to Reveal Portfolio</h3>
                                <p className="text-pm-muted text-sm mb-6">
                                    Unlock full access to our curated portfolio of high-conviction positions,
                                    entry prices, and real-time PM Scores.
                                </p>
                                <Link href="/pricing" className="btn-primary inline-flex items-center gap-2">
                                    View Plans
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Portfolio Summary (Subscriber Only) */}
            {isSubscribed && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
                >
                    <div className="pm-card text-center">
                        <div className="text-2xl font-mono font-bold text-pm-green">
                            {mockPortfolio.filter((p) => p.status === "Open").length}
                        </div>
                        <div className="text-sm text-pm-muted">Open Positions</div>
                    </div>
                    <div className="pm-card text-center">
                        <div className="text-2xl font-mono font-bold text-pm-green">
                            +
                            {(
                                mockPortfolio
                                    .filter((p) => p.status === "Open")
                                    .reduce((sum, p) => sum + p.returnPercent, 0) /
                                mockPortfolio.filter((p) => p.status === "Open").length
                            ).toFixed(1)}
                            %
                        </div>
                        <div className="text-sm text-pm-muted">Avg. Return (Open)</div>
                    </div>
                    <div className="pm-card text-center">
                        <div className="text-2xl font-mono font-bold text-pm-purple">
                            {Math.round(
                                mockPortfolio.reduce((sum, p) => sum + p.pmScore, 0) /
                                mockPortfolio.length
                            )}
                        </div>
                        <div className="text-sm text-pm-muted">Avg. PM Score</div>
                    </div>
                    <div className="pm-card text-center">
                        <div className="text-2xl font-mono font-bold text-pm-text">
                            {mockPortfolio.filter((p) => p.returnPercent > 0).length}/
                            {mockPortfolio.length}
                        </div>
                        <div className="text-sm text-pm-muted">Win Rate</div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
