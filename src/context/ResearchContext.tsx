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

const STORAGE_KEY = "pm-research";

export function ResearchProvider({ children }: { children: ReactNode }) {
    const [isHydrated, setIsHydrated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [researchNotes, setResearchNotes] = useState<ResearchNote[]>(initialResearchNotes);
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

    // Load from localStorage and Supabase on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        const init = async () => {
            // Load from localStorage first
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

            // Then try Supabase
            await refreshFromSupabase();

            setIsHydrated(true);
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

    // Combine hardcoded/localStorage notes with Supabase notes
    const combinedNotes = React.useMemo(() => {
        // Normalize Supabase notes (already normalized in dbToResearchNote, but belt-and-suspenders)
        const normalizedSupabase = supabaseNotes.map(normalizeNote);
        // Get IDs from Supabase notes to avoid duplicates
        const supabaseIds = new Set(normalizedSupabase.map(n => n.id));
        // Filter out any local notes that exist in Supabase (by title match as fallback)
        const supabaseTitles = new Set(normalizedSupabase.map(n => n.title));

        const localOnly = researchNotes
            .map(normalizeNote)
            .filter(n => !supabaseIds.has(n.id) && !supabaseTitles.has(n.title));

        return [...normalizedSupabase, ...localOnly];
    }, [researchNotes, supabaseNotes, normalizeNote]);

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
    const addResearchNote = useCallback(async (note: Omit<ResearchNote, "id">) => {
        const newNote: ResearchNote = {
            ...note,
            id: `r${Date.now()}`,
            readTime: note.readTime || `${Math.ceil((note.fullContent?.split(' ').length || 0) / 200)} min`,
        };

        // Add to local state immediately
        setResearchNotes((prev) => [newNote, ...prev]);

        // Try to save to Supabase
        try {
            const saved = await saveResearchNote(note);
            if (saved) {
                // Replace with Supabase version (has proper ID)
                setSupabaseNotes((prev) => [saved, ...prev]);
            }
        } catch (error) {
            console.error("Failed to save to Supabase:", error);
        }
    }, []);

    const updateResearchNote = useCallback((id: string, updates: Partial<ResearchNote>) => {
        setResearchNotes((prev) =>
            prev.map((note) => (note.id === id ? { ...note, ...updates } : note))
        );
        setSupabaseNotes((prev) =>
            prev.map((note) => (note.id === id ? { ...note, ...updates } : note))
        );
    }, []);

    const deleteResearchNote = useCallback(async (id: string) => {
        setResearchNotes((prev) => prev.filter((note) => note.id !== id));
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
