"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Lock } from "lucide-react";
import Link from "next/link";

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 px-4 sm:px-0 sm:mx-0"
                    >
                        <div className="pm-card border-pm-purple/50 relative">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-pm-muted hover:text-pm-text transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Content */}
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-pm-purple/20 flex items-center justify-center mx-auto mb-6">
                                    <Lock className="w-8 h-8 text-pm-purple" />
                                </div>

                                <h3 className="text-2xl font-bold mb-3">Premium Content</h3>
                                <p className="text-pm-muted mb-6">
                                    This research analysis requires an active subscription. Unlock
                                    full access to our predictive insights and alpha signals.
                                </p>

                                <div className="flex flex-col gap-3">
                                    <Link href="/pricing" className="btn-primary w-full justify-center">
                                        View Subscription Plans
                                    </Link>
                                    <button onClick={onClose} className="btn-ghost">
                                        Maybe Later
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
