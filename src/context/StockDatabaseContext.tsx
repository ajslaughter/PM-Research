"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { StockData, stockDatabase as initialStockDatabase } from "@/data/stockDatabase";

interface StockDatabaseContextType {
    stockDb: Record<string, StockData>;
    addStock: (stock: StockData) => void;
    updateStock: (ticker: string, updates: Partial<StockData>) => void;
}

const StockDatabaseContext = createContext<StockDatabaseContextType | undefined>(undefined);

const STORAGE_KEY = "pm-stock-db-v2";

export function StockDatabaseProvider({ children }: { children: ReactNode }) {
    const [isHydrated, setIsHydrated] = useState(false);
    const [stockDb, setStockDb] = useState<Record<string, StockData>>(initialStockDatabase);

    // Load from localStorage on mount (merge with initial)
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const savedStockDb = localStorage.getItem(STORAGE_KEY);
            if (savedStockDb) {
                const parsed = JSON.parse(savedStockDb);
                if (typeof parsed === 'object' && parsed !== null) {
                    setStockDb({ ...initialStockDatabase, ...parsed });
                }
            }
        } catch (error) {
            console.error("Failed to load stock db from localStorage:", error);
        }

        setIsHydrated(true);
    }, []);

    // Persist to localStorage (only custom stocks)
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;
        try {
            // Only save stocks that differ from initial database
            const customStocks: Record<string, StockData> = {};
            for (const [ticker, data] of Object.entries(stockDb)) {
                if (!initialStockDatabase[ticker] || JSON.stringify(data) !== JSON.stringify(initialStockDatabase[ticker])) {
                    customStocks[ticker] = data;
                }
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(customStocks));
        } catch (error) {
            console.error("Failed to save stock db to localStorage:", error);
        }
    }, [stockDb, isHydrated]);

    // Stock database operations
    const addStock = useCallback((stock: StockData) => {
        setStockDb((prev) => ({ ...prev, [stock.ticker.toUpperCase()]: stock }));
    }, []);

    const updateStock = useCallback((ticker: string, updates: Partial<StockData>) => {
        setStockDb((prev) => ({
            ...prev,
            [ticker.toUpperCase()]: { ...prev[ticker.toUpperCase()], ...updates }
        }));
    }, []);

    return (
        <StockDatabaseContext.Provider
            value={{
                stockDb,
                addStock,
                updateStock,
            }}
        >
            {children}
        </StockDatabaseContext.Provider>
    );
}

export function useStockDatabase() {
    const context = useContext(StockDatabaseContext);
    if (context === undefined) {
        throw new Error("useStockDatabase must be used within a StockDatabaseProvider");
    }
    return context;
}
