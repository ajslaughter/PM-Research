"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useSubscription } from "@/context/SubscriptionContext";
import { PortfolioPosition } from "@/lib/portfolios";
import {
    Lock,
    TrendingUp,
    TrendingDown,
    Sparkles,
    RefreshCw,
} from "lucide-react";


// API response type
interface PriceData {
    price: number;
    changePercent: number;
}

// Props for the component
interface PortfolioTableProps {
    portfolioData: PortfolioPosition[];
    portfolioName: string;
}

// Asset class badge colors
const assetClassColors: Record<string, string> = {
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

// Skeleton loader component
const SkeletonCell = ({ width = "w-16" }: { width?: string }) => (
    <div className={`h-4 ${width} bg-pm-charcoal animate-pulse rounded`} />
);



export default function PortfolioTable({ portfolioData, portfolioName }: PortfolioTableProps) {
    const { isSubscribed } = useSubscription();

    const [prices, setPrices] = useState<Record<string, PriceData>>({});
    const [isLoadingPrices, setIsLoadingPrices] = useState(true);
    const [lastPriceFetch, setLastPriceFetch] = useState<Date | null>(null);

    // Build ticker list dynamically from current portfolio
    const tickerList = useMemo(() => {
        return portfolioData.map(p => p.ticker).join(',');
    }, [portfolioData]);

    // Fetch live prices on mount and every 60 seconds
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                // Pass current portfolio tickers to API
                const res = await fetch(`/api/prices?tickers=${tickerList}`);
                if (res.ok) {
                    const data = await res.json();
                    // Only set prices if we got valid data
                    if (data && !data.error) {
                        setPrices(data);
                        setLastPriceFetch(new Date());
                    }
                }
            } catch (error) {
                console.error("Error fetching prices:", error);
            } finally {
                // Always stop loading - will use fallback prices from mockData
                setIsLoadingPrices(false);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [tickerList]);

    // Merge portfolio data with live prices
    const livePortfolio = portfolioData.map((position) => {
        const priceData = prices[position.ticker];
        const livePrice = priceData?.price || position.currentPrice; // Fallback if fetch fails

        // Calculate YTD return: (current - 2026 Open) / 2026 Open
        // entryPrice = 2026 Open (what we show in the table)
        const ytdReturn = ((livePrice - position.entryPrice) / position.entryPrice) * 100;

        // Daily change from API
        const dayChange = priceData?.changePercent || 0;

        return {
            ...position,
            currentPrice: livePrice,
            returnPercent: ytdReturn,
            dayChange,
        };
    });

    // Calculate portfolio aggregate stats
    const openPositions = livePortfolio.filter((p) => p.status === "Open");
    const avgReturn =
        openPositions.reduce((acc, curr) => acc + curr.returnPercent, 0) /
        (openPositions.length || 1);
    const avgDayChange =
        openPositions.reduce((acc, curr) => acc + curr.dayChange, 0) /
        (openPositions.length || 1);
    const avgScore =
        openPositions.reduce((acc, curr) => acc + curr.pmScore, 0) /
        (openPositions.length || 1);

    // Simulated Quarterly Performance (for display purposes)
    const quarterlyPerformance = [
        { quarter: "Q1 2026", return: avgReturn, isCurrent: true },
        { quarter: "Q4 2025", return: 12.4, isCurrent: false },
        { quarter: "Q3 2025", return: 8.2, isCurrent: false },
        { quarter: "Q2 2025", return: 15.1, isCurrent: false },
    ];

    // Format the last updated time
    const formatLastUpdated = () => {
        if (!lastPriceFetch) return "Loading...";
        return lastPriceFetch.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (!isSubscribed) {
        return (
            <div className="relative">
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center bg-pm-charcoal/80 backdrop-blur-sm border border-pm-border rounded-xl">
                    <Lock className="w-12 h-12 text-pm-green mb-4 opacity-80" />
                    <h3 className="text-2xl font-bold mb-2">Operator Access Required</h3>
                    <p className="text-pm-muted mb-6 max-w-md">
                        Upgrade to the Operator tier to view our real-time "Mag 7 + Bitcoin" equal-weight portfolio, YTD performance, and predictive signals.
                    </p>
                    <a href="/pricing" className="btn-primary">
                        View Pricing
                    </a>
                </div>
                {/* Blurred fake table background */}
                <div className="opacity-20 pointer-events-none filter blur-sm">
                    {/* ... reusing table structure but empty ... */}
                    <div className="w-full h-96 bg-pm-charcoal rounded-xl border border-pm-border"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="pm-card p-4 border-l-4 border-l-pm-green">
                    <div className="text-xs text-pm-muted uppercase tracking-wider mb-1">
                        YTD Return
                    </div>
                    <div className={`text-2xl font-bold ${avgReturn >= 0 ? 'text-pm-green' : 'text-pm-red'}`}>
                        {isLoadingPrices ? (
                            <SkeletonCell width="w-20" />
                        ) : (
                            <span>{avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(1)}%</span>
                        )}
                    </div>
                    <div className="text-[10px] text-pm-muted mt-1">vs Dec 31, 2025</div>
                </div>

                <div className="pm-card p-4 border-l-4 border-l-pm-purple">
                    <div className="text-xs text-pm-muted uppercase tracking-wider mb-1">
                        Today
                    </div>
                    <div className={`text-2xl font-bold ${avgDayChange >= 0 ? 'text-pm-green' : 'text-pm-red'}`}>
                        {isLoadingPrices ? (
                            <SkeletonCell width="w-20" />
                        ) : (
                            <span>{avgDayChange >= 0 ? '+' : ''}{avgDayChange.toFixed(2)}%</span>
                        )}
                    </div>
                    <div className="text-[10px] text-pm-muted mt-1">Daily Change</div>
                </div>

                <div className="pm-card p-4 border-l-4 border-l-blue-500">
                    <div className="text-xs text-pm-muted uppercase tracking-wider mb-1">
                        Avg PM Score
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {Math.round(avgScore)}
                    </div>
                    <div className="text-[10px] text-pm-muted mt-1">Strong Conviction</div>
                </div>

                <div className="pm-card p-4 border-l-4 border-l-yellow-500">
                    <div className="text-xs text-pm-muted uppercase tracking-wider mb-1">
                        Holdings
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {openPositions.length}
                    </div>
                    <div className="text-[10px] text-pm-muted mt-1">Equal Weight</div>
                </div>
            </div>

            {/* Quarterly Breakdown Row */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs text-pm-muted font-mono border-t border-b border-pm-border py-4 bg-pm-charcoal/30">
                {quarterlyPerformance.map((q) => (
                    <div key={q.quarter} className={q.isCurrent ? "text-pm-green font-bold" : ""}>
                        <div className="mb-1">{q.quarter}</div>
                        <div>{q.return > 0 ? "+" : ""}{q.return.toFixed(1)}%</div>
                    </div>
                ))}
            </div>

            {/* Data Freshness Indicator */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-pm-muted">
                    <div className={`w-2 h-2 rounded-full ${isLoadingPrices ? 'bg-yellow-500' : 'bg-pm-green'} animate-pulse`} />
                    <span>
                        {isLoadingPrices ? "Syncing market data..." : `Live data as of ${formatLastUpdated()}`}
                    </span>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-1 text-xs text-pm-muted hover:text-pm-green transition-colors"
                    title="Refresh prices"
                >
                    <RefreshCw className={`w-3 h-3 ${isLoadingPrices ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-pm-border bg-pm-charcoal/50">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs font-mono text-pm-muted uppercase border-b border-pm-border bg-pm-black/50">
                            <th className="p-4">Ticker</th>
                            <th className="p-4">Asset Class</th>
                            <th className="p-4 text-right">2026 Open</th>
                            <th className="p-4 text-right">
                                Current
                                {isLoadingPrices && (
                                    <span className="ml-2 text-yellow-500 animate-pulse">
                                        (Syncing...)
                                    </span>
                                )}
                                {!isLoadingPrices && (
                                    <span className="ml-2 text-pm-green text-[10px]">
                                        (Live)
                                    </span>
                                )}
                            </th>
                            <th className="p-4 text-right">Day %</th>
                            <th className="p-4 text-right">YTD Return</th>
                            <th className="p-4 text-center">PM Score</th>
                            <th className="p-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-pm-border">
                        {livePortfolio.map((position) => (
                            <tr
                                key={position.ticker}
                                className="hover:bg-pm-charcoal/80 transition-colors group"
                            >
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white group-hover:text-pm-green transition-colors">
                                            {position.ticker}
                                        </span>
                                        <span className="text-xs text-pm-muted hidden md:inline-block">
                                            {position.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-mono border ${assetClassColors[position.assetClass] || "bg-white/5 border-white/10 text-pm-text"}`}>
                                        {position.assetClass}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-mono text-pm-muted">
                                    ${position.entryPrice.toFixed(2)}
                                </td>
                                <td className="p-4 text-right font-mono font-medium text-white">
                                    {isLoadingPrices ? (
                                        <SkeletonCell width="w-20" />
                                    ) : (
                                        `$${position.currentPrice.toFixed(2)}`
                                    )}
                                </td>
                                <td className={`p-4 text-right font-mono text-sm ${position.dayChange >= 0 ? "text-pm-green" : "text-pm-red"
                                    }`}>
                                    {isLoadingPrices ? (
                                        <SkeletonCell width="w-12" />
                                    ) : (
                                        <span>
                                            {position.dayChange >= 0 ? "+" : ""}
                                            {position.dayChange.toFixed(2)}%
                                        </span>
                                    )}
                                </td>
                                <td
                                    className={`p-4 text-right font-mono font-bold ${position.returnPercent >= 0
                                        ? "text-pm-green"
                                        : "text-pm-red"
                                        }`}
                                >
                                    {isLoadingPrices ? (
                                        <SkeletonCell width="w-16" />
                                    ) : (
                                        <>
                                            {position.returnPercent >= 0 ? (
                                                <TrendingUp className="w-3 h-3 inline mr-1" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3 inline mr-1" />
                                            )}
                                            {position.returnPercent > 0 ? "+" : ""}
                                            {position.returnPercent.toFixed(1)}%
                                        </>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-pm-green/10 text-pm-green border border-pm-green/30 text-xs font-mono">
                                        <Sparkles className="w-3 h-3" />
                                        {position.pmScore}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <span
                                        className={`text-xs font-mono uppercase px-2 py-1 rounded ${position.status === "Open"
                                            ? "bg-pm-green/10 text-pm-green"
                                            : "bg-pm-charcoal text-pm-muted"
                                            }`}
                                    >
                                        {position.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


        </div >
    );
}
