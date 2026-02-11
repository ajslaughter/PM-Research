"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { ResearchNote, researchNotes as initialResearchNotes } from "@/lib/portfolios";
import { fetchResearchNotes, saveResearchNote, deleteResearchNote as deleteFromSupabase, normalizeCategory, normalizeTitle, normalizeContent } from "@/lib/supabase";

interface ResearchContextType {
    researchNotes: ResearchNote[];
    addResearchNote: (note: Omit<ResearchNote, "id">) => void;
    updateResearchNote: (id: string, updates: Partial<ResearchNote>) => void;
    deleteResearchNote: (id: string) => void;
    refreshFromSupabase: () => Promise<void>;
    isLoading: boolean;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

export function ResearchProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [supabaseNotes, setSupabaseNotes] = useState<ResearchNote[]>([]);

    // Fetch from Supabase on mount
    const refreshFromSupabase = useCallback(async () => {
        try {
            const notes = await fetchResearchNotes();
            if (notes.length > 0) {
                setSupabaseNotes(notes);
            }
        } catch (error) {
            console.error("Failed to fetch from Supabase:", error);
        }
    }, []);

    // Fetch from Supabase on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        const init = async () => {
            await refreshFromSupabase();
            setIsLoading(false);
        };

        init();
    }, [refreshFromSupabase]);

    // Normalize a note to fix legacy categories, titles, and content
    const normalizeNote = useCallback((note: ResearchNote): ResearchNote => ({
        ...note,
        category: normalizeCategory(note.category),
        title: normalizeTitle(note.title),
        fullContent: normalizeContent(note.fullContent),
    }), []);

    // Combine hardcoded defaults with Supabase notes (no localStorage)
    const combinedNotes = React.useMemo(() => {
        const normalizedSupabase = supabaseNotes.map(normalizeNote);
        const supabaseIds = new Set(normalizedSupabase.map(n => n.id));
        const supabaseTitles = new Set(normalizedSupabase.map(n => n.title));

        const localOnly = initialResearchNotes
            .map(normalizeNote)
            .filter(n => !supabaseIds.has(n.id) && !supabaseTitles.has(n.title));

        return [...normalizedSupabase, ...localOnly];
    }, [supabaseNotes, normalizeNote]);

    // Research CRUD operations
    const addResearchNote = useCallback(async (note: Omit<ResearchNote, "id">) => {
        const newNote: ResearchNote = {
            ...note,
            id: `r${Date.now()}`,
            readTime: note.readTime || `${Math.ceil((note.fullContent?.split(' ').length || 0) / 200)} min`,
        };

        // Try to save to Supabase
        try {
            const saved = await saveResearchNote(note);
            if (saved) {
                setSupabaseNotes((prev) => [saved, ...prev]);
                return;
            }
        } catch (error) {
            console.error("Failed to save to Supabase:", error);
        }

        // Fallback: add to Supabase notes state directly
        setSupabaseNotes((prev) => [newNote, ...prev]);
    }, []);

    const updateResearchNote = useCallback((id: string, updates: Partial<ResearchNote>) => {
        setSupabaseNotes((prev) =>
            prev.map((note) => (note.id === id ? { ...note, ...updates } : note))
        );
    }, []);

    const deleteResearchNote = useCallback(async (id: string) => {
        setSupabaseNotes((prev) => prev.filter((note) => note.id !== id));

        // Try to delete from Supabase
        try {
            await deleteFromSupabase(id);
        } catch (error) {
            console.error("Failed to delete from Supabase:", error);
        }
    }, []);

    return (
        <ResearchContext.Provider
            value={{
                researchNotes: combinedNotes,
                addResearchNote,
                updateResearchNote,
                deleteResearchNote,
                refreshFromSupabase,
                isLoading,
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
