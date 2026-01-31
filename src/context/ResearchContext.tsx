"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { ResearchNote, researchNotes as initialResearchNotes } from "@/lib/portfolios";

interface ResearchContextType {
    researchNotes: ResearchNote[];
    addResearchNote: (note: Omit<ResearchNote, "id">) => void;
    updateResearchNote: (id: string, updates: Partial<ResearchNote>) => void;
    deleteResearchNote: (id: string) => void;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

const STORAGE_KEY = "pm-research";

export function ResearchProvider({ children }: { children: ReactNode }) {
    const [isHydrated, setIsHydrated] = useState(false);
    const [researchNotes, setResearchNotes] = useState<ResearchNote[]>(initialResearchNotes);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const savedResearch = localStorage.getItem(STORAGE_KEY);
            if (savedResearch) {
                const parsed = JSON.parse(savedResearch);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
                    setResearchNotes(parsed);
                }
            }
        } catch (error) {
            console.error("Failed to load research from localStorage:", error);
        }

        setIsHydrated(true);
    }, []);

    // Persist to localStorage
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(researchNotes));
        } catch (error) {
            console.error("Failed to save research to localStorage:", error);
        }
    }, [researchNotes, isHydrated]);

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

    return (
        <ResearchContext.Provider
            value={{
                researchNotes,
                addResearchNote,
                updateResearchNote,
                deleteResearchNote,
            }}
        >
            {children}
        </ResearchContext.Provider>
    );
}

export function useResearch() {
    const context = useContext(ResearchContext);
    if (context === undefined) {
        throw new Error("useResearch must be used within a ResearchProvider");
    }
    return context;
}
