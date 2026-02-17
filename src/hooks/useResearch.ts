"use client";

import { useCallback } from "react";
import { useAdmin } from "@/context/AdminContext";
import { ResearchNote } from "@/lib/watchlists";

interface UseResearchReturn {
    researchNotes: ResearchNote[];
    addResearchNote: (note: Omit<ResearchNote, "id">) => void;
    updateResearchNote: (id: string, updates: Partial<ResearchNote>) => void;
    deleteResearchNote: (id: string) => void;
    getResearchNote: (id: string) => ResearchNote | undefined;
    getResearchByCategory: (category: string) => ResearchNote[];
    getResearchByTicker: (ticker: string) => ResearchNote[];
}

/**
 * Custom hook for managing research notes.
 * Provides CRUD operations and utility functions for filtering research.
 */
export function useResearch(): UseResearchReturn {
    const {
        researchNotes,
        addResearchNote,
        updateResearchNote,
        deleteResearchNote,
    } = useAdmin();

    // Get a single research note by ID
    const getResearchNote = useCallback((id: string): ResearchNote | undefined => {
        return researchNotes.find((note) => note.id === id);
    }, [researchNotes]);

    // Get all research notes for a specific category
    const getResearchByCategory = useCallback((category: string): ResearchNote[] => {
        return researchNotes.filter((note) => note.category === category);
    }, [researchNotes]);

    // Get all research notes mentioning a specific ticker
    const getResearchByTicker = useCallback((ticker: string): ResearchNote[] => {
        const upperTicker = ticker.toUpperCase();
        return researchNotes.filter((note) =>
            note.relatedTickers?.some((t) => t.toUpperCase() === upperTicker)
        );
    }, [researchNotes]);

    return {
        researchNotes,
        addResearchNote,
        updateResearchNote,
        deleteResearchNote,
        getResearchNote,
        getResearchByCategory,
        getResearchByTicker,
    };
}
