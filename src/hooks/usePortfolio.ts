"use client";

import { useCallback, useMemo } from "react";
import { usePortfolio as usePortfolioContext } from "@/context/PortfolioContext";
import { useAdmin } from "@/context/AdminContext";
import { Portfolio, PortfolioPosition } from "@/lib/portfolios";
import { StockData } from "@/data/stockDatabase";

interface UsePortfolioReturn {
    // Core portfolio data
    portfolios: Portfolio[];
    activePortfolioId: string;
    activePortfolio: Portfolio | undefined;
    setActivePortfolioId: (id: string) => void;

    // Portfolio CRUD
    addPortfolio: (name: string, description: string) => void;
    updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
    deletePortfolio: (id: string) => void;

    // Position CRUD
    addPosition: (portfolioId: string, ticker: string, weight: number) => void;
    updatePosition: (portfolioId: string, ticker: string, weight: number) => void;
    removePosition: (portfolioId: string, ticker: string) => void;
    rebalanceWeights: (portfolioId: string) => void;

    // Utility functions
    getPortfolio: (id: string) => Portfolio | undefined;
    getPositionTickers: (portfolioId: string) => string[];
    getTotalWeight: (portfolioId: string) => number;
    isFullyAllocated: (portfolioId: string) => boolean;

    // Stock database access
    stockDb: Record<string, StockData>;
    getStock: (ticker: string) => StockData | undefined;
}

/**
 * Enhanced portfolio hook with utility functions.
 * Wraps the base PortfolioContext with additional computed values and helpers.
 */
export function usePortfolioEnhanced(): UsePortfolioReturn {
    const {
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
    } = usePortfolioContext();

    const { stockDb } = useAdmin();

    // Get the currently active portfolio
    const activePortfolio = useMemo(() => {
        return portfolios.find((p) => p.id === activePortfolioId);
    }, [portfolios, activePortfolioId]);

    // Get a portfolio by ID
    const getPortfolio = useCallback((id: string): Portfolio | undefined => {
        return portfolios.find((p) => p.id === id);
    }, [portfolios]);

    // Get all ticker symbols from a portfolio
    const getPositionTickers = useCallback((portfolioId: string): string[] => {
        const portfolio = portfolios.find((p) => p.id === portfolioId);
        return portfolio?.positions.map((pos) => pos.ticker) || [];
    }, [portfolios]);

    // Calculate total weight for a portfolio
    const getTotalWeight = useCallback((portfolioId: string): number => {
        const portfolio = portfolios.find((p) => p.id === portfolioId);
        if (!portfolio) return 0;
        return portfolio.positions.reduce((sum, pos) => sum + pos.weight, 0);
    }, [portfolios]);

    // Check if a portfolio is fully allocated (100%)
    const isFullyAllocated = useCallback((portfolioId: string): boolean => {
        return Math.abs(getTotalWeight(portfolioId) - 100) < 0.01;
    }, [getTotalWeight]);

    // Get stock data from database
    const getStock = useCallback((ticker: string): StockData | undefined => {
        return stockDb[ticker.toUpperCase()];
    }, [stockDb]);

    return {
        portfolios,
        activePortfolioId,
        activePortfolio,
        setActivePortfolioId,
        addPortfolio,
        updatePortfolio,
        deletePortfolio,
        addPosition,
        updatePosition,
        removePosition,
        rebalanceWeights,
        getPortfolio,
        getPositionTickers,
        getTotalWeight,
        isFullyAllocated,
        stockDb,
        getStock,
    };
}

// Re-export the base hook for simple use cases
export { usePortfolio } from "@/context/PortfolioContext";
