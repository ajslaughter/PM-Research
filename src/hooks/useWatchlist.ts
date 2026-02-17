"use client";

import { useCallback, useMemo } from "react";
import { useWatchlist as useWatchlistContext } from "@/context/WatchlistContext";
import { useAdmin } from "@/context/AdminContext";
import { Watchlist, WatchlistPosition } from "@/lib/watchlists";
import { StockData } from "@/data/stockDatabase";

interface UseWatchlistReturn {
    // Core watchlist data
    watchlists: Watchlist[];
    activeWatchlistId: string;
    activeWatchlist: Watchlist | undefined;
    setActiveWatchlistId: (id: string) => void;

    // Watchlist CRUD
    addWatchlist: (name: string, description: string) => void;
    updateWatchlist: (id: string, updates: Partial<Watchlist>) => void;
    deleteWatchlist: (id: string) => void;

    // Position CRUD
    addPosition: (watchlistId: string, ticker: string, weight: number) => void;
    updatePosition: (watchlistId: string, ticker: string, weight: number) => void;
    removePosition: (watchlistId: string, ticker: string) => void;
    rebalanceWeights: (watchlistId: string) => void;

    // Utility functions
    getWatchlist: (id: string) => Watchlist | undefined;
    getPositionTickers: (watchlistId: string) => string[];
    getTotalWeight: (watchlistId: string) => number;
    isFullyAllocated: (watchlistId: string) => boolean;

    // Stock database access
    stockDb: Record<string, StockData>;
    getStock: (ticker: string) => StockData | undefined;
}

/**
 * Enhanced watchlist hook with utility functions.
 * Wraps the base WatchlistContext with additional computed values and helpers.
 */
export function useWatchlistEnhanced(): UseWatchlistReturn {
    const {
        watchlists,
        activeWatchlistId,
        setActiveWatchlistId,
        addWatchlist,
        updateWatchlist,
        deleteWatchlist,
        addPosition,
        updatePosition,
        removePosition,
        rebalanceWeights,
    } = useWatchlistContext();

    const { stockDb } = useAdmin();

    // Get the currently active watchlist
    const activeWatchlist = useMemo(() => {
        return watchlists.find((p) => p.id === activeWatchlistId);
    }, [watchlists, activeWatchlistId]);

    // Get a watchlist by ID
    const getWatchlist = useCallback((id: string): Watchlist | undefined => {
        return watchlists.find((p) => p.id === id);
    }, [watchlists]);

    // Get all ticker symbols from a watchlist
    const getPositionTickers = useCallback((watchlistId: string): string[] => {
        const wl = watchlists.find((p) => p.id === watchlistId);
        return wl?.positions.map((pos) => pos.ticker) || [];
    }, [watchlists]);

    // Calculate total weight for a watchlist
    const getTotalWeight = useCallback((watchlistId: string): number => {
        const wl = watchlists.find((p) => p.id === watchlistId);
        if (!wl) return 0;
        return wl.positions.reduce((sum, pos) => sum + pos.weight, 0);
    }, [watchlists]);

    // Check if a watchlist is fully allocated (100%)
    const isFullyAllocated = useCallback((watchlistId: string): boolean => {
        return Math.abs(getTotalWeight(watchlistId) - 100) < 0.01;
    }, [getTotalWeight]);

    // Get stock data from database
    const getStock = useCallback((ticker: string): StockData | undefined => {
        return stockDb[ticker.toUpperCase()];
    }, [stockDb]);

    return {
        watchlists,
        activeWatchlistId,
        activeWatchlist,
        setActiveWatchlistId,
        addWatchlist,
        updateWatchlist,
        deleteWatchlist,
        addPosition,
        updatePosition,
        removePosition,
        rebalanceWeights,
        getWatchlist,
        getPositionTickers,
        getTotalWeight,
        isFullyAllocated,
        stockDb,
        getStock,
    };
}

// Re-export the base hook for simple use cases
export { useWatchlist } from "@/context/WatchlistContext";
