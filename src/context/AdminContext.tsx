"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { ResearchNote, Portfolio, PortfolioPosition, defaultPortfolios, researchNotes as initialResearchNotes } from "@/lib/portfolios";
import { StockData, stockDatabase as initialStockDatabase } from "@/data/stockDatabase";

// Define the shape of our admin context
interface AdminContextType {
    isAdmin: boolean;
    toggleAdmin: () => void;

    // Research CRUD
    researchNotes: ResearchNote[];
    addResearchNote: (note: Omit<ResearchNote, "id">) => void;
    updateResearchNote: (id: string, updates: Partial<ResearchNote>) => void;
    deleteResearchNote: (id: string) => void;

    // Portfolio management
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

    // Stock database
    stockDb: Record<string, StockData>;
    addStock: (stock: StockData) => void;
    updateStock: (ticker: string, updates: Partial<StockData>) => void;

    // Data freshness
    lastUpdated: Date | null;
}

// Create the context with default values
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// LocalStorage keys - bump version to force refresh of defaults
const STORAGE_KEYS = {
    PORTFOLIOS: "pm-portfolios-v3",
    STOCK_DB: "pm-stock-db",
    RESEARCH: "pm-research",
    ACTIVE_PORTFOLIO: "pm-active-portfolio",
} as const;

// Provider component that wraps the app
export function AdminProvider({ children }: { children: ReactNode }) {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Mutable data stores
    const [researchNotes, setResearchNotes] = useState<ResearchNote[]>(initialResearchNotes);
    const [portfolios, setPortfolios] = useState<Portfolio[]>(defaultPortfolios);
    const [activePortfolioId, setActivePortfolioId] = useState<string>("pm-research");
    const [stockDb, setStockDb] = useState<Record<string, StockData>>(initialStockDatabase);

    // Load data from localStorage on mount (client-side only)
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            // Load portfolios
            const savedPortfolios = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
            if (savedPortfolios) {
                const parsed = JSON.parse(savedPortfolios);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].positions) {
                    setPortfolios(parsed);
                }
            }

            // Load stock database (merge with initial)
            const savedStockDb = localStorage.getItem(STORAGE_KEYS.STOCK_DB);
            if (savedStockDb) {
                const parsed = JSON.parse(savedStockDb);
                if (typeof parsed === 'object' && parsed !== null) {
                    setStockDb({ ...initialStockDatabase, ...parsed });
                }
            }

            // Load research notes
            const savedResearch = localStorage.getItem(STORAGE_KEYS.RESEARCH);
            if (savedResearch) {
                const parsed = JSON.parse(savedResearch);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
                    setResearchNotes(parsed);
                }
            }

            // Load active portfolio
            const savedActivePortfolio = localStorage.getItem(STORAGE_KEYS.ACTIVE_PORTFOLIO);
            if (savedActivePortfolio) {
                setActivePortfolioId(savedActivePortfolio);
            }
        } catch (error) {
            console.error("Failed to load from localStorage:", error);
        }

        setIsHydrated(true);
        setLastUpdated(new Date());
    }, []);

    // Persist portfolios to localStorage
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;
        try {
            localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios));
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to save portfolios to localStorage:", error);
        }
    }, [portfolios, isHydrated]);

    // Persist stock database to localStorage
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;
        try {
            // Only save stocks that differ from initial
            const customStocks: Record<string, StockData> = {};
            for (const [ticker, data] of Object.entries(stockDb)) {
                if (!initialStockDatabase[ticker] || JSON.stringify(data) !== JSON.stringify(initialStockDatabase[ticker])) {
                    customStocks[ticker] = data;
                }
            }
            localStorage.setItem(STORAGE_KEYS.STOCK_DB, JSON.stringify(customStocks));
        } catch (error) {
            console.error("Failed to save stock db to localStorage:", error);
        }
    }, [stockDb, isHydrated]);

    // Persist research to localStorage
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;
        try {
            localStorage.setItem(STORAGE_KEYS.RESEARCH, JSON.stringify(researchNotes));
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to save research to localStorage:", error);
        }
    }, [researchNotes, isHydrated]);

    // Persist active portfolio
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;
        try {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_PORTFOLIO, activePortfolioId);
        } catch (error) {
            console.error("Failed to save active portfolio to localStorage:", error);
        }
    }, [activePortfolioId, isHydrated]);

    // Toggle admin mode
    const toggleAdmin = () => {
        setIsAdmin((prev) => !prev);
    };

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
    }, []);

    // Research CRUD operations
    const addResearchNote = useCallback((note: Omit<ResearchNote, "id">) => {
        const newNote: ResearchNote = {
            ...note,
            id: `r${Date.now()}`,
        };
        setResearchNotes((prev) => [newNote, ...prev]);
    }, []);

    const updateResearchNote = useCallback((id: string, updates: Partial<ResearchNote>) => {
        setResearchNotes((prev) =>
            prev.map((note) => (note.id === id ? { ...note, ...updates } : note))
        );
    }, []);

    const deleteResearchNote = useCallback((id: string) => {
        setResearchNotes((prev) => prev.filter((note) => note.id !== id));
    }, []);

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
            // If we deleted the active portfolio, switch to the first one
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
            // Don't add if already exists
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
        <AdminContext.Provider
            value={{
                isAdmin,
                toggleAdmin,
                researchNotes,
                addResearchNote,
                updateResearchNote,
                deleteResearchNote,
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
                stockDb,
                addStock,
                updateStock,
                lastUpdated,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
}

// Custom hook for accessing admin state
export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
}
