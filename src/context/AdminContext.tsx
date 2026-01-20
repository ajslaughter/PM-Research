"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ResearchNote, PortfolioPosition } from "@/lib/mockData";

// Define the shape of our admin context
interface AdminContextType {
    isAdmin: boolean;
    toggleAdmin: () => void;

    // Research CRUD
    researchNotes: ResearchNote[];
    addResearchNote: (note: Omit<ResearchNote, "id">) => void;
    updateResearchNote: (id: string, updates: Partial<ResearchNote>) => void;
    deleteResearchNote: (id: string) => void;

    // Portfolio CRUD
    portfolio: PortfolioPosition[];
    updatePortfolioPosition: (ticker: string, updates: Partial<PortfolioPosition>) => void;
}

// Create the context with default values
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Import initial data
import { mockResearchNotes as initialResearchNotes, mockPortfolio as initialPortfolio } from "@/lib/mockData";

// Provider component that wraps the app
export function AdminProvider({ children }: { children: ReactNode }) {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    // Mutable data stores - initialized from mock data
    const [researchNotes, setResearchNotes] = useState<ResearchNote[]>(initialResearchNotes);
    const [portfolio, setPortfolio] = useState<PortfolioPosition[]>(initialPortfolio);

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
    const addResearchNote = (note: Omit<ResearchNote, "id">) => {
        const newNote: ResearchNote = {
            ...note,
            id: `r${Date.now()}`, // Generate unique ID
        };
        setResearchNotes((prev) => [newNote, ...prev]);
    };

    const updateResearchNote = (id: string, updates: Partial<ResearchNote>) => {
        setResearchNotes((prev) =>
            prev.map((note) => (note.id === id ? { ...note, ...updates } : note))
        );
    };

    const deleteResearchNote = (id: string) => {
        setResearchNotes((prev) => prev.filter((note) => note.id !== id));
    };

    // Portfolio CRUD operations
    const updatePortfolioPosition = (ticker: string, updates: Partial<PortfolioPosition>) => {
        setPortfolio((prev) =>
            prev.map((position) =>
                position.ticker === ticker ? { ...position, ...updates } : position
            )
        );
    };

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
                updatePortfolioPosition,
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
