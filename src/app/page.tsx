"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Brain,
    Target,
    Zap,
    TrendingUp,
    Shield,
    LineChart,
    Sparkles,
    BookOpen,
} from "lucide-react";

export default function LandingPage() {
    const features = [
        {
            icon: Brain,
            title: "Educational Analytics",
            description:
                "Machine learning models and research tools for educational analysis of market data and trends.",
            color: "pm-purple",
        },
        {
            icon: Target,
            title: "Model Portfolio Tracking",
            description:
                "Track hypothetical model portfolios with position updates and YTD performance metrics for educational purposes.",
            color: "pm-green",
        },
        {
            icon: BookOpen,
            title: "Research Library",
            description:
                "Access our library of AI-generated research reports and sector analysis for informational use.",
            color: "pm-green",
        },
    ];

    const stats = [
        { value: "147%", label: "2025 Model Portfolio Return" },
        { value: "89", label: "Average PM Score" },
        { value: "2.4x", label: "vs. S&P 500 Benchmark" },
        { value: "12", label: "Model Positions" },
    ];

    return (
        <div className="relative overflow-hidden">
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
                                Educational Model Portfolio Tracking
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
                            <span className="text-pm-text">institutional-grade portfolio analytics</span> and{" "}
                            <span className="text-pm-text">sector research</span>{" "}
                            for educational and informational purposes.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link href="/portfolio" className="btn-primary flex items-center gap-2">
                                <Zap className="w-5 h-5" />
                                View Model Portfolio
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/research" className="btn-secondary flex items-center gap-2">
                                <LineChart className="w-5 h-5" />
                                Browse Research
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="relative border-y border-pm-border bg-pm-charcoal/50 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-3xl md:text-4xl font-mono font-bold text-pm-green">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-pm-muted mt-1">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                    <p className="text-xs text-pm-muted text-center mt-4">
                        *Model portfolio performance shown for educational purposes only. Past performance does not guarantee future results.
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            <span className="text-pm-purple">Research</span> for Education
                        </h2>
                        <p className="text-pm-muted max-w-xl mx-auto">
                            Our proprietary PM Score system ranks opportunities based on momentum,
                            fundamentals, and predictive signals for educational analysis.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                className="pm-card-hover group"
                            >
                                <div
                                    className={`w-12 h-12 rounded-lg bg-${feature.color}/10 flex items-center justify-center mb-4
                    group-hover:scale-110 transition-transform`}
                                >
                                    <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-pm-muted leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
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
                                Ready to Explore <span className="text-pm-green">Model Portfolios</span>?
                            </h2>
                            <p className="text-pm-muted max-w-lg mx-auto mb-8">
                                Access our educational research and model portfolio tracking tools
                                for informational purposes.
                            </p>
                            <Link href="/pricing" className="btn-primary inline-flex items-center gap-2">
                                View Research Plans
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
                        PM Research provides educational content and model portfolio tracking for informational purposes only.
                        Nothing on this platform constitutes personalized investment advice, a recommendation, or an offer to buy or sell securities.
                        Model portfolio performance is hypothetical and does not guarantee future results.
                        Always consult with a qualified financial advisor before making investment decisions.
                    </p>
                </div>
            </section>
        </div>
    );
}
