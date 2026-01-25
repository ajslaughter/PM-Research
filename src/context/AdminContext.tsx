"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { ResearchNote, PortfolioPosition } from "@/lib/portfolios";

// Define the shape of our admin context
interface AdminContextType {
    isAdmin: boolean;
    toggleAdmin: () => void;

    // Research CRUD
    researchNotes: ResearchNote[];
    addResearchNote: (note: Omit<ResearchNote, "id">) => void;
    updateResearchNote: (id: string, updates: Partial<ResearchNote>) => void;
    deleteResearchNote: (id: string) => void;

    // Portfolio CRUD (Mag 7 + BTC)
    portfolio: PortfolioPosition[];
    addPortfolioPosition: (position: Omit<PortfolioPosition, "id">) => void;
    updatePortfolioPosition: (ticker: string, updates: Partial<PortfolioPosition>) => void;

    // Innovation Portfolio CRUD
    innovationPortfolio: PortfolioPosition[];
    addInnovationPosition: (position: Omit<PortfolioPosition, "id">) => void;
    updateInnovationPosition: (ticker: string, updates: Partial<PortfolioPosition>) => void;

    // Robotics Portfolio CRUD
    roboticsPortfolio: PortfolioPosition[];
    addRoboticsPosition: (position: Omit<PortfolioPosition, "id">) => void;
    updateRoboticsPosition: (ticker: string, updates: Partial<PortfolioPosition>) => void;

    // Data freshness
    lastUpdated: Date | null;
}

// Create the context with default values
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Import initial data
import { researchNotes as initialResearchNotes, corePortfolio as initialPortfolio, innovationPortfolio as initialInnovationPortfolio, roboticsPortfolio as initialRoboticsPortfolio } from "@/lib/portfolios";

// LocalStorage keys
const STORAGE_KEYS = {
    PORTFOLIO: "pm-portfolio",
    INNOVATION: "pm-innovation-portfolio",
    ROBOTICS: "pm-robotics-portfolio",
    RESEARCH: "pm-research",
} as const;

// Provider component that wraps the app
export function AdminProvider({ children }: { children: ReactNode }) {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Mutable data stores - initialized from mock data
    const [researchNotes, setResearchNotes] = useState<ResearchNote[]>(initialResearchNotes);
    const [portfolio, setPortfolio] = useState<PortfolioPosition[]>(initialPortfolio);
    const [innovationPortfolio, setInnovationPortfolio] = useState<PortfolioPosition[]>(initialInnovationPortfolio);
    const [roboticsPortfolio, setRoboticsPortfolio] = useState<PortfolioPosition[]>(initialRoboticsPortfolio);

    // Load data from localStorage on mount (client-side only)
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const savedPortfolio = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
            const savedResearch = localStorage.getItem(STORAGE_KEYS.RESEARCH);

            if (savedPortfolio) {
                const parsed = JSON.parse(savedPortfolio);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].ticker) {
                    setPortfolio(parsed);
                }
            }

            const savedInnovation = localStorage.getItem(STORAGE_KEYS.INNOVATION);
            if (savedInnovation) {
                const parsed = JSON.parse(savedInnovation);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].ticker) {
                    setInnovationPortfolio(parsed);
                }
            }

            const savedRobotics = localStorage.getItem(STORAGE_KEYS.ROBOTICS);
            if (savedRobotics) {
                const parsed = JSON.parse(savedRobotics);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].ticker) {
                    setRoboticsPortfolio(parsed);
                }
            }

            if (savedResearch) {
                const parsed = JSON.parse(savedResearch);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
                    setResearchNotes(parsed);
                }
            }
        } catch (error) {
            console.error("Failed to load from localStorage:", error);
        }

        setIsHydrated(true);
        setLastUpdated(new Date());
    }, []);

    // Persist portfolio to localStorage whenever it changes (after hydration)
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;

        try {
            localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to save portfolio to localStorage:", error);
        }
    }, [portfolio, isHydrated]);

    // Persist research to localStorage whenever it changes (after hydration)
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;

        try {
            localStorage.setItem(STORAGE_KEYS.RESEARCH, JSON.stringify(researchNotes));
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to save research to localStorage:", error);
        }
    }, [researchNotes, isHydrated]);

    // Persist innovation portfolio to localStorage whenever it changes (after hydration)
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;

        try {
            localStorage.setItem(STORAGE_KEYS.INNOVATION, JSON.stringify(innovationPortfolio));
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to save innovation portfolio to localStorage:", error);
        }
    }, [innovationPortfolio, isHydrated]);

    // Persist robotics portfolio to localStorage whenever it changes (after hydration)
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;

        try {
            localStorage.setItem(STORAGE_KEYS.ROBOTICS, JSON.stringify(roboticsPortfolio));
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to save robotics portfolio to localStorage:", error);
        }
    }, [roboticsPortfolio, isHydrated]);

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
            id: `r${Date.now()}`, // Generate unique ID
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
    const addPortfolioPosition = useCallback((position: Omit<PortfolioPosition, "id">) => {
        const newPosition: PortfolioPosition = {
            ...position,
            id: position.ticker, // Use ticker as ID
        };
        setPortfolio((prev) => [...prev, newPosition]);
    }, []);

    const updatePortfolioPosition = useCallback((ticker: string, updates: Partial<PortfolioPosition>) => {
        setPortfolio((prev) =>
            prev.map((position) =>
                position.ticker === ticker ? { ...position, ...updates } : position
            )
        );
    }, []);

    // Innovation Portfolio CRUD operations
    const addInnovationPosition = useCallback((position: Omit<PortfolioPosition, "id">) => {
        const newPosition: PortfolioPosition = {
            ...position,
            id: position.ticker,
        };
        setInnovationPortfolio((prev) => [...prev, newPosition]);
    }, []);

    const updateInnovationPosition = useCallback((ticker: string, updates: Partial<PortfolioPosition>) => {
        setInnovationPortfolio((prev) =>
            prev.map((position) =>
                position.ticker === ticker ? { ...position, ...updates } : position
            )
        );
    }, []);

    // Robotics Portfolio CRUD operations
    const addRoboticsPosition = useCallback((position: Omit<PortfolioPosition, "id">) => {
        const newPosition: PortfolioPosition = {
            ...position,
            id: position.ticker,
        };
        setRoboticsPortfolio((prev) => [...prev, newPosition]);
    }, []);

    const updateRoboticsPosition = useCallback((ticker: string, updates: Partial<PortfolioPosition>) => {
        setRoboticsPortfolio((prev) =>
            prev.map((position) =>
                position.ticker === ticker ? { ...position, ...updates } : position
            )
        );
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
                portfolio,
                addPortfolioPosition,
                updatePortfolioPosition,
                innovationPortfolio,
                addInnovationPosition,
                updateInnovationPosition,
                roboticsPortfolio,
                addRoboticsPosition,
                updateRoboticsPosition,
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
