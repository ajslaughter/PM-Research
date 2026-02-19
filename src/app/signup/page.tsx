"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    UserPlus,
    Mail,
    Lock,
    Loader2,
    AlertCircle,
    CheckCircle,
    KeyRound,
    ArrowLeft,
    RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

type Step = "create" | "verify" | "success";

function SignUpForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [step, setStep] = useState<Step>("create");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);
    const otpInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/watchlist";
    const { signUp, verifyOtp, resendVerification } = useAuth();

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const result = await signUp(email, password);
            if (result.error) {
                setError(result.error);
            } else if (result.needsVerification) {
                setStep("verify");
                startResendCooldown();
                setTimeout(() => otpInputRef.current?.focus(), 100);
            } else {
                // No verification needed — account confirmed, redirect
                setStep("success");
                setTimeout(() => router.push(redirectTo), 1000);
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const code = otpCode.trim();
        if (code.length !== 6) {
            setError("Please enter the 6-digit code from your email");
            return;
        }

        setIsLoading(true);

        try {
            const result = await verifyOtp(email, code);
            if (result.error) {
                setError(result.error);
            } else {
                setStep("success");
                setTimeout(() => router.push(redirectTo), 1000);
            }
        } catch {
            setError("Verification failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;
        setError(null);
        setIsLoading(true);

        try {
            const result = await resendVerification(email);
            if (result.error) {
                setError(result.error);
            } else {
                startResendCooldown();
            }
        } catch {
            setError("Failed to resend code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const startResendCooldown = () => {
        setResendCooldown(60);
        const interval = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleOtpInput = (value: string) => {
        // Only allow digits, max 6
        const digits = value.replace(/\D/g, "").slice(0, 6);
        setOtpCode(digits);
    };

    // ─── Step: Success ──────────────────────────────────────────────
    if (step === "success") {
        return (
            <div className="relative min-h-screen flex items-center justify-center">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full max-w-md px-6"
                >
                    <div className="pm-card text-center py-12">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.1 }}
                        >
                            <CheckCircle className="w-16 h-16 text-pm-green mx-auto mb-4" />
                        </motion.div>
                        <h1 className="text-2xl font-bold mb-2">Account Verified</h1>
                        <p className="text-pm-muted text-sm">
                            Redirecting to your watchlist...
                        </p>
                        <Loader2 className="w-5 h-5 animate-spin text-pm-green mx-auto mt-4" />
                    </div>
                </motion.div>
            </div>
        );
    }

    // ─── Step: Verify Email Code ────────────────────────────────────
    if (step === "verify") {
        return (
            <div className="relative min-h-screen flex items-center justify-center">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative w-full max-w-md px-6"
                >
                    <div className="pm-card">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-lg bg-pm-purple/10 flex items-center justify-center">
                                <KeyRound className="w-6 h-6 text-pm-purple" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Check Your Email</h1>
                                <p className="text-pm-muted text-sm">
                                    Enter the 6-digit code we sent to
                                </p>
                            </div>
                        </div>

                        {/* Email Display */}
                        <div className="mb-6 p-3 bg-pm-charcoal/50 border border-pm-border rounded-lg flex items-center gap-2">
                            <Mail className="w-4 h-4 text-pm-green flex-shrink-0" />
                            <span className="text-sm text-pm-text font-mono truncate">{email}</span>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </motion.div>
                        )}

                        {/* OTP Form */}
                        <form onSubmit={handleVerifyCode} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-pm-text mb-2">
                                    Verification Code
                                </label>
                                <input
                                    ref={otpInputRef}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    value={otpCode}
                                    onChange={(e) => handleOtpInput(e.target.value)}
                                    placeholder="000000"
                                    maxLength={6}
                                    disabled={isLoading}
                                    className="w-full px-4 py-4 bg-pm-black border border-pm-border rounded-lg text-pm-text text-center text-2xl font-mono tracking-[0.5em] placeholder:text-pm-muted/30 focus:outline-none focus:border-pm-green transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || otpCode.length !== 6}
                                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Verify Email
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Resend & Back */}
                        <div className="mt-6 space-y-3">
                            <button
                                onClick={handleResendCode}
                                disabled={resendCooldown > 0 || isLoading}
                                className="w-full flex items-center justify-center gap-2 text-sm text-pm-muted hover:text-pm-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw className="w-4 h-4" />
                                {resendCooldown > 0
                                    ? `Resend code in ${resendCooldown}s`
                                    : "Resend verification code"
                                }
                            </button>
                            <button
                                onClick={() => {
                                    setStep("create");
                                    setError(null);
                                    setOtpCode("");
                                }}
                                className="w-full flex items-center justify-center gap-2 text-sm text-pm-muted hover:text-pm-text transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Use a different email
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ─── Step: Create Account ───────────────────────────────────────
    return (
        <div className="relative min-h-screen flex items-center justify-center">
            <div className="absolute inset-0 grid-bg opacity-30" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md px-6"
            >
                <div className="pm-card">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-lg bg-pm-green/10 flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-pm-green" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Create Account</h1>
                            <p className="text-pm-muted text-sm">Sign up to create your own watchlist</p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </motion.div>
                    )}

                    {/* Sign Up Form */}
                    <form onSubmit={handleCreateAccount} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-pm-text mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pm-muted" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    disabled={isLoading}
                                    className="w-full pl-11 pr-4 py-3 bg-pm-black border border-pm-border rounded-lg text-pm-text placeholder:text-pm-muted focus:outline-none focus:border-pm-green transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-pm-text mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pm-muted" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    required
                                    minLength={6}
                                    disabled={isLoading}
                                    className="w-full pl-11 pr-4 py-3 bg-pm-black border border-pm-border rounded-lg text-pm-text placeholder:text-pm-muted focus:outline-none focus:border-pm-green transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-pm-text mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pm-muted" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    required
                                    minLength={6}
                                    disabled={isLoading}
                                    className="w-full pl-11 pr-4 py-3 bg-pm-black border border-pm-border rounded-lg text-pm-text placeholder:text-pm-muted focus:outline-none focus:border-pm-green transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-pm-muted">
                        Already have an account?{" "}
                        <Link
                            href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
                            className="text-pm-green hover:underline"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

function SignUpLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-pm-green" />
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<SignUpLoading />}>
            <SignUpForm />
        </Suspense>
    );
}
