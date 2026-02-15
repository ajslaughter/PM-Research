"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface UserPortfolioPosition {
    ticker: string;
    weight: number;
}

export interface UserPortfolio {
    id: string;
    user_id: string;
    name: string;
    description: string;
    positions: UserPortfolioPosition[];
    created_at: string;
    updated_at: string;
}

interface UserPortfolioContextType {
    portfolios: UserPortfolio[];
    isLoading: boolean;
    error: string | null;
    createPortfolio: (name: string, description: string, positions: UserPortfolioPosition[]) => Promise<UserPortfolio | null>;
    updatePortfolio: (id: string, updates: { name?: string; description?: string; positions?: UserPortfolioPosition[] }) => Promise<boolean>;
    deletePortfolio: (id: string) => Promise<boolean>;
    refreshPortfolios: () => Promise<void>;
}

const UserPortfolioContext = createContext<UserPortfolioContextType | undefined>(undefined);

export function UserPortfolioProvider({ children }: { children: ReactNode }) {
    const { user, accessToken } = useAuth();
    const [portfolios, setPortfolios] = useState<UserPortfolio[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const headers = useCallback(() => {
        const h: Record<string, string> = { 'Content-Type': 'application/json' };
        if (accessToken) {
            h['Authorization'] = `Bearer ${accessToken}`;
        }
        return h;
    }, [accessToken]);

    const refreshPortfolios = useCallback(async () => {
        if (!user || !accessToken) {
            setPortfolios([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/user-portfolios', { headers: headers() });
            if (res.ok) {
                const data = await res.json();
                setPortfolios(data.portfolios || []);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to load portfolios');
            }
        } catch {
            setError('Failed to load portfolios');
        } finally {
            setIsLoading(false);
        }
    }, [user, accessToken, headers]);

    // Fetch portfolios when user logs in
    useEffect(() => {
        if (user && accessToken) {
            refreshPortfolios();
        } else {
            setPortfolios([]);
        }
    }, [user, accessToken, refreshPortfolios]);

    const createPortfolio = useCallback(async (
        name: string,
        description: string,
        positions: UserPortfolioPosition[]
    ): Promise<UserPortfolio | null> => {
        if (!accessToken) return null;

        try {
            const res = await fetch('/api/user-portfolios', {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify({ name, description, positions }),
            });

            const data = await res.json();

            if (res.ok) {
                setPortfolios(prev => [data.portfolio, ...prev]);
                return data.portfolio;
            } else {
                setError(data.error || 'Failed to create portfolio');
                return null;
            }
        } catch {
            setError('Failed to create portfolio');
            return null;
        }
    }, [accessToken, headers]);

    const updatePortfolio = useCallback(async (
        id: string,
        updates: { name?: string; description?: string; positions?: UserPortfolioPosition[] }
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
                setPortfolios(prev =>
                    prev.map(p => p.id === id ? data.portfolio : p)
                );
                return true;
            } else {
                setError(data.error || 'Failed to update portfolio');
                return false;
            }
        } catch {
            setError('Failed to update portfolio');
            return false;
        }
    }, [accessToken, headers]);

    const deletePortfolio = useCallback(async (id: string): Promise<boolean> => {
        if (!accessToken) return false;

        try {
            const res = await fetch(`/api/user-portfolios?id=${id}`, {
                method: 'DELETE',
                headers: headers(),
            });

            if (res.ok) {
                setPortfolios(prev => prev.filter(p => p.id !== id));
                return true;
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to delete portfolio');
                return false;
            }
        } catch {
            setError('Failed to delete portfolio');
            return false;
        }
    }, [accessToken, headers]);

    return (
        <UserPortfolioContext.Provider value={{
            portfolios,
            isLoading,
            error,
            createPortfolio,
            updatePortfolio,
            deletePortfolio,
            refreshPortfolios,
        }}>
            {children}
        </UserPortfolioContext.Provider>
    );
}

export function useUserPortfolios() {
    const context = useContext(UserPortfolioContext);
    if (context === undefined) {
        throw new Error("useUserPortfolios must be used within a UserPortfolioProvider");
    }
    return context;
}
