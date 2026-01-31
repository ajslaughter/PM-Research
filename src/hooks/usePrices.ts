"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

interface UsePricesOptions {
    /** Polling interval when market is open (ms). Default: 30000 */
    pollIntervalOpen?: number;
    /** Polling interval when market is closed (ms). Default: 300000 */
    pollIntervalClosed?: number;
    /** API timeout (ms). Default: 10000 */
    timeout?: number;
    /** Whether to enable polling. Default: true */
    enablePolling?: boolean;
}

interface UsePricesReturn {
    prices: Record<string, PriceData>;
    marketOpen: boolean;
    staleTickers: Set<string>;
    isLoading: boolean;
    isRefreshing: boolean;
    lastFetch: Date | null;
    error: string | null;
    refresh: () => Promise<void>;
}

export function usePrices(
    tickers: string[],
    options: UsePricesOptions = {}
): UsePricesReturn {
    const {
        pollIntervalOpen = 30000,
        pollIntervalClosed = 300000,
        timeout = 10000,
        enablePolling = true,
    } = options;

    const [prices, setPrices] = useState<Record<string, PriceData>>({});
    const [marketOpen, setMarketOpen] = useState(false);
    const [staleTickers, setStaleTickers] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastFetch, setLastFetch] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Refs for cleanup
    const abortControllerRef = useRef<AbortController | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    // Create ticker string for dependency
    const tickerString = tickers.join(',');

    const fetchPrices = useCallback(async (isManualRefresh = false) => {
        if (!tickerString) {
            setIsLoading(false);
            return;
        }

        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new AbortController
        abortControllerRef.current = new AbortController();

        if (isManualRefresh) {
            setIsRefreshing(true);
        }

        setError(null);

        try {
            const url = `/api/prices?tickers=${tickerString}&ts=${Date.now()}`;

            // Create timeout promise
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), timeout);
            });

            // Race between fetch and timeout
            const response = await Promise.race([
                fetch(url, {
                    cache: 'no-store',
                    signal: abortControllerRef.current.signal,
                }),
                timeoutPromise,
            ]);

            if (!isMountedRef.current) return;

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data: PriceApiResponse = await response.json();

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
                setLastFetch(new Date(data.timestamp));
                setError(null);
            }
        } catch (err) {
            if (!isMountedRef.current) return;

            // Ignore abort errors
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }

            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prices';
            setError(errorMessage);
            console.error("Error fetching prices:", err);
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        }
    }, [tickerString, timeout]);

    // Manual refresh function
    const refresh = useCallback(async () => {
        await fetchPrices(true);
    }, [fetchPrices]);

    // Initial fetch and polling setup
    useEffect(() => {
        isMountedRef.current = true;
        setIsLoading(true);

        // Initial fetch
        fetchPrices();

        // Setup polling if enabled
        if (enablePolling && tickerString) {
            const pollInterval = marketOpen ? pollIntervalOpen : pollIntervalClosed;

            intervalRef.current = setInterval(() => {
                fetchPrices();
            }, pollInterval);
        }

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
    }, [fetchPrices, enablePolling, marketOpen, pollIntervalOpen, pollIntervalClosed, tickerString]);

    // Update polling interval when market status changes
    useEffect(() => {
        if (!enablePolling || !tickerString) return;

        // Clear existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Set new interval based on market status
        const pollInterval = marketOpen ? pollIntervalOpen : pollIntervalClosed;
        intervalRef.current = setInterval(() => {
            fetchPrices();
        }, pollInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [marketOpen, enablePolling, pollIntervalOpen, pollIntervalClosed, fetchPrices, tickerString]);

    return {
        prices,
        marketOpen,
        staleTickers,
        isLoading,
        isRefreshing,
        lastFetch,
        error,
        refresh,
    };
}
