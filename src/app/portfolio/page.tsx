"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortfolioTable from "@/components/PortfolioTable";
import { PortfolioErrorBoundary } from "@/components/ErrorBoundary";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAdmin } from "@/context/AdminContext";
import { Lock, Unlock, Briefcase } from "lucide-react";

export default function PortfolioPage() {
    const { isSubscribed } = useSubscription();
    const { portfolios, activePortfolioId, setActivePortfolioId } = useAdmin();

    // Find the selected portfolio
    const selectedPortfolio = portfolios.find(p => p.id === activePortfolioId) || portfolios[0];

    // Ensure we have a valid portfolio selected
    useEffect(() => {
        if (!selectedPortfolio && portfolios.length > 0) {
            setActivePortfolioId(portfolios[0].id);
        }
    }, [portfolios, selectedPortfolio, setActivePortfolioId]);

    if (!selectedPortfolio) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-pm-muted">Loading portfolios...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pb-20 md:pb-0">
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
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-1 bg-pm-green" />
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Model Portfolios
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-pm-muted">Select a portfolio to view positions</p>
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
                    </div>
                </motion.div>

                {/* Portfolio Selector Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10"
                >
                    {portfolios.map((portfolio, index) => (
                        <motion.button
                            key={portfolio.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                            onClick={() => setActivePortfolioId(portfolio.id)}
                            className={`text-left p-4 rounded-lg border transition-all ${
                                portfolio.id === activePortfolioId
                                    ? 'bg-pm-green/10 border-pm-green text-pm-text'
                                    : 'bg-pm-charcoal/50 border-pm-border hover:border-pm-green/50 text-pm-muted hover:text-pm-text'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Briefcase className={`w-4 h-4 ${portfolio.id === activePortfolioId ? 'text-pm-green' : ''}`} />
                                <span className="font-semibold text-sm truncate">{portfolio.name}</span>
                            </div>
                            <p className="text-xs text-pm-muted line-clamp-2">{portfolio.description}</p>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Selected Portfolio Header */}
                <motion.div
                    key={`header-${activePortfolioId}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6"
                >
                    <h2 className="text-2xl font-bold text-pm-green">{selectedPortfolio.name}</h2>
                    <p className="text-pm-muted text-sm">{selectedPortfolio.description}</p>
                </motion.div>

                {/* Portfolio Table - passes the portfolio ID */}
                <motion.div
                    key={activePortfolioId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <PortfolioErrorBoundary>
                        <PortfolioTable
                            portfolioId={selectedPortfolio.id}
                            portfolioName={selectedPortfolio.name}
                        />
                    </PortfolioErrorBoundary>
                </motion.div>

                {/* Disclaimer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 text-center"
                >
                    <p className="text-xs text-pm-muted max-w-2xl mx-auto">
                        Model portfolio performance is hypothetical. Past performance does not guarantee future results.
                        PM Research provides research content and model portfolios—not personalized investment advice.
                        PM Scores reflect research depth and thesis development, not return predictions. Always conduct your own research before making investment decisions.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
