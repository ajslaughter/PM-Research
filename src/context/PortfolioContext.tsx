"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from "react";
import { Portfolio, defaultPortfolios } from "@/lib/portfolios";
import {
    loadWithMigration,
    saveWithCleanup,
    cleanupLegacyKeys,
    isValidPortfolioArray,
    portfolioMigrations,
    MigrationConfig,
} from "@/lib/migrationUtils";

interface PortfolioContextType {
    portfolios: Portfolio[];
    activePortfolioId: string;
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

    // Persistence callback registration
    onPersist: (callback: () => void) => () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// Storage configuration
const STORAGE_KEY = "pm-portfolios-v3";
const ACTIVE_PORTFOLIO_KEY = "pm-active-portfolio";
const LEGACY_KEYS = ["pm-portfolios", "pm-portfolios-v1", "pm-portfolios-v2"];

const portfolioMigrationConfig: MigrationConfig<Portfolio[]> = {
    currentKey: STORAGE_KEY,
    currentVersion: 3,
    legacyKeys: LEGACY_KEYS,
    defaultValue: defaultPortfolios,
    validate: isValidPortfolioArray as (data: unknown) => data is Portfolio[],
    migrations: portfolioMigrations,
};

export function PortfolioProvider({ children }: { children: ReactNode }) {
    const [isHydrated, setIsHydrated] = useState(false);
    const [portfolios, setPortfolios] = useState<Portfolio[]>(defaultPortfolios);
    const [activePortfolioId, setActivePortfolioId] = useState<string>("pm-research");

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

    // Load from localStorage with migration support
    useEffect(() => {
        if (typeof window === "undefined") return;

        const result = loadWithMigration(portfolioMigrationConfig);
        setPortfolios(result.data);

        // Clean up legacy keys if migration occurred
        if (result.didMigrate) {
            console.log(`Portfolios migrated from ${result.sourceKey} (v${result.sourceVersion}) to ${STORAGE_KEY}`);
            cleanupLegacyKeys(LEGACY_KEYS);
        }

        // Load active portfolio
        try {
            const savedActivePortfolio = localStorage.getItem(ACTIVE_PORTFOLIO_KEY);
            if (savedActivePortfolio) {
                setActivePortfolioId(savedActivePortfolio);
            }
        } catch (error) {
            console.error("Failed to load active portfolio from localStorage:", error);
        }

        setIsHydrated(true);
    }, []);

    // Persist portfolios to localStorage
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;

        const success = saveWithCleanup(STORAGE_KEY, portfolios, LEGACY_KEYS);
        if (success) {
            notifyPersist();
        }
    }, [portfolios, isHydrated, notifyPersist]);

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
    const addPortfolio = useCallback((name: string, description: string) => {
        const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        setPortfolios((prev) => [...prev, { id, name, description, positions: [] }]);
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
                onPersist,
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
