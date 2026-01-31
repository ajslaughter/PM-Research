"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from "react";
import { PortfolioProvider, usePortfolio } from "./PortfolioContext";
import { ResearchProvider, useResearch } from "./ResearchContext";
import { StockDatabaseProvider, useStockDatabase } from "./StockDatabaseContext";
import { ResearchNote, Portfolio } from "@/lib/portfolios";
import { StockData } from "@/data/stockDatabase";

// ============================================================================
// Data Sync Context - Allows sub-providers to signal persistence events
// ============================================================================

interface DataSyncContextType {
    /** Register a callback that will be called when data is persisted */
    onDataPersisted: () => void;
}

const DataSyncContext = createContext<DataSyncContextType | undefined>(undefined);

/**
 * Hook for sub-providers to signal that data has been persisted
 */
export function useDataSync() {
    const context = useContext(DataSyncContext);
    if (context === undefined) {
        // Allow usage outside of provider for graceful degradation
        return { onDataPersisted: () => {} };
    }
    return context;
}

// ============================================================================
// Admin Mode Context
// ============================================================================

interface AdminModeContextType {
    isAdmin: boolean;
    toggleAdmin: () => void;
    lastUpdated: Date | null;
    /** Manually update the lastUpdated timestamp */
    markUpdated: () => void;
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

function AdminModeProvider({ children }: { children: ReactNode }) {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Set initial timestamp on mount
    useEffect(() => {
        setLastUpdated(new Date());
    }, []);

    // Update timestamp when data is persisted
    const markUpdated = useCallback(() => {
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

    // Provide both AdminMode and DataSync contexts
    return (
        <AdminModeContext.Provider value={{ isAdmin, toggleAdmin, lastUpdated, markUpdated }}>
            <DataSyncContext.Provider value={{ onDataPersisted: markUpdated }}>
                {children}
            </DataSyncContext.Provider>
        </AdminModeContext.Provider>
    );
}

// ============================================================================
// Data Sync Bridge - Connects sub-provider persistence to AdminModeContext
// ============================================================================

/**
 * Bridge component that connects sub-provider persistence callbacks
 * to the AdminModeContext's lastUpdated timestamp
 */
function DataSyncBridge({ children }: { children: ReactNode }) {
    const { onDataPersisted } = useDataSync();
    const portfolio = usePortfolio();
    const research = useResearch();
    const stockDb = useStockDatabase();

    // Track if we've registered callbacks to avoid duplicates
    const registeredRef = useRef(false);

    // Register persistence callbacks from all sub-providers
    useEffect(() => {
        if (registeredRef.current) return;
        registeredRef.current = true;

        const unsubscribePortfolio = portfolio.onPersist(onDataPersisted);
        const unsubscribeResearch = research.onPersist(onDataPersisted);
        const unsubscribeStockDb = stockDb.onPersist(onDataPersisted);

        return () => {
            unsubscribePortfolio();
            unsubscribeResearch();
            unsubscribeStockDb();
            registeredRef.current = false;
        };
    }, [onDataPersisted, portfolio, research, stockDb]);

    return <>{children}</>;
}

// ============================================================================
// Composed Provider
// ============================================================================

/**
 * Composed provider that wraps all context providers
 * Structure: AdminMode -> DataSync -> StockDatabase -> Portfolio -> Research -> DataSyncBridge
 */
export function AdminProvider({ children }: { children: ReactNode }) {
    return (
        <AdminModeProvider>
            <StockDatabaseProvider>
                <PortfolioProvider>
                    <ResearchProvider>
                        <DataSyncBridge>
                            {children}
                        </DataSyncBridge>
                    </ResearchProvider>
                </PortfolioProvider>
            </StockDatabaseProvider>
        </AdminModeProvider>
    );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Backward-compatible useAdmin hook that combines all contexts
 */
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
        markUpdated: adminMode.markUpdated,

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

/**
 * Hook to access just the admin mode state
 */
export function useAdminMode() {
    const context = useContext(AdminModeContext);
    if (context === undefined) {
        throw new Error("useAdminMode must be used within an AdminProvider");
    }
    return context;
}

// Export individual hooks for more focused usage
export { usePortfolio } from "./PortfolioContext";
export { useResearch } from "./ResearchContext";
export { useStockDatabase } from "./StockDatabaseContext";

// ============================================================================
// Types
// ============================================================================

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
    markUpdated: () => void;
}
