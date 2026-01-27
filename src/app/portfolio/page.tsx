"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortfolioTable from "@/components/PortfolioTable";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAdmin } from "@/context/AdminContext";
import { Lock, Unlock, ChevronDown } from "lucide-react";

export default function PortfolioPage() {
    const { isSubscribed } = useSubscription();
    const { portfolios, activePortfolioId, setActivePortfolioId } = useAdmin();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
                            {selectedPortfolio.name}
                        </h1>
                    </div>
                    <p className="text-pm-muted mb-4">{selectedPortfolio.description}</p>

                    {/* Portfolio Selector Dropdown */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-pm-charcoal border border-pm-border rounded-lg hover:border-pm-green/50 transition-colors"
                            >
                                <span className="font-mono text-sm">{selectedPortfolio.name}</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-72 bg-pm-charcoal border border-pm-border rounded-lg shadow-xl z-50">
                                    {portfolios.map((portfolio) => (
                                        <button
                                            key={portfolio.id}
                                            onClick={() => {
                                                setActivePortfolioId(portfolio.id);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 hover:bg-pm-dark transition-colors first:rounded-t-lg last:rounded-b-lg ${portfolio.id === activePortfolioId ? 'bg-pm-green/10 border-l-2 border-pm-green' : ''
                                                }`}
                                        >
                                            <div className="font-medium">{portfolio.name}</div>
                                            <div className="text-xs text-pm-muted">{portfolio.description}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
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
                    </div>
                </motion.div>

                {/* Portfolio Table - passes the portfolio ID */}
                <motion.div
                    key={activePortfolioId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <PortfolioTable
                        portfolioId={selectedPortfolio.id}
                        portfolioName={selectedPortfolio.name}
                    />
                </motion.div>

                {/* Disclaimer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
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
