"use client";

import { motion } from "framer-motion";
import PortfolioTable from "@/components/PortfolioTable";
import { useSubscription } from "@/context/SubscriptionContext";
import { Briefcase, Lock, Unlock, ArrowUpRight } from "lucide-react";

export default function PortfolioPage() {
    const { isSubscribed } = useSubscription();

    return (
        <div className="relative min-h-screen">
            {/* Grid Background */}
            <div className="absolute inset-0 grid-bg opacity-30" />

            {/* Glow Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-pm-green/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-pm-purple/5 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-pm-green/10 flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-pm-green" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold">The Ledger</h1>
                            <p className="text-pm-muted">PM Research Active Portfolio</p>
                        </div>
                    </div>

                    {/* Status Banner */}
                    <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${isSubscribed
                                ? "bg-pm-green/10 border-pm-green/30 text-pm-green"
                                : "bg-pm-charcoal border-pm-border text-pm-muted"
                            }`}
                    >
                        {isSubscribed ? (
                            <>
                                <Unlock className="w-4 h-4" />
                                <span className="font-mono text-sm">FULL ACCESS ENABLED</span>
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                <span className="font-mono text-sm">RESTRICTED VIEW</span>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Quick Stats (visible to all) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    <div className="pm-card flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-pm-green/10 flex items-center justify-center">
                            <ArrowUpRight className="w-5 h-5 text-pm-green" />
                        </div>
                        <div>
                            <div className="text-xl font-mono font-bold text-pm-green">+147%</div>
                            <div className="text-xs text-pm-muted">YTD Return</div>
                        </div>
                    </div>

                    <div className="pm-card flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-pm-purple/10 flex items-center justify-center">
                            <span className="font-mono font-bold text-pm-purple">PM</span>
                        </div>
                        <div>
                            <div className="text-xl font-mono font-bold">89</div>
                            <div className="text-xs text-pm-muted">Avg. PM Score</div>
                        </div>
                    </div>

                    <div className="pm-card flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <span className="font-mono font-bold text-blue-400">8</span>
                        </div>
                        <div>
                            <div className="text-xl font-mono font-bold">8</div>
                            <div className="text-xs text-pm-muted">Active Positions</div>
                        </div>
                    </div>

                    <div className="pm-card flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                            <span className="font-mono font-bold text-yellow-400">75%</span>
                        </div>
                        <div>
                            <div className="text-xl font-mono font-bold">75%</div>
                            <div className="text-xs text-pm-muted">Win Rate</div>
                        </div>
                    </div>
                </motion.div>

                {/* Portfolio Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <PortfolioTable />
                </motion.div>

                {/* Disclaimer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 text-center"
                >
                    <p className="text-xs text-pm-muted max-w-2xl mx-auto">
                        Past performance is not indicative of future results. PM Research provides
                        educational content and analysis. All investments involve risk, including
                        loss of principal. Conduct your own due diligence before making investment
                        decisions.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
