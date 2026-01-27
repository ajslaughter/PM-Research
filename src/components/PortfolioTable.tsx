"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAdmin } from "@/context/AdminContext";
import { assetClassColors } from "@/data/stockDatabase";
import { calculateYTD, calculateWeightedYTD, calculateWeightedDayChange, calculateAvgPmScore } from "@/services/stockService";
import {
    Lock,
    TrendingUp,
    TrendingDown,
    Sparkles,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

// API response type
interface PriceData {
    price: number | null;
    change: number;
    changePercent: number;
    isLive: boolean;
}

interface PriceApiResponse {
    prices: Record<string, PriceData>;
    marketOpen: boolean;
    timestamp: string;
}

// Props for the component
interface PortfolioTableProps {
    portfolioId: string;
    portfolioName: string;
}

// Skeleton loader component
const SkeletonCell = ({ width = "w-16" }: { width?: string }) => (
    <div className={`h-4 ${width} bg-pm-charcoal animate-pulse rounded`} />
);

export default function PortfolioTable({ portfolioId, portfolioName }: PortfolioTableProps) {
    const { isSubscribed } = useSubscription();
    const { portfolios, stockDb } = useAdmin();

    const [prices, setPrices] = useState<Record<string, PriceData>>({});
    const [marketOpen, setMarketOpen] = useState(false);
    const [staleTickers, setStaleTickers] = useState<Set<string>>(new Set());
    const [isLoadingPrices, setIsLoadingPrices] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastPriceFetch, setLastPriceFetch] = useState<Date | null>(null);

    // Get current portfolio
    const currentPortfolio = useMemo(() => {
        return portfolios.find((p) => p.id === portfolioId);
    }, [portfolios, portfolioId]);

    // Get positions from current portfolio
    const positions = currentPortfolio?.positions || [];

    // Build ticker list dynamically from current portfolio
    const tickerList = useMemo(() => {
        return positions.map((p) => p.ticker).join(',');
    }, [positions]);

    // Fetch prices function
    const fetchPrices = useCallback(async (forceRefresh = false) => {
        if (!tickerList) {
            setIsLoadingPrices(false);
            return;
        }

        if (forceRefresh) {
            setIsRefreshing(true);
        }
        try {
            const url = `/api/prices?tickers=${tickerList}${forceRefresh ? '&refresh=true' : ''}`;
            const res = await fetch(url);
            if (res.ok) {
                const data: PriceApiResponse = await res.json();
                if (data && data.prices && !('error' in data)) {
                    const newStaleTickers = new Set<string>();

                    for (const [ticker, priceData] of Object.entries(data.prices)) {
                        if (priceData.price === null) {
                            newStaleTickers.add(ticker);
                        }
                    }

                    setPrices(data.prices);
                    setMarketOpen(data.marketOpen);
                    setStaleTickers(newStaleTickers);
                    setLastPriceFetch(new Date(data.timestamp));
                }
            }
        } catch (error) {
            console.error("Error fetching prices:", error);
        } finally {
            setIsLoadingPrices(false);
            setIsRefreshing(false);
        }
    }, [tickerList]);

    // Fetch live prices on mount and poll based on market status
    useEffect(() => {
        setIsLoadingPrices(true);
        fetchPrices();
        const interval = setInterval(
            () => fetchPrices(),
            marketOpen ? 30000 : 300000
        );
        return () => clearInterval(interval);
    }, [fetchPrices, marketOpen]);

    // Handle refresh button click
    const handleRefresh = useCallback(() => {
        fetchPrices(true);
    }, [fetchPrices]);

    // Merge portfolio data with stock database and live prices
    const livePortfolio = positions.map((position) => {
        const stock = stockDb[position.ticker.toUpperCase()];
        const liveData = prices[position.ticker];
        const isStale = staleTickers.has(position.ticker);
        const currentPrice = liveData?.price ?? 0;
        const yearlyOpen = stock?.yearlyOpen ?? 0;

        // Calculate YTD return using stock database yearlyOpen
        const ytdReturn = yearlyOpen > 0 && currentPrice > 0
            ? calculateYTD(currentPrice, yearlyOpen)
            : 0;

        // Use daily change from API
        const dayChange = liveData?.changePercent ?? 0;

        return {
            ticker: position.ticker,
            name: stock?.name || position.ticker,
            assetClass: stock?.assetClass || 'Unknown',
            weight: position.weight,
            yearlyOpen,
            currentPrice,
            returnPercent: ytdReturn,
            dayChange,
            pmScore: stock?.pmScore || 0,
            isStale,
            isLive: liveData?.isLive ?? false,
        };
    });

    // Calculate portfolio aggregate stats using weighted calculations
    const weightedYTD = calculateWeightedYTD(positions, prices, stockDb);
    const weightedDayChange = calculateWeightedDayChange(positions, prices);
    const avgPmScore = calculateAvgPmScore(positions, stockDb);
    const totalWeight = positions.reduce((acc, p) => acc + p.weight, 0);

    // Corrected Quarterly Performance for 2025
    const quarterlyPerformance = [
        { quarter: "Q1 2026", return: weightedYTD, isCurrent: true },
        { quarter: "Q4 2025", return: 14.2, isCurrent: false },
        { quarter: "Q3 2025", return: 9.1, isCurrent: false },
        { quarter: "Q2 2025", return: 18.5, isCurrent: false },
        { quarter: "Q1 2025", return: 11.2, isCurrent: false },
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
                        Upgrade to the Operator tier to view our real-time portfolio, YTD performance, and predictive signals.
                    </p>
                    <a href="/pricing" className="btn-primary">
                        View Pricing
                    </a>
                </div>
                <div className="opacity-20 pointer-events-none filter blur-sm">
                    <div className="w-full h-96 bg-pm-charcoal rounded-xl border border-pm-border"></div>
                </div>
            </div>
        );
    }

    if (!currentPortfolio) {
        return (
            <div className="pm-card p-8 text-center">
                <p className="text-pm-muted">Portfolio not found</p>
            </div>
        );
    }

    if (positions.length === 0) {
        return (
            <div className="pm-card p-8 text-center">
                <p className="text-pm-muted">No positions in this portfolio. Use the admin panel to add positions.</p>
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
                    <div className={`text-2xl font-bold ${weightedYTD >= 0 ? 'text-pm-green' : 'text-pm-red'}`}>
                        {isLoadingPrices ? (
                            <SkeletonCell width="w-20" />
                        ) : (
                            <span>{weightedYTD >= 0 ? '+' : ''}{weightedYTD.toFixed(1)}%</span>
                        )}
                    </div>
                    <div className="text-[10px] text-pm-muted mt-1">vs Jan 2, 2026</div>
                </div>

                <div className="pm-card p-4 border-l-4 border-l-pm-purple">
                    <div className="text-xs text-pm-muted uppercase tracking-wider mb-1">
                        Today
                    </div>
                    <div className={`text-2xl font-bold ${weightedDayChange >= 0 ? 'text-pm-green' : 'text-pm-red'}`}>
                        {isLoadingPrices ? (
                            <SkeletonCell width="w-20" />
                        ) : (
                            <span>{weightedDayChange >= 0 ? '+' : ''}{weightedDayChange.toFixed(2)}%</span>
                        )}
                    </div>
                    <div className="text-[10px] text-pm-muted mt-1">Weighted Daily</div>
                </div>

                <div className="pm-card p-4 border-l-4 border-l-blue-500">
                    <div className="text-xs text-pm-muted uppercase tracking-wider mb-1">
                        Avg PM Score
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {Math.round(avgPmScore)}
                    </div>
                    <div className="text-[10px] text-pm-muted mt-1">Strong Conviction</div>
                </div>

                <div className="pm-card p-4 border-l-4 border-l-yellow-500">
                    <div className="text-xs text-pm-muted uppercase tracking-wider mb-1">
                        Holdings
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {positions.length}
                    </div>
                    <div className="text-[10px] text-pm-muted mt-1">
                        {totalWeight === 100 ? 'Fully Allocated' : `${totalWeight.toFixed(1)}% Allocated`}
                    </div>
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
                <div className="flex items-center gap-4 text-xs text-pm-muted">
                    {/* Market Status */}
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${marketOpen ? 'bg-pm-green animate-pulse' : 'bg-gray-500'}`} />
                        <span className="text-gray-400">
                            {marketOpen ? 'Market Open' : 'Market Closed'}
                        </span>
                    </div>
                    {/* Data Status */}
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isLoadingPrices || isRefreshing ? 'bg-yellow-500' : staleTickers.size > 0 ? 'bg-orange-500' : 'bg-pm-green'} animate-pulse`} />
                        <span>
                            {isLoadingPrices || isRefreshing ? "Syncing..." : staleTickers.size > 0 ? `${staleTickers.size} stale` : "Live"}
                        </span>
                    </div>
                    {/* Last Update */}
                    {lastPriceFetch && (
                        <span className="text-gray-500">
                            Updated: {formatLastUpdated()}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isLoadingPrices || isRefreshing}
                    className="flex items-center gap-1 text-xs text-pm-muted hover:text-pm-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh prices"
                >
                    <RefreshCw className={`w-3 h-3 ${isLoadingPrices || isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-pm-border bg-pm-charcoal/50">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs font-mono text-pm-muted uppercase border-b border-pm-border bg-pm-black/50">
                            <th className="p-4">Ticker</th>
                            <th className="p-4">Asset Class</th>
                            <th className="p-4 text-right">Weight</th>
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
                                    {position.weight.toFixed(1)}%
                                </td>
                                <td className="p-4 text-right font-mono text-pm-muted">
                                    ${position.yearlyOpen.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="p-4 text-right font-mono font-medium">
                                    {isLoadingPrices ? (
                                        <SkeletonCell width="w-20" />
                                    ) : (
                                        <span className={`inline-flex items-center gap-1 ${position.isLive ? 'text-white' : 'text-gray-400'}`}>
                                            ${position.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            {position.isStale && (
                                                <span title="Price unavailable - using cached data" className="text-orange-400">
                                                    <AlertCircle className="w-3 h-3" />
                                                </span>
                                            )}
                                            {!position.isLive && !position.isStale && (
                                                <span className="text-xs text-yellow-500" title="Cached price">●</span>
                                            )}
                                        </span>
                                    )}
                                </td>
                                <td className={`p-4 text-right font-mono text-sm ${position.isStale ? "text-pm-muted" : position.dayChange >= 0 ? "text-pm-green" : "text-pm-red"
                                    }`}>
                                    {isLoadingPrices ? (
                                        <SkeletonCell width="w-12" />
                                    ) : position.isStale ? (
                                        <span className="text-pm-muted">--</span>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
