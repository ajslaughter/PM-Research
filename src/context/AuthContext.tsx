"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface User {
    id: string;
    email: string;
}

interface SignUpResult {
    error?: string;
    needsVerification?: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    accessToken: string | null;
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signUp: (email: string, password: string) => Promise<SignUpResult>;
    verifyOtp: (email: string, token: string) => Promise<{ error?: string }>;
    resendVerification: (email: string) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function syncSessionCookies(accessToken: string, refreshToken: string) {
    await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, refreshToken }),
    });
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email || '',
                    });
                    setAccessToken(session.access_token);
                }
            } catch {
                // Session check failed silently
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                });
                setAccessToken(session.access_token);
            } else {
                setUser(null);
                setAccessToken(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            return { error: error.message };
        }
        if (data.session) {
            setUser({
                id: data.session.user.id,
                email: data.session.user.email || '',
            });
            setAccessToken(data.session.access_token);
            await syncSessionCookies(data.session.access_token, data.session.refresh_token);
        }
        return {};
    }, []);

    const signUp = useCallback(async (email: string, password: string): Promise<SignUpResult> => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            return { error: error.message };
        }
        // If Supabase returns a session, email confirmation is disabled — log in directly
        if (data.session) {
            setUser({
                id: data.session.user.id,
                email: data.session.user.email || '',
            });
            setAccessToken(data.session.access_token);
            await syncSessionCookies(data.session.access_token, data.session.refresh_token);
            return {};
        }
        // No session means email confirmation is required
        return { needsVerification: true };
    }, []);

    const verifyOtp = useCallback(async (email: string, token: string) => {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'signup',
        });
        if (error) {
            return { error: error.message };
        }
        if (data.session) {
            setUser({
                id: data.session.user.id,
                email: data.session.user.email || '',
            });
            setAccessToken(data.session.access_token);
            await syncSessionCookies(data.session.access_token, data.session.refresh_token);
        }
        return {};
    }, []);

    const resendVerification = useCallback(async (email: string) => {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
        });
        if (error) {
            return { error: error.message };
        }
        return {};
    }, []);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setAccessToken(null);
        await fetch('/api/auth/session', { method: 'DELETE' });
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, accessToken, signIn, signUp, verifyOtp, resendVerification, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
