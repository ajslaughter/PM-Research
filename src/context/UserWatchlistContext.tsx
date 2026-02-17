"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface UserWatchlistPosition {
    ticker: string;
    weight: number;
}

export interface UserWatchlist {
    id: string;
    user_id: string;
    name: string;
    description: string;
    positions: UserWatchlistPosition[];
    created_at: string;
    updated_at: string;
}

interface UserWatchlistContextType {
    watchlists: UserWatchlist[];
    isLoading: boolean;
    error: string | null;
    createWatchlist: (name: string, description: string, positions: UserWatchlistPosition[]) => Promise<UserWatchlist | null>;
    updateWatchlist: (id: string, updates: { name?: string; description?: string; positions?: UserWatchlistPosition[] }) => Promise<boolean>;
    deleteWatchlist: (id: string) => Promise<boolean>;
    refreshWatchlists: () => Promise<void>;
}

const UserWatchlistContext = createContext<UserWatchlistContextType | undefined>(undefined);

export function UserWatchlistProvider({ children }: { children: ReactNode }) {
    const { user, accessToken } = useAuth();
    const [watchlists, setWatchlists] = useState<UserWatchlist[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const headers = useCallback(() => {
        const h: Record<string, string> = { 'Content-Type': 'application/json' };
        if (accessToken) {
            h['Authorization'] = `Bearer ${accessToken}`;
        }
        return h;
    }, [accessToken]);

    const refreshWatchlists = useCallback(async () => {
        if (!user || !accessToken) {
            setWatchlists([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/user-portfolios', { headers: headers() });
            if (res.ok) {
                const data = await res.json();
                setWatchlists(data.portfolios || []);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to load watchlists');
            }
        } catch {
            setError('Failed to load watchlists');
        } finally {
            setIsLoading(false);
        }
    }, [user, accessToken, headers]);

    // Fetch watchlists when user logs in
    useEffect(() => {
        if (user && accessToken) {
            refreshWatchlists();
        } else {
            setWatchlists([]);
        }
    }, [user, accessToken, refreshWatchlists]);

    const createWatchlist = useCallback(async (
        name: string,
        description: string,
        positions: UserWatchlistPosition[]
    ): Promise<UserWatchlist | null> => {
        if (!accessToken) return null;

        if (watchlists.length > 0) {
            setError("You can only create one custom watchlist.");
            return null;
        }

        try {
            const res = await fetch('/api/user-portfolios', {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify({ name, description, positions }),
            });

            const data = await res.json();

            if (res.ok) {
                setWatchlists(prev => [data.portfolio, ...prev]);
                return data.portfolio;
            } else {
                setError(data.error || 'Failed to create watchlist');
                return null;
            }
        } catch {
            setError('Failed to create watchlist');
            return null;
        }
    }, [accessToken, headers, watchlists.length]);

    const updateWatchlist = useCallback(async (
        id: string,
        updates: { name?: string; description?: string; positions?: UserWatchlistPosition[] }
    ): Promise<boolean> => {
        if (!accessToken) return false;

        try {
            const res = await fetch('/api/user-portfolios', {
                method: 'PUT',
                headers: headers(),
                body: JSON.stringify({ id, ...updates }),
            });

            const data = await res.json();

            if (res.ok) {
                setWatchlists(prev =>
                    prev.map(p => p.id === id ? data.portfolio : p)
                );
                return true;
            } else {
                setError(data.error || 'Failed to update watchlist');
                return false;
            }
        } catch {
            setError('Failed to update watchlist');
            return false;
        }
    }, [accessToken, headers]);

    const deleteWatchlist = useCallback(async (id: string): Promise<boolean> => {
        if (!accessToken) return false;

        try {
            const res = await fetch(`/api/user-portfolios?id=${id}`, {
                method: 'DELETE',
                headers: headers(),
            });

            if (res.ok) {
                setWatchlists(prev => prev.filter(p => p.id !== id));
                return true;
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to delete watchlist');
                return false;
            }
        } catch {
            setError('Failed to delete watchlist');
            return false;
        }
    }, [accessToken, headers]);

    return (
        <UserWatchlistContext.Provider value={{
            watchlists,
            isLoading,
            error,
            createWatchlist,
            updateWatchlist,
            deleteWatchlist,
            refreshWatchlists,
        }}>
            {children}
        </UserWatchlistContext.Provider>
    );
}

export function useUserWatchlists() {
    const context = useContext(UserWatchlistContext);
    if (context === undefined) {
        throw new Error("useUserWatchlists must be used within a UserWatchlistProvider");
    }
    return context;
}
