"use client";

import React, { createContext, useContext, ReactNode } from "react";

// Define the shape of our subscription context
interface SubscriptionContextType {
    isSubscribed: boolean;
    toggleSubscription: () => void;
    subscriptionTier: "guest" | "observer" | "operator";
    setSubscriptionTier: (tier: "guest" | "observer" | "operator") => void;
}

// Create the context with default values
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
    undefined
);

// Provider component that wraps the app
// Website is 100% free - all users always have full access
export function SubscriptionProvider({ children }: { children: ReactNode }) {
    return (
        <SubscriptionContext.Provider
            value={{
                isSubscribed: true,
                toggleSubscription: () => {},
                subscriptionTier: "operator",
                setSubscriptionTier: () => {},
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
}

// Custom hook for accessing subscription state
export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error(
            "useSubscription must be used within a SubscriptionProvider"
        );
    }
    return context;
}
