"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ResearchFeed from "@/components/ResearchFeed";
import { useSubscription } from "@/context/SubscriptionContext";
import { BookOpen, Lock, Unlock, Filter, Info } from "lucide-react";

export default function ResearchPage() {
    const { isSubscribed } = useSubscription();
    const [activeCategory, setActiveCategory] = useState("All");

    return (
        <div className="relative min-h-screen pb-20 md:pb-0">
            {/* Grid Background */}
            <div className="absolute inset-0 grid-bg opacity-30" />

            {/* Glow Effects */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-pm-purple/5 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-start justify-between flex-wrap gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-pm-purple/10 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-pm-purple" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold">The Feed</h1>
                                <p className="text-pm-muted">PM Research Analysis Hub</p>
                            </div>
                        </div>

                        {/* Status & Filters */}
                        <div className="flex items-center gap-4">
                            <div
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${isSubscribed
                                        ? "bg-pm-green/10 border-pm-green/30 text-pm-green"
                                        : "bg-pm-charcoal border-pm-border text-pm-muted"
                                    }`}
                            >
                                {isSubscribed ? (
                                    <>
                                        <Unlock className="w-4 h-4" />
                                        <span className="font-mono text-sm">FULL ACCESS</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        <span className="font-mono text-sm">LIMITED ACCESS</span>
                                    </>
                                )}
                            </div>

                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-pm-border text-pm-muted hover:text-pm-text hover:border-pm-subtle transition-colors">
                                <Filter className="w-4 h-4" />
                                <span className="text-sm">Filter</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Category Pills */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap gap-2 mb-8"
                >
                    {["All", "Sector Analysis", "Deep Dive"].map(
                        (category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === category
                                        ? "bg-pm-green text-pm-black"
                                        : "bg-pm-charcoal border border-pm-border text-pm-muted hover:text-pm-text hover:border-pm-green/30"
                                    }`}
                            >
                                {category}
                            </button>
                        )
                    )}
                </motion.div>

                {/* Research Feed */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <ResearchFeed category={activeCategory} />
                </motion.div>

                {/* Subscription CTA for Guests */}
                {!isSubscribed && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-16 text-center"
                    >
                        <div className="pm-card border-pm-purple/30 max-w-xl mx-auto py-12 relative overflow-hidden">
                            <div className="absolute inset-0 bg-glow-purple opacity-30" />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-3">
                                    Unlock Complete Research Access
                                </h3>
                                <p className="text-pm-muted mb-6 max-w-md mx-auto">
                                    Get full access to all research notes, predictive signals, and
                                    in-depth analysis with a PM Research subscription.
                                </p>
                                <a href="/pricing" className="btn-primary inline-flex items-center gap-2">
                                    View Subscription Plans
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Disclaimer */}
                <div className="mt-16 pt-8 border-t border-pm-border text-center">
                    <p className="text-xs text-pm-muted flex items-center justify-center gap-2">
                        <Info className="w-4 h-4" />
                        DISCLAIMER: Content is for informational and educational purposes only. PM Research does not provide financial advice. PM Scores reflect research depth and thesis development, not return predictions. Always conduct your own research before making investment decisions.
                    </p>
                </div>
            </div>
        </div>
    );
}
