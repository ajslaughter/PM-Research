"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { Portfolio, PortfolioPosition, PortfolioCategory, defaultPortfolios } from "@/lib/portfolios";

interface PortfolioContextType {
    portfolios: Portfolio[];
    activePortfolioId: string;
    setActivePortfolioId: (id: string) => void;

    // Portfolio CRUD
    addPortfolio: (name: string, description: string, category?: PortfolioCategory) => void;
    updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
    deletePortfolio: (id: string) => void;

    // Position CRUD
    addPosition: (portfolioId: string, ticker: string, weight: number) => void;
    updatePosition: (portfolioId: string, ticker: string, weight: number) => void;
    removePosition: (portfolioId: string, ticker: string) => void;
    rebalanceWeights: (portfolioId: string) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const STORAGE_KEY = "pm-portfolios-v3";
const ACTIVE_PORTFOLIO_KEY = "pm-active-portfolio";

export function PortfolioProvider({ children }: { children: ReactNode }) {
    const [isHydrated, setIsHydrated] = useState(false);
    const [portfolios, setPortfolios] = useState<Portfolio[]>(defaultPortfolios);
    const [activePortfolioId, setActivePortfolioId] = useState<string>("pm-research");

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const savedPortfolios = localStorage.getItem(STORAGE_KEY);
            if (savedPortfolios) {
                const parsed = JSON.parse(savedPortfolios);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].positions) {
                    // Ensure backwards compatibility - add category if missing
                    const portfoliosWithCategory = parsed.map((p: Portfolio) => ({
                        ...p,
                        category: p.category || 'Magnificent 7' as PortfolioCategory
                    }));
                    setPortfolios(portfoliosWithCategory);
                }
            }

            const savedActivePortfolio = localStorage.getItem(ACTIVE_PORTFOLIO_KEY);
            if (savedActivePortfolio) {
                setActivePortfolioId(savedActivePortfolio);
            }
        } catch (error) {
            console.error("Failed to load portfolios from localStorage:", error);
        }

        setIsHydrated(true);
    }, []);

    // Persist portfolios to localStorage
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
        } catch (error) {
            console.error("Failed to save portfolios to localStorage:", error);
        }
    }, [portfolios, isHydrated]);

    // Persist active portfolio
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;
        try {
            localStorage.setItem(ACTIVE_PORTFOLIO_KEY, activePortfolioId);
        } catch (error) {
            console.error("Failed to save active portfolio to localStorage:", error);
        }
    }, [activePortfolioId, isHydrated]);

    // Portfolio CRUD operations
    const addPortfolio = useCallback((name: string, description: string, category: PortfolioCategory = 'Magnificent 7') => {
        const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        setPortfolios((prev) => [...prev, { id, name, description, category, positions: [] }]);
    }, []);

    const updatePortfolio = useCallback((id: string, updates: Partial<Portfolio>) => {
        setPortfolios((prev) => prev.map((p) => p.id === id ? { ...p, ...updates } : p));
    }, []);

    const deletePortfolio = useCallback((id: string) => {
        setPortfolios((prev) => {
            const filtered = prev.filter((p) => p.id !== id);
            if (activePortfolioId === id && filtered.length > 0) {
                setActivePortfolioId(filtered[0].id);
            }
            return filtered;
        });
    }, [activePortfolioId]);

    // Position CRUD operations
    const addPosition = useCallback((portfolioId: string, ticker: string, weight: number) => {
        setPortfolios((prev) => prev.map((p) => {
            if (p.id !== portfolioId) return p;
            if (p.positions.find((pos) => pos.ticker.toUpperCase() === ticker.toUpperCase())) return p;
            return {
                ...p,
                positions: [...p.positions, { ticker: ticker.toUpperCase(), weight }]
            };
        }));
    }, []);

    const updatePosition = useCallback((portfolioId: string, ticker: string, weight: number) => {
        setPortfolios((prev) => prev.map((p) => {
            if (p.id !== portfolioId) return p;
            return {
                ...p,
                positions: p.positions.map((pos) =>
                    pos.ticker.toUpperCase() === ticker.toUpperCase() ? { ...pos, weight } : pos
                )
            };
        }));
    }, []);

    const removePosition = useCallback((portfolioId: string, ticker: string) => {
        setPortfolios((prev) => prev.map((p) => {
            if (p.id !== portfolioId) return p;
            return {
                ...p,
                positions: p.positions.filter((pos) => pos.ticker.toUpperCase() !== ticker.toUpperCase())
            };
        }));
    }, []);

    const rebalanceWeights = useCallback((portfolioId: string) => {
        setPortfolios((prev) => prev.map((p) => {
            if (p.id !== portfolioId || p.positions.length === 0) return p;
            const equalWeight = Math.round((100 / p.positions.length) * 100) / 100;
            return {
                ...p,
                positions: p.positions.map((pos) => ({ ...pos, weight: equalWeight }))
            };
        }));
    }, []);

    return (
        <PortfolioContext.Provider
            value={{
                portfolios,
                activePortfolioId,
                setActivePortfolioId,
                addPortfolio,
                updatePortfolio,
                deletePortfolio,
                addPosition,
                updatePosition,
                removePosition,
                rebalanceWeights,
            }}
        >
            {children}
        </PortfolioContext.Provider>
    );
}

export function usePortfolio() {
    const context = useContext(PortfolioContext);
    if (context === undefined) {
        throw new Error("usePortfolio must be used within a PortfolioProvider");
    }
    return context;
}
