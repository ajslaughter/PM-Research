"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type Tier = "guest" | "observer" | "operator";

interface SubscriptionContextType {
    isSubscribed: boolean;
    toggleSubscription: () => void;
    subscriptionTier: Tier;
    setSubscriptionTier: (tier: Tier) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
    undefined
);

// Map profile tier strings to app tier type
function toAppTier(dbTier: string | null): Tier {
    if (dbTier === "observer" || dbTier === "operator") return dbTier;
    // "free" tier maps to "observer" — full read access, gated premium features later
    return "observer";
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [tier, setTier] = useState<Tier>("guest");

    useEffect(() => {
        if (!user) {
            setTier("guest");
            return;
        }

        let cancelled = false;

        async function fetchProfile() {
            const { data, error } = await supabase
                .from("profiles")
                .select("tier")
                .eq("id", user!.id)
                .single();

            if (cancelled) return;

            if (error || !data) {
                // Profile doesn't exist yet (trigger may not have run, or table not created)
                // Default free users to observer-level access
                setTier("observer");
                return;
            }

            setTier(toAppTier(data.tier));
        }

        fetchProfile();

        return () => { cancelled = true; };
    }, [user]);

    return (
        <SubscriptionContext.Provider
            value={{
                isSubscribed: tier !== "guest",
                toggleSubscription: () => {},
                subscriptionTier: tier,
                setSubscriptionTier: setTier,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error(
            "useSubscription must be used within a SubscriptionProvider"
        );
    }
    return context;
}
