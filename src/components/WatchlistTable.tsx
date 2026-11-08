"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAdmin } from "@/context/AdminContext";
import {
    calculateYTD,
    calculateWeightedYTD,
    calculateWeightedDayChange,
    calculateAvgPmScore,
    calculateQuarterlyReturns,
    getPmScoreCategory,
} from "@/services/stockService";
import { getYTDBaselineDisplayString } from "@/lib/dateUtils";
import { BASELINE_DATE, TRACKING_YEAR } from "@/data/baselines";
import { directionClass, formatMarketCap, formatNoteDate, formatPct, formatPrice } from "@/lib/format";
import { RefreshCw } from "lucide-react";

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

interface WatchlistTableProps {
    watchlistId: string;
    watchlistName: string;
}

const Skeleton = ({ className = "w-16" }: { className?: string }) => (
    <span className={`inline-block h-4 rounded bg-pm-dark animate-pulse align-middle ${className}`} />
);

export default function WatchlistTable({ watchlistId }: WatchlistTableProps) {
    const { watchlists, stockDb } = useAdmin();

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

    const currentWatchlist = watchlists.find((p) => p.id === watchlistId);

    // Get positions from current watchlist
    const positions = currentWatchlist?.positions || [];

    // Build ticker list dynamically from current watchlist
    const tickerList = positions.map((p) => p.ticker).join(',');

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
        const currentPrice = liveData?.price ?? null;
        const hasPrice = currentPrice !== null && currentPrice > 0;
        const yearlyClose = stock?.yearlyClose ?? 0;

        return {
            ticker: position.ticker,
            name: stock?.name || position.ticker,
            assetClass: stock?.assetClass || "",
            weight: position.weight,
            thesis: position.thesis,
            yearlyClose,
            currentPrice,
            returnPercent: hasPrice && yearlyClose > 0 ? calculateYTD(currentPrice, yearlyClose) : null,
            dayChange: hasPrice ? liveData?.changePercent ?? null : null,
            marketCap: liveData?.marketCap ?? null,
            pmScore: stock?.pmScore || 0,
            isStale: staleTickers.has(position.ticker) || !hasPrice,
        };
    });

    // Calculate watchlist aggregate stats using weighted calculations
    const weightedYTD = calculateWeightedYTD(positions, prices, stockDb);
    const weightedDayChange = calculateWeightedDayChange(positions, prices);
    const avgPmScore = calculateAvgPmScore(positions, stockDb);
    const totalWeight = positions.reduce((acc, p) => acc + p.weight, 0);

    // Quarterly performance for the tracking year (compounds to the YTD figure)
    const quarterlyPerformance = calculateQuarterlyReturns(positions, prices);

    const updatedLabel = lastPriceFetch
        ? lastPriceFetch.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        : null;
    const loading = isLoadingPrices && !lastPriceFetch;
    const pricedCount = liveWatchlist.filter((p) => !p.isStale).length;

    if (!currentWatchlist) {
        return <p className="py-12 text-pm-muted">This watchlist doesn&apos;t exist. Pick one above.</p>;
    }

    if (positions.length === 0) {
        return <p className="py-12 text-pm-muted">No positions yet. Add them from the admin panel.</p>;
    }

    const figures = [
        {
            label: `${TRACKING_YEAR} YTD`,
            value: loading ? null : formatPct(weightedYTD),
            tone: directionClass(weightedYTD),
            note: getYTDBaselineDisplayString(),
        },
        {
            label: "Today",
            value: loading ? null : formatPct(weightedDayChange),
            tone: directionClass(weightedDayChange),
            note: marketOpen ? "Weighted, live" : "Weighted, last session",
        },
        {
            label: "Avg PM Score",
            value: String(Math.round(avgPmScore)),
            tone: "text-pm-gold",
            note: getPmScoreCategory(avgPmScore),
        },
        {
            label: "Holdings",
            value: String(positions.length),
            tone: "text-pm-text",
            note: Math.round(totalWeight) === 100 ? "Fully weighted" : `${totalWeight.toFixed(2)}% allocated`,
        },
    ];

    return (
        <div className="space-y-8">
            {/* Key figures */}
            <dl className="grid grid-cols-2 lg:grid-cols-4 border-y border-pm-border">
                {figures.map((f, i) => (
                    <div
                        key={f.label}
                        className={[
                            "py-5 pr-4",
                            i % 2 === 1 ? "pl-4 border-l border-pm-border" : "",
                            i >= 2 ? "border-t border-pm-border lg:border-t-0" : "",
                            i > 0 ? "lg:pl-6 lg:border-l lg:border-pm-border" : "",
                        ].join(" ")}
                    >
                        <dt className="text-sm text-pm-muted">{f.label}</dt>
                        <dd className={`mt-1 type-display font-bold text-4xl ${f.tone}`}>
                            {f.value ?? <Skeleton className="w-24 h-8" />}
                        </dd>
                        <dd className="mt-1 text-xs text-pm-subtle">{f.note}</dd>
                    </div>
                ))}
            </dl>

            {/* Quarters compound to the YTD figure */}
            {quarterlyPerformance.length > 0 && (
                <div>
                    <ol className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-pm-border rounded-md overflow-hidden border border-pm-border">
                        {quarterlyPerformance.map((q) => (
                            <li key={q.label} className="bg-pm-charcoal px-4 py-3">
                                <div className="text-xs text-pm-muted">
                                    {q.label}
                                    {q.inProgress ? " to date" : ""}
                                </div>
                                <div className={`mt-0.5 type-data text-lg font-semibold ${loading ? "text-pm-subtle" : directionClass(q.value)}`}>
                                    {loading ? "…" : formatPct(q.value)}
                                </div>
                            </li>
                        ))}
                    </ol>
                    <p className="mt-2 text-xs text-pm-subtle">
                        Quarter returns compound to the YTD figure. Completed quarters use quarter-end closes;
                        the current quarter is live.
                    </p>
                </div>
            )}

            {/* Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-pm-muted">
                <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="inline-flex items-center gap-2">
                        <span
                            className={`w-2 h-2 rounded-full ${marketOpen ? "bg-pm-gold animate-pulse-slow" : "bg-pm-subtle"}`}
                            aria-hidden
                        />
                        {marketOpen ? "Market open" : "Market closed"}
                    </span>
                    {fetchError ? (
                        <span className="text-pm-down">Prices couldn&apos;t load. Retrying automatically.</span>
                    ) : updatedLabel ? (
                        <span>Prices updated {updatedLabel}</span>
                    ) : (
                        <span>Loading prices</span>
                    )}
                    {!loading && pricedCount < liveWatchlist.length && !fetchError && (
                        <span>
                            {liveWatchlist.length - pricedCount} of {liveWatchlist.length} without a live price
                        </span>
                    )}
                </p>
                <button
                    onClick={handleRefresh}
                    disabled={isLoadingPrices || isRefreshing}
                    className="inline-flex items-center gap-1.5 hover:text-pm-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPrices || isRefreshing ? "animate-spin" : ""}`} aria-hidden />
                    Refresh prices
                </button>
            </div>

            {/* Holdings */}
            <div className="rounded-lg border border-pm-border bg-pm-charcoal overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <caption className="sr-only">
                        {currentWatchlist.name} holdings with live prices, day change and {TRACKING_YEAR} year-to-date return
                    </caption>
                    <thead>
                        <tr className="text-xs text-pm-muted border-b border-pm-border">
                            <th scope="col" className="font-medium px-4 py-3">Holding</th>
                            <th scope="col" className="font-medium px-4 py-3 hidden lg:table-cell">Asset class</th>
                            <th scope="col" className="font-medium px-4 py-3 text-right hidden md:table-cell">Weight</th>
                            <th scope="col" className="font-medium px-4 py-3 text-right hidden md:table-cell">
                                {formatNoteDate(BASELINE_DATE, false)} close
                            </th>
                            <th scope="col" className="font-medium px-4 py-3 text-right">Price</th>
                            <th scope="col" className="font-medium px-4 py-3 text-right">Day</th>
                            <th scope="col" className="font-medium px-4 py-3 text-right">YTD</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-pm-border">
                        {liveWatchlist.map((position) => (
                            <tr key={position.ticker} className="hover:bg-pm-dark transition-colors">
                                <th scope="row" className="px-4 py-3.5 font-normal">
                                    <span className="block type-condensed font-bold text-base text-pm-text">
                                        {position.ticker}
                                    </span>
                                    <span className="block text-xs text-pm-muted max-w-[9rem] sm:max-w-none truncate">{position.name}</span>
                                    <span className="hidden sm:block text-xs text-pm-subtle">
                                        {loading ? <Skeleton className="w-14 h-3" /> : `Mkt cap ${formatMarketCap(position.marketCap)}`}
                                    </span>
                                </th>
                                <td className="px-4 py-3.5 text-sm text-pm-muted hidden lg:table-cell">
                                    {position.assetClass}
                                </td>
                                <td className="px-4 py-3.5 text-right type-data text-sm text-pm-muted hidden md:table-cell">
                                    {position.weight.toFixed(2)}%
                                </td>
                                <td className="px-4 py-3.5 text-right type-data text-sm text-pm-muted hidden md:table-cell">
                                    {formatPrice(position.yearlyClose)}
                                </td>
                                <td className="px-4 py-3.5 text-right type-data text-sm text-pm-text">
                                    {loading ? <Skeleton className="w-16" /> : formatPrice(position.currentPrice)}
                                </td>
                                <td className={`px-4 py-3.5 text-right type-data text-sm ${directionClass(position.dayChange)}`}>
                                    {loading ? <Skeleton className="w-12" /> : formatPct(position.dayChange)}
                                </td>
                                <td className={`px-4 py-3.5 text-right type-data text-sm font-semibold ${directionClass(position.returnPercent)}`}>
                                    {loading ? <Skeleton className="w-14" /> : formatPct(position.returnPercent)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
