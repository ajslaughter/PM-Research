"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from "react";
import { StockData, stockDatabase as initialStockDatabase } from "@/data/stockDatabase";
import {
    loadWithMigration,
    cleanupLegacyKeys,
    isValidStockDbRecord,
    stockDbMigrations,
    MigrationConfig,
} from "@/lib/migrationUtils";

interface StockDatabaseContextType {
    stockDb: Record<string, StockData>;
    addStock: (stock: StockData) => void;
    updateStock: (ticker: string, updates: Partial<StockData>) => void;

    // Persistence callback registration
    onPersist: (callback: () => void) => () => void;
}

const StockDatabaseContext = createContext<StockDatabaseContextType | undefined>(undefined);

// Storage configuration
const STORAGE_KEY = "pm-stock-db-v2";
const LEGACY_KEYS = ["pm-stock-db", "pm-stock-db-v1"];

const stockDbMigrationConfig: MigrationConfig<Record<string, StockData>> = {
    currentKey: STORAGE_KEY,
    currentVersion: 2,
    legacyKeys: LEGACY_KEYS,
    defaultValue: {},
    validate: isValidStockDbRecord as (data: unknown) => data is Record<string, StockData>,
    migrations: stockDbMigrations,
};

export function StockDatabaseProvider({ children }: { children: ReactNode }) {
    const [isHydrated, setIsHydrated] = useState(false);
    const [stockDb, setStockDb] = useState<Record<string, StockData>>(initialStockDatabase);

    // Persistence callbacks for notifying parent context of changes
    const persistCallbacksRef = useRef<Set<() => void>>(new Set());

    // Register a callback to be called when data is persisted
    const onPersist = useCallback((callback: () => void) => {
        persistCallbacksRef.current.add(callback);
        return () => {
            persistCallbacksRef.current.delete(callback);
        };
    }, []);

    // Notify all registered callbacks
    const notifyPersist = useCallback(() => {
        persistCallbacksRef.current.forEach(callback => callback());
    }, []);

    // Load from localStorage with migration support (merge with initial)
    useEffect(() => {
        if (typeof window === "undefined") return;

        const result = loadWithMigration(stockDbMigrationConfig);

        // Merge with initial database (custom stocks override initial)
        setStockDb({ ...initialStockDatabase, ...result.data });

        // Clean up legacy keys if migration occurred
        if (result.didMigrate) {
            console.log(`Stock DB migrated from ${result.sourceKey} (v${result.sourceVersion}) to ${STORAGE_KEY}`);
            cleanupLegacyKeys(LEGACY_KEYS);
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

            // Clean up legacy keys on successful save
            for (const legacyKey of LEGACY_KEYS) {
                try {
                    localStorage.removeItem(legacyKey);
                } catch {
                    // Ignore cleanup errors
                }
            }

            notifyPersist();
        } catch (error) {
            console.error("Failed to save stock db to localStorage:", error);
        }
    }, [stockDb, isHydrated, notifyPersist]);

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
                onPersist,
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
