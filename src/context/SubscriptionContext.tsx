"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

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
// NOTE: Website is now 100% free - all users are treated as subscribed
export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const [isSubscribed, setIsSubscribed] = useState<boolean>(true);
    const [subscriptionTier, setSubscriptionTier] = useState<
        "guest" | "observer" | "operator"
    >("operator");

    // Toggle function for testing subscriber views
    const toggleSubscription = () => {
        setIsSubscribed((prev) => !prev);
        // When toggling, also update the tier
        setSubscriptionTier((prev) => (prev === "guest" ? "operator" : "guest"));
    };

    return (
        <SubscriptionContext.Provider
            value={{
                isSubscribed,
                toggleSubscription,
                subscriptionTier,
                setSubscriptionTier,
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
