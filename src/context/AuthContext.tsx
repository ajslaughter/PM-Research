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

/** Check if an error message indicates a network-level failure */
function isNetworkError(message: string): boolean {
    const lower = message.toLowerCase();
    return lower === 'failed to fetch' ||
        lower.includes('networkerror') ||
        lower.includes('network request failed') ||
        lower.includes('load failed');
}

/** Map raw auth errors to user-friendly messages */
function friendlyAuthError(message: string): string {
    if (isNetworkError(message)) {
        return 'Unable to reach the authentication server. Please check your connection and try again.';
    }
    if (message.includes('User already registered')) {
        return 'An account with this email already exists. Try signing in instead.';
    }
    if (message.includes('Email rate limit exceeded') || message.includes('too many requests')) {
        return 'Too many attempts. Please wait a minute before trying again.';
    }
    if (message.includes('Invalid login credentials')) {
        return 'Invalid email or password.';
    }
    return message;
}

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
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    if (attempt === 0 && isNetworkError(error.message)) {
                        await new Promise(r => setTimeout(r, 1500));
                        continue;
                    }
                    return { error: friendlyAuthError(error.message) };
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
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unexpected error occurred';
                if (attempt === 0 && isNetworkError(message)) {
                    await new Promise(r => setTimeout(r, 1500));
                    continue;
                }
                return { error: friendlyAuthError(message) };
            }
        }
        return { error: friendlyAuthError('Failed to fetch') };
    }, []);

    const signUp = useCallback(async (email: string, password: string): Promise<SignUpResult> => {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) {
                    if (attempt === 0 && isNetworkError(error.message)) {
                        await new Promise(r => setTimeout(r, 1500));
                        continue;
                    }
                    return { error: friendlyAuthError(error.message) };
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
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unexpected error occurred';
                if (attempt === 0 && isNetworkError(message)) {
                    await new Promise(r => setTimeout(r, 1500));
                    continue;
                }
                return { error: friendlyAuthError(message) };
            }
        }
        return { error: friendlyAuthError('Failed to fetch') };
    }, []);

    const verifyOtp = useCallback(async (email: string, token: string) => {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const { data, error } = await supabase.auth.verifyOtp({
                    email,
                    token,
                    type: 'signup',
                });
                if (error) {
                    if (attempt === 0 && isNetworkError(error.message)) {
                        await new Promise(r => setTimeout(r, 1500));
                        continue;
                    }
                    return { error: friendlyAuthError(error.message) };
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
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unexpected error occurred';
                if (attempt === 0 && isNetworkError(message)) {
                    await new Promise(r => setTimeout(r, 1500));
                    continue;
                }
                return { error: friendlyAuthError(message) };
            }
        }
        return { error: friendlyAuthError('Failed to fetch') };
    }, []);

    const resendVerification = useCallback(async (email: string) => {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email,
                });
                if (error) {
                    if (attempt === 0 && isNetworkError(error.message)) {
                        await new Promise(r => setTimeout(r, 1500));
                        continue;
                    }
                    return { error: friendlyAuthError(error.message) };
                }
                return {};
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unexpected error occurred';
                if (attempt === 0 && isNetworkError(message)) {
                    await new Promise(r => setTimeout(r, 1500));
                    continue;
                }
                return { error: friendlyAuthError(message) };
            }
        }
        return { error: friendlyAuthError('Failed to fetch') };
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
