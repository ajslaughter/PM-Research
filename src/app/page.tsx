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
} from "lucide-react";

export default function LandingPage() {
    const features = [
        {
            icon: Brain,
            title: "Predictive Modeling",
            description:
                "Machine learning algorithms trained on decades of market data to identify asymmetric opportunities.",
            color: "pm-purple",
        },
        {
            icon: Target,
            title: "Pure Alpha",
            description:
                "Signal generation focused on uncorrelated returns. No market beta, just edge.",
            color: "pm-green",
        },
        {
            icon: Shield,
            title: "Custom Requests",
            description:
                "Direct access to our research team for bespoke analysis on any ticker or sector.",
            color: "pm-green",
        },
    ];

    const stats = [
        { value: "147%", label: "2025 Portfolio Return" },
        { value: "89", label: "Average PM Score" },
        { value: "2.4x", label: "Alpha vs. S&P 500" },
        { value: "12", label: "Active Positions" },
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
                                Institutional Grade Analytics
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
                            for investors who demand an edge.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link href="/portfolio" className="btn-primary flex items-center gap-2">
                                <Zap className="w-5 h-5" />
                                Unlock the Portfolio
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
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            <span className="text-pm-purple">Research</span> That Moves Markets
                        </h2>
                        <p className="text-pm-muted max-w-xl mx-auto">
                            Our proprietary PM Score system ranks opportunities based on momentum,
                            fundamentals, and predictive signals.
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
                                Ready to Access the <span className="text-pm-green">Alpha</span>?
                            </h2>
                            <p className="text-pm-muted max-w-lg mx-auto mb-8">
                                Join the investors who are already using PM Research to identify
                                asymmetric opportunities before the market catches on.
                            </p>
                            <Link href="/pricing" className="btn-primary inline-flex items-center gap-2">
                                View Subscription Plans
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
