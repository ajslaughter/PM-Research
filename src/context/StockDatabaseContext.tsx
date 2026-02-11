"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { StockData, stockDatabase as initialStockDatabase } from "@/data/stockDatabase";

interface StockDatabaseContextType {
    stockDb: Record<string, StockData>;
    addStock: (stock: StockData) => void;
    updateStock: (ticker: string, updates: Partial<StockData>) => void;
}

const StockDatabaseContext = createContext<StockDatabaseContextType | undefined>(undefined);

export function StockDatabaseProvider({ children }: { children: ReactNode }) {
    const [stockDb, setStockDb] = useState<Record<string, StockData>>(initialStockDatabase);

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
