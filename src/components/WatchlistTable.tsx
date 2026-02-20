"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAdmin } from "@/context/AdminContext";
import { calculateYTD, calculateWeightedYTD, calculateWeightedDayChange, calculateAvgPmScore, getPmScoreCategory } from "@/services/stockService";
import { getYTDBaselineDisplayString, YTD_OPEN_YEAR } from "@/lib/dateUtils";
import { WatchlistCategory, watchlistQuarterlyReturns } from "@/lib/watchlists";
import SectorBadge from "@/components/SectorBadge";
import {
    TrendingUp,
    TrendingDown,
    RefreshCw,
    AlertCircle,
    Filter,
} from "lucide-react";

// API timeout in milliseconds
const API_TIMEOUT = 10000;

// API response type
interface PriceData {
    price: number | null;
    change: number;
    changePercent: number;
    marketCap: number | null;
    isLive: boolean;
}

interface PriceApiResponse {
    prices: Record<string, PriceData>;
    marketOpen: boolean;
    timestamp: string;
}

// Available categories for filtering
const WATCHLIST_CATEGORIES: WatchlistCategory[] = [
    'Magnificent 7',
    'AI Infrastructure',
    'Energy Renaissance',
    'Orbital & Space',
    'Defense & Intelligence',
];

// Props for the component
interface WatchlistTableProps {
    watchlistId: string;
    watchlistName: string;
    category?: WatchlistCategory;
    onCategoryChange?: (category: WatchlistCategory) => void;
    showCategoryFilter?: boolean;
}

const SkeletonCell = ({ width = "w-16" }: { width?: string }) => (
    <div className={`h-4 ${width} bg-pm-charcoal animate-pulse rounded`} />
);

const LoadingSpinner = ({ size = "w-4 h-4" }: { size?: string }) => (
    <div className={`${size} border-2 border-pm-green/30 border-t-pm-green rounded-full animate-spin`} />
);

const SkeletonKPI = () => (
    <div className="flex flex-col gap-2">
        <div className="h-8 w-24 bg-pm-charcoal animate-pulse rounded" />
    </div>
);

const formatPercent = (value: number): string => {
    const rounded = Math.round(value * 100) / 100;
    return rounded.toFixed(2);
};

const formatMarketCap = (value: number | null): string => {
    if (!value || value <= 0) return '--';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${value.toLocaleString()}`;
};

export default function WatchlistTable({
    watchlistId,
    watchlistName,
    category,
    onCategoryChange,
    showCategoryFilter = false
}: WatchlistTableProps) {
    const { watchlists, stockDb } = useAdmin();

    // Internal category state if not controlled externally
    const [internalCategory, setInternalCategory] = useState<WatchlistCategory>(category || 'Magnificent 7');
    const activeCategory = category ?? internalCategory;

    const handleCategoryChange = useCallback((newCategory: WatchlistCategory) => {
        if (onCategoryChange) {
            onCategoryChange(newCategory);
        } else {
            setInternalCategory(newCategory);
        }
    }, [onCategoryChange]);

    const [activePopupTicker, setActivePopupTicker] = useState<string | null>(null);

    const [prices, setPrices] = useState<Record<string, PriceData>>({});
    const [marketOpen, setMarketOpen] = useState(false);
    const [staleTickers, setStaleTickers] = useState<Set<string>>(new Set());
    const [isLoadingPrices, setIsLoadingPrices] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastPriceFetch, setLastPriceFetch] = useState<Date | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Refs for cleanup
    const abortControllerRef = useRef<AbortController | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);
    const popupRef = useRef<HTMLDivElement | null>(null);

    // Get watchlists filtered by category
    const filteredWatchlists = useMemo(() => {
        if (!showCategoryFilter) return watchlists;
        return watchlists.filter((p) => p.category === activeCategory);
    }, [watchlists, activeCategory, showCategoryFilter]);

    // Get current watchlist (respecting category filter)
    const currentWatchlist = useMemo(() => {
        if (showCategoryFilter && filteredWatchlists.length > 0) {
            // When filtering, use the first watchlist in the filtered list if current doesn't match
            const found = filteredWatchlists.find((p) => p.id === watchlistId);
            return found || filteredWatchlists[0];
        }
        return watchlists.find((p) => p.id === watchlistId);
    }, [watchlists, filteredWatchlists, watchlistId, showCategoryFilter]);

    // Get positions from current watchlist
    const positions = currentWatchlist?.positions || [];

    // Build ticker list dynamically from current watchlist
    const tickerList = useMemo(() => {
        return positions.map((p) => p.ticker).join(',');
    }, [positions]);

    // Fetch prices function with AbortController and timeout
    const fetchPrices = useCallback(async (forceRefresh = false) => {
        if (!tickerList) {
            setIsLoadingPrices(false);
            return;
        }

        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new AbortController
        abortControllerRef.current = new AbortController();

        if (forceRefresh) {
            setIsRefreshing(true);
        }

        setFetchError(null);

        try {
            const url = `/api/prices?tickers=${tickerList}&ts=${Date.now()}`;

            // Create timeout promise
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), API_TIMEOUT);
            });

            // Race between fetch and timeout
            const res = await Promise.race([
                fetch(url, {
                    cache: 'no-store',
                    signal: abortControllerRef.current.signal,
                }),
                timeoutPromise,
            ]);

            // Check if component is still mounted
            if (!isMountedRef.current) return;

            if (res.ok) {
                const data: PriceApiResponse = await res.json();

                // Check again after async operation
                if (!isMountedRef.current) return;

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
                    setFetchError(null);
                }
            } else {
                setFetchError('Failed to fetch prices');
            }
        } catch (error) {
            // Check if component is still mounted
            if (!isMountedRef.current) return;

            // Ignore abort errors
            if (error instanceof Error && error.name === 'AbortError') {
                return;
            }

            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch prices';
            setFetchError(errorMessage);
            console.error("Error fetching prices:", error);
        } finally {
            if (isMountedRef.current) {
                setIsLoadingPrices(false);
                setIsRefreshing(false);
            }
        }
    }, [tickerList]);

    // Fetch live prices on mount and poll based on market status
    useEffect(() => {
        isMountedRef.current = true;
        setIsLoadingPrices(true);

        // Initial fetch
        fetchPrices();

        // Setup polling interval
        const pollInterval = marketOpen ? 30000 : 300000;
        intervalRef.current = setInterval(() => {
            fetchPrices();
        }, pollInterval);

        // Cleanup function
        return () => {
            isMountedRef.current = false;

            // Cancel any pending request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Clear polling interval
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [fetchPrices, marketOpen]);

    // Handle refresh button click
    const handleRefresh = useCallback(() => {
        fetchPrices(true);
    }, [fetchPrices]);

    // Merge watchlist data with stock database and live prices
    const liveWatchlist = positions.map((position) => {
        const stock = stockDb[position.ticker.toUpperCase()];
        const liveData = prices[position.ticker];
        const isStale = staleTickers.has(position.ticker);
        const currentPrice = liveData?.price ?? 0;
        const yearlyClose = stock?.yearlyClose ?? 0;

        // Calculate YTD return using stock database yearlyClose
        const ytdReturn = yearlyClose > 0 && currentPrice > 0
            ? calculateYTD(currentPrice, yearlyClose)
            : 0;

        // Use daily change from API
        const dayChange = liveData?.changePercent ?? 0;

        return {
            ticker: position.ticker,
            name: stock?.name || position.ticker,
            assetClass: stock?.assetClass || 'Unknown',
            weight: position.weight,
            thesis: position.thesis,
            yearlyClose,
            currentPrice,
            returnPercent: ytdReturn,
            dayChange,
            marketCap: liveData?.marketCap ?? null,
            pmScore: stock?.pmScore || 0,
            isStale,
            isLive: liveData?.isLive ?? false,
        };
    });

    // Calculate watchlist aggregate stats using weighted calculations
    const weightedYTD = calculateWeightedYTD(positions, prices, stockDb);
    const weightedDayChange = calculateWeightedDayChange(positions, prices);
    const avgPmScore = calculateAvgPmScore(positions, stockDb);
    const totalWeight = positions.reduce((acc, p) => acc + p.weight, 0);

    // Quarterly Performance - historical returns are per-watchlist
    const historicalReturns = currentWatchlist ? watchlistQuarterlyReturns[currentWatchlist.id] : undefined;
    const quarterlyPerformance = [
        { quarter: "Q1 2026", return: weightedYTD, isCurrent: true },
        ...(historicalReturns || []).map((q) => ({
            quarter: q.quarter,
            return: q.return,
            isCurrent: false,
        })),
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

    // Close popup on click outside
    useEffect(() => {
        if (!activePopupTicker) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setActivePopupTicker(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activePopupTicker]);

    if (!currentWatchlist) {
        return (
            <div className="pm-card p-8 text-center">
                <p className="text-pm-muted">Watchlist not found</p>
            </div>
        );
    }

    if (positions.length === 0) {
        return (
            <div className="pm-card p-8 text-center">
                <p className="text-pm-muted">No positions in this watchlist. Use the admin panel to add positions.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Category Filter */}
            {showCategoryFilter && (
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-pm-muted">
                        <Filter className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider">Category:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {WATCHLIST_CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                    activeCategory === cat
                                        ? 'bg-pm-green text-pm-black'
                                        : 'bg-pm-charcoal text-pm-muted hover:bg-pm-charcoal/80 hover:text-white border border-pm-border'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Watchlist Name (when category filter is active) */}
            {showCategoryFilter && currentWatchlist && (
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">{currentWatchlist.name}</h2>
                        <p className="text-sm text-pm-muted">{currentWatchlist.description}</p>
                    </div>
                    {filteredWatchlists.length > 1 && (
                        <div className="flex gap-2">
                            {filteredWatchlists.map((p) => (
                                <span
                                    key={p.id}
                                    className={`px-2 py-1 text-xs rounded ${
                                        p.id === currentWatchlist.id
                                            ? 'bg-pm-green/20 text-pm-green'
                                            : 'bg-pm-charcoal text-pm-muted'
                                    }`}
                                >
                                    {p.name.split(' ')[0]}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="pm-card p-4 border-l-4 border-l-pm-green">
                    <div className="text-xs text-pm-muted uppercase tracking-wider mb-1">
                        YTD Return
                    </div>
                    <div className={`text-2xl font-bold ${weightedYTD >= 0 ? 'text-pm-green' : 'text-pm-red'}`}>
                        {isLoadingPrices ? (
                            <div className="flex items-center gap-2">
                                <LoadingSpinner size="w-5 h-5" />
                                <SkeletonKPI />
                            </div>
                        ) : (
                            <span>{weightedYTD >= 0 ? '+' : ''}{formatPercent(weightedYTD)}%</span>
                        )}
                    </div>
                    <div className="text-[10px] text-pm-muted mt-1">{getYTDBaselineDisplayString()}</div>
                </div>

                <div className="pm-card p-4 border-l-4 border-l-pm-purple">
                    <div className="text-xs text-pm-muted uppercase tracking-wider mb-1">
                        Today
                    </div>
                    <div className={`text-2xl font-bold ${weightedDayChange >= 0 ? 'text-pm-green' : 'text-pm-red'}`}>
                        {isLoadingPrices ? (
                            <div className="flex items-center gap-2">
                                <LoadingSpinner size="w-5 h-5" />
                                <SkeletonKPI />
                            </div>
                        ) : (
                            <span>{weightedDayChange >= 0 ? '+' : ''}{formatPercent(weightedDayChange)}%</span>
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
                    <div className="text-[10px] text-pm-muted mt-1">{getPmScoreCategory(avgPmScore)}</div>
                </div>

                <div className="pm-card p-4 border-l-4 border-l-yellow-500">
                    <div className="text-xs text-pm-muted uppercase tracking-wider mb-1">
                        Holdings
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {positions.length}
                    </div>
                    <div className="text-[10px] text-pm-muted mt-1">
                        {totalWeight === 100 ? 'Total' : `${formatPercent(totalWeight)}% Allocated`}
                    </div>
                </div>
            </div>

            {/* Quarterly Breakdown Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs text-pm-muted font-mono border-t border-b border-pm-border py-4 bg-pm-charcoal/30">
                {quarterlyPerformance.map((q) => (
                    <div key={q.quarter} className={q.isCurrent ? "text-pm-green font-bold" : ""}>
                        <div className="mb-1">{q.quarter}</div>
                        {q.isCurrent && isLoadingPrices ? (
                            <div className="flex justify-center">
                                <LoadingSpinner size="w-3 h-3" />
                            </div>
                        ) : (
                            <div>{q.return > 0 ? "+" : ""}{formatPercent(q.return)}%</div>
                        )}
                    </div>
                ))}
            </div>

            {/* Data Freshness Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3 sm:gap-4 text-xs text-pm-muted flex-wrap">
                    {/* Market Status */}
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${marketOpen ? 'bg-pm-green animate-pulse' : 'bg-gray-500'}`} />
                        <span className="text-gray-400">
                            {marketOpen ? 'Market Open' : 'Market Closed'}
                        </span>
                    </div>
                    {/* Data Status */}
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                            fetchError ? 'bg-red-500' :
                            isLoadingPrices || isRefreshing ? 'bg-yellow-500' :
                            staleTickers.size > 0 ? 'bg-orange-500' : 'bg-pm-green'
                        } animate-pulse`} />
                        <span>
                            {fetchError ? "Data unavailable" :
                             isLoadingPrices || isRefreshing ? "Syncing..." :
                             staleTickers.size > 0 ? `${staleTickers.size} stale` : "Live"}
                        </span>
                    </div>
                    {/* Last Update */}
                    {lastPriceFetch && (
                        <span className="text-gray-500 hidden sm:inline">
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {liveWatchlist.map((position) => (
                    <div
                        key={position.ticker}
                        className="rounded-xl border border-pm-border bg-pm-charcoal/50 p-4"
                    >
                        {/* Row 1: Ticker + YTD Return */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setActivePopupTicker(activePopupTicker === position.ticker ? null : position.ticker)}
                                    className="text-left"
                                >
                                    <span className="font-bold text-white text-base">
                                        {position.ticker}
                                    </span>
                                    <span className="text-xs text-pm-muted block mt-0.5">
                                        {position.name}
                                    </span>
                                </button>
                                {activePopupTicker === position.ticker && (
                                    <div
                                        ref={popupRef}
                                        className="absolute top-full left-0 mt-1 z-50 bg-pm-black border border-pm-border rounded-lg shadow-lg shadow-black/50 px-4 py-3 whitespace-nowrap"
                                    >
                                        <div className="text-[10px] text-pm-muted uppercase tracking-wider mb-1">Market Cap</div>
                                        <div className="text-sm font-mono font-semibold text-white">
                                            {isLoadingPrices ? (
                                                <SkeletonCell width="w-16" />
                                            ) : (
                                                formatMarketCap(position.marketCap)
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className={`text-right font-mono font-bold ${position.returnPercent >= 0 ? "text-pm-green" : "text-pm-red"}`}>
                                {isLoadingPrices ? (
                                    <SkeletonCell width="w-16" />
                                ) : (
                                    <span className="flex items-center gap-1">
                                        {position.returnPercent >= 0 ? (
                                            <TrendingUp className="w-3 h-3" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3" />
                                        )}
                                        {position.returnPercent > 0 ? "+" : ""}
                                        {formatPercent(position.returnPercent)}%
                                    </span>
                                )}
                                <span className="text-[10px] text-pm-muted font-normal block">YTD</span>
                            </div>
                        </div>

                        {/* Row 2: Sector + Weight */}
                        <div className="flex items-center justify-between mb-3">
                            <SectorBadge sector={position.assetClass} size="sm" interactive={false} />
                            <span className="text-xs font-mono text-pm-muted">{formatPercent(position.weight)}% weight</span>
                        </div>

                        {/* Row 3: Price stats */}
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-pm-border/50">
                            <div>
                                <div className="text-[10px] text-pm-muted uppercase mb-0.5">{YTD_OPEN_YEAR} Open</div>
                                <div className="text-xs font-mono text-pm-muted">
                                    ${position.yearlyClose.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] text-pm-muted uppercase mb-0.5">Current</div>
                                {isLoadingPrices ? (
                                    <SkeletonCell width="w-14" />
                                ) : (
                                    <div className={`text-xs font-mono font-medium ${position.isLive ? 'text-white' : 'text-gray-400'}`}>
                                        ${position.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-pm-muted uppercase mb-0.5">Day</div>
                                {isLoadingPrices ? (
                                    <SkeletonCell width="w-10" />
                                ) : position.isStale ? (
                                    <span className="text-xs text-pm-muted">--</span>
                                ) : (
                                    <span className={`text-xs font-mono ${position.dayChange >= 0 ? "text-pm-green" : "text-pm-red"}`}>
                                        {position.dayChange >= 0 ? "+" : ""}
                                        {formatPercent(position.dayChange)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-pm-border bg-pm-charcoal/50">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="text-xs font-mono text-pm-muted uppercase border-b border-pm-border bg-pm-black/50">
                            <th className="p-4 sticky left-0 bg-pm-black/90 z-10">Ticker</th>
                            <th className="p-4">Asset Class</th>
                            <th className="p-4 text-right">Weight</th>
                            <th className="p-4 text-right">{YTD_OPEN_YEAR} Open</th>
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
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-pm-border">
                        {liveWatchlist.map((position) => (
                            <tr
                                key={position.ticker}
                                className="hover:bg-pm-charcoal/80 transition-colors group"
                            >
                                <td className="p-4 sticky left-0 bg-pm-dark/95 z-10">
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setActivePopupTicker(activePopupTicker === position.ticker ? null : position.ticker)}
                                            className="flex flex-col text-left cursor-pointer"
                                        >
                                            <span className="font-bold text-white group-hover:text-pm-green transition-colors">
                                                {position.ticker}
                                            </span>
                                            <span className="text-xs text-pm-muted">
                                                {position.name}
                                            </span>
                                        </button>
                                        {activePopupTicker === position.ticker && (
                                            <div
                                                ref={popupRef}
                                                className="absolute top-full left-0 mt-1 z-50 bg-pm-black border border-pm-border rounded-lg shadow-lg shadow-black/50 px-4 py-3 whitespace-nowrap"
                                            >
                                                <div className="text-[10px] text-pm-muted uppercase tracking-wider mb-1">Market Cap</div>
                                                <div className="text-sm font-mono font-semibold text-white">
                                                    {isLoadingPrices ? (
                                                        <SkeletonCell width="w-16" />
                                                    ) : (
                                                        formatMarketCap(position.marketCap)
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <SectorBadge
                                        sector={position.assetClass}
                                        size="sm"
                                        interactive={false}
                                    />
                                </td>
                                <td className="p-4 text-right font-mono text-pm-muted">
                                    {formatPercent(position.weight)}%
                                </td>
                                <td className="p-4 text-right font-mono text-pm-muted">
                                    ${position.yearlyClose.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="p-4 text-right font-mono font-medium">
                                    {isLoadingPrices ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <LoadingSpinner size="w-3 h-3" />
                                            <SkeletonCell width="w-20" />
                                        </div>
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
                                        <div className="flex items-center justify-end gap-2">
                                            <LoadingSpinner size="w-3 h-3" />
                                            <SkeletonCell width="w-12" />
                                        </div>
                                    ) : position.isStale ? (
                                        <span className="text-pm-muted">--</span>
                                    ) : (
                                        <span>
                                            {position.dayChange >= 0 ? "+" : ""}
                                            {formatPercent(position.dayChange)}%
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
                                        <div className="flex items-center justify-end gap-2">
                                            <LoadingSpinner size="w-3 h-3" />
                                            <SkeletonCell width="w-16" />
                                        </div>
                                    ) : (
                                        <>
                                            {position.returnPercent >= 0 ? (
                                                <TrendingUp className="w-3 h-3 inline mr-1" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3 inline mr-1" />
                                            )}
                                            {position.returnPercent > 0 ? "+" : ""}
                                            {formatPercent(position.returnPercent)}%
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
