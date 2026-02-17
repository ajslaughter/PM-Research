"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Watchlist, WatchlistPosition, WatchlistCategory, defaultWatchlists } from "@/lib/watchlists";

interface WatchlistContextType {
    watchlists: Watchlist[];
    activeWatchlistId: string;
    setActiveWatchlistId: (id: string) => void;

    // Watchlist CRUD
    addWatchlist: (name: string, description: string, category?: WatchlistCategory) => void;
    updateWatchlist: (id: string, updates: Partial<Watchlist>) => void;
    deleteWatchlist: (id: string) => void;

    // Position CRUD
    addPosition: (watchlistId: string, ticker: string, weight: number) => void;
    updatePosition: (watchlistId: string, ticker: string, weight: number) => void;
    removePosition: (watchlistId: string, ticker: string) => void;
    rebalanceWeights: (watchlistId: string) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
    const [watchlists, setWatchlists] = useState<Watchlist[]>(defaultWatchlists);
    const [activeWatchlistId, setActiveWatchlistId] = useState<string>("pm-research");

    // Watchlist CRUD operations
    const addWatchlist = useCallback((name: string, description: string, category: WatchlistCategory = 'Magnificent 7') => {
        const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        setWatchlists((prev) => [...prev, { id, name, description, category, positions: [] }]);
    }, []);

    const updateWatchlist = useCallback((id: string, updates: Partial<Watchlist>) => {
        setWatchlists((prev) => prev.map((p) => p.id === id ? { ...p, ...updates } : p));
    }, []);

    const deleteWatchlist = useCallback((id: string) => {
        setWatchlists((prev) => {
            const filtered = prev.filter((p) => p.id !== id);
            if (activeWatchlistId === id && filtered.length > 0) {
                setActiveWatchlistId(filtered[0].id);
            }
            return filtered;
        });
    }, [activeWatchlistId]);

    // Position CRUD operations
    const addPosition = useCallback((watchlistId: string, ticker: string, weight: number) => {
        setWatchlists((prev) => prev.map((p) => {
            if (p.id !== watchlistId) return p;
            if (p.positions.find((pos) => pos.ticker.toUpperCase() === ticker.toUpperCase())) return p;
            return {
                ...p,
                positions: [...p.positions, { ticker: ticker.toUpperCase(), weight }]
            };
        }));
    }, []);

    const updatePosition = useCallback((watchlistId: string, ticker: string, weight: number) => {
        setWatchlists((prev) => prev.map((p) => {
            if (p.id !== watchlistId) return p;
            return {
                ...p,
                positions: p.positions.map((pos) =>
                    pos.ticker.toUpperCase() === ticker.toUpperCase() ? { ...pos, weight } : pos
                )
            };
        }));
    }, []);

    const removePosition = useCallback((watchlistId: string, ticker: string) => {
        setWatchlists((prev) => prev.map((p) => {
            if (p.id !== watchlistId) return p;
            return {
                ...p,
                positions: p.positions.filter((pos) => pos.ticker.toUpperCase() !== ticker.toUpperCase())
            };
        }));
    }, []);

    const rebalanceWeights = useCallback((watchlistId: string) => {
        setWatchlists((prev) => prev.map((p) => {
            if (p.id !== watchlistId || p.positions.length === 0) return p;
            const equalWeight = Math.round((100 / p.positions.length) * 100) / 100;
            return {
                ...p,
                positions: p.positions.map((pos) => ({ ...pos, weight: equalWeight }))
            };
        }));
    }, []);

    return (
        <WatchlistContext.Provider
            value={{
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
            }}
        >
            {children}
        </WatchlistContext.Provider>
    );
}

export function useWatchlist() {
    const context = useContext(WatchlistContext);
    if (context === undefined) {
        throw new Error("useWatchlist must be used within a WatchlistProvider");
    }
    return context;
}
