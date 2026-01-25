"use client";

import { motion } from "framer-motion";
import PortfolioTable from "@/components/PortfolioTable";
import { useSubscription } from "@/context/SubscriptionContext";
import { Lock, Unlock } from "lucide-react";

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
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-1 bg-pm-green" />
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            PM Research Portfolio
                        </h1>
                    </div>
                    <p className="text-pm-muted">PM Research Active Portfolio</p>


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
