"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { PortfolioProvider, usePortfolio } from "./PortfolioContext";
import { ResearchProvider, useResearch } from "./ResearchContext";
import { StockDatabaseProvider, useStockDatabase } from "./StockDatabaseContext";
import { ResearchNote, Portfolio } from "@/lib/portfolios";
import { StockData } from "@/data/stockDatabase";

// Admin mode context (lightweight - just handles admin toggle)
interface AdminModeContextType {
    isAdmin: boolean;
    toggleAdmin: () => void;
    lastUpdated: Date | null;
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

function AdminModeProvider({ children }: { children: ReactNode }) {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Set initial timestamp on mount
    useEffect(() => {
        setLastUpdated(new Date());
    }, []);

    // Toggle admin mode
    const toggleAdmin = useCallback(() => {
        setIsAdmin((prev) => !prev);
    }, []);

    // Keyboard shortcut for admin toggle (Ctrl+Shift+A)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === "A") {
                e.preventDefault();
                toggleAdmin();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleAdmin]);

    return (
        <AdminModeContext.Provider value={{ isAdmin, toggleAdmin, lastUpdated }}>
            {children}
        </AdminModeContext.Provider>
    );
}

// Composed provider that wraps all context providers
export function AdminProvider({ children }: { children: ReactNode }) {
    return (
        <AdminModeProvider>
            <StockDatabaseProvider>
                <PortfolioProvider>
                    <ResearchProvider>
                        {children}
                    </ResearchProvider>
                </PortfolioProvider>
            </StockDatabaseProvider>
        </AdminModeProvider>
    );
}

// Backward-compatible useAdmin hook that combines all contexts
export function useAdmin() {
    const adminMode = useContext(AdminModeContext);
    const portfolio = usePortfolio();
    const research = useResearch();
    const stockDb = useStockDatabase();

    if (adminMode === undefined) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }

    // Return combined interface for backward compatibility
    return {
        // Admin mode
        isAdmin: adminMode.isAdmin,
        toggleAdmin: adminMode.toggleAdmin,
        lastUpdated: adminMode.lastUpdated,

        // Research (from ResearchContext)
        researchNotes: research.researchNotes,
        addResearchNote: research.addResearchNote,
        updateResearchNote: research.updateResearchNote,
        deleteResearchNote: research.deleteResearchNote,

        // Portfolios (from PortfolioContext)
        portfolios: portfolio.portfolios,
        activePortfolioId: portfolio.activePortfolioId,
        setActivePortfolioId: portfolio.setActivePortfolioId,
        addPortfolio: portfolio.addPortfolio,
        updatePortfolio: portfolio.updatePortfolio,
        deletePortfolio: portfolio.deletePortfolio,
        addPosition: portfolio.addPosition,
        updatePosition: portfolio.updatePosition,
        removePosition: portfolio.removePosition,
        rebalanceWeights: portfolio.rebalanceWeights,

        // Stock database (from StockDatabaseContext)
        stockDb: stockDb.stockDb,
        addStock: stockDb.addStock,
        updateStock: stockDb.updateStock,
    };
}

// Export individual hooks for more focused usage
export { usePortfolio } from "./PortfolioContext";
export { useResearch } from "./ResearchContext";
export { useStockDatabase } from "./StockDatabaseContext";

// Legacy type export for backward compatibility
export interface AdminContextType {
    isAdmin: boolean;
    toggleAdmin: () => void;
    researchNotes: ResearchNote[];
    addResearchNote: (note: Omit<ResearchNote, "id">) => void;
    updateResearchNote: (id: string, updates: Partial<ResearchNote>) => void;
    deleteResearchNote: (id: string) => void;
    portfolios: Portfolio[];
    activePortfolioId: string;
    setActivePortfolioId: (id: string) => void;
    addPortfolio: (name: string, description: string) => void;
    updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
    deletePortfolio: (id: string) => void;
    addPosition: (portfolioId: string, ticker: string, weight: number) => void;
    updatePosition: (portfolioId: string, ticker: string, weight: number) => void;
    removePosition: (portfolioId: string, ticker: string) => void;
    rebalanceWeights: (portfolioId: string) => void;
    stockDb: Record<string, StockData>;
    addStock: (stock: StockData) => void;
    updateStock: (ticker: string, updates: Partial<StockData>) => void;
    lastUpdated: Date | null;
}
