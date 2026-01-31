"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from "react";
import { ResearchNote, researchNotes as initialResearchNotes } from "@/lib/portfolios";
import {
    loadWithMigration,
    saveWithCleanup,
    cleanupLegacyKeys,
    isValidResearchArray,
    researchMigrations,
    MigrationConfig,
} from "@/lib/migrationUtils";

interface ResearchContextType {
    researchNotes: ResearchNote[];
    addResearchNote: (note: Omit<ResearchNote, "id">) => void;
    updateResearchNote: (id: string, updates: Partial<ResearchNote>) => void;
    deleteResearchNote: (id: string) => void;

    // Persistence callback registration
    onPersist: (callback: () => void) => () => void;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

// Storage configuration
const STORAGE_KEY = "pm-research-v2";
const LEGACY_KEYS = ["pm-research", "pm-research-v1"];

const researchMigrationConfig: MigrationConfig<ResearchNote[]> = {
    currentKey: STORAGE_KEY,
    currentVersion: 2,
    legacyKeys: LEGACY_KEYS,
    defaultValue: initialResearchNotes,
    validate: isValidResearchArray as (data: unknown) => data is ResearchNote[],
    migrations: researchMigrations,
};

export function ResearchProvider({ children }: { children: ReactNode }) {
    const [isHydrated, setIsHydrated] = useState(false);
    const [researchNotes, setResearchNotes] = useState<ResearchNote[]>(initialResearchNotes);

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

        const result = loadWithMigration(researchMigrationConfig);
        setResearchNotes(result.data);

        // Clean up legacy keys if migration occurred
        if (result.didMigrate) {
            console.log(`Research migrated from ${result.sourceKey} (v${result.sourceVersion}) to ${STORAGE_KEY}`);
            cleanupLegacyKeys(LEGACY_KEYS);
        }

        setIsHydrated(true);
    }, []);

    // Persist to localStorage
    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;

        const success = saveWithCleanup(STORAGE_KEY, researchNotes, LEGACY_KEYS);
        if (success) {
            notifyPersist();
        }
    }, [researchNotes, isHydrated, notifyPersist]);

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
                onPersist,
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
