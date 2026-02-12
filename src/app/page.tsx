"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Briefcase,
    TrendingUp,
    LineChart,
    Sparkles,
} from "lucide-react";

export default function LandingPage() {
    return (
        <div className="relative overflow-hidden pb-20 md:pb-0">
            {/* Grid Background */}
            <div className="absolute inset-0 grid-bg opacity-50" />

            {/* Glow Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pm-green/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pm-purple/10 rounded-full blur-3xl" />

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-pm-charcoal border border-pm-border rounded-full">
                            <Sparkles className="w-4 h-4 text-pm-purple" />
                            <span className="text-sm font-mono text-pm-muted">
                                Institutional-Grade Research
                            </span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                            <span className="text-pm-text">Modeling the</span>
                            <br />
                            <span className="text-pm-green">Future of Capital</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl text-pm-muted max-w-2xl mx-auto leading-relaxed">
                            PM Research delivers{" "}
                            <span className="text-pm-text">institutional-grade research</span> and{" "}
                            <span className="text-pm-text">model portfolios</span>{" "}
                            for investors who demand an edge.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link href="/portfolio" className="btn-primary flex items-center gap-2">
                                <Briefcase className="w-5 h-5" />
                                Model Portfolios
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/research" className="btn-secondary flex items-center gap-2">
                                <LineChart className="w-5 h-5" />
                                View Research
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="pm-card border-pm-green/30 text-center py-16 relative overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-glow-green opacity-30" />

                        <div className="relative z-10">
                            <TrendingUp className="w-12 h-12 text-pm-green mx-auto mb-6" />
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Ready to Access the <span className="text-pm-green">Edge</span>?
                            </h2>
                            <p className="text-pm-muted max-w-lg mx-auto mb-8">
                                Explore our model portfolios and AI-powered research—completely free.
                            </p>
                            <Link href="/research" className="btn-primary inline-flex items-center gap-2">
                                Explore Research
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Disclaimer */}
            <section className="relative py-8 px-6 border-t border-pm-border">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-xs text-pm-muted leading-relaxed">
                        Model portfolio performance shown is hypothetical. Past performance does not guarantee future results.
                        PM Research provides research content and model portfolios—not personalized investment advice.
                        PM Scores reflect research depth and thesis development, not return predictions. Always conduct your own research before making investment decisions.
                    </p>
                </div>
            </section>
        </div>
    );
}
