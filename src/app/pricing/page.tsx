"use client";

import { motion } from "framer-motion";
import {
    Check,
    Sparkles,
} from "lucide-react";

export default function PricingPage() {
    const features = [
        "Full Research Hub Access",
        "Weekly Market Analysis",
        "PM Score Methodology",
        "Full Model Portfolio Access",
        "PM Research Bot Access",
        "Automated Research Reports",
        "Advanced Analytics Dashboard",
    ];

    return (
        <div className="relative min-h-screen pb-20 md:pb-0">
            {/* Grid Background */}
            <div className="absolute inset-0 grid-bg opacity-30" />

            {/* Glow Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pm-green/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pm-purple/5 rounded-full blur-3xl" />

            <div className="relative max-w-6xl mx-auto px-6 py-16">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-pm-charcoal border border-pm-border rounded-full mb-6">
                        <Sparkles className="w-4 h-4 text-pm-green" />
                        <span className="text-sm font-medium tracking-wide text-pm-muted">
                            100% Free Access
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Everything is <span className="text-pm-green">Free</span>
                    </h1>
                    <p className="text-xl text-pm-muted max-w-2xl mx-auto">
                        Full access to all research, model portfolios, and analytics.
                        No subscription required.
                    </p>
                </motion.div>

                {/* Features Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-lg mx-auto mb-16"
                >
                    <div className="pm-card border-pm-green/30 p-8">
                        <div className="text-center mb-6">
                            <span className="text-4xl font-bold text-pm-green">$0</span>
                            <span className="text-pm-muted ml-2">forever</span>
                        </div>
                        <ul className="space-y-3">
                            {features.map((feature) => (
                                <li key={feature} className="flex items-center gap-3">
                                    <Check className="w-4 h-4 text-pm-green flex-shrink-0" />
                                    <span className="text-sm text-pm-text">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-24"
                >
                    <h2 className="text-2xl font-bold text-center mb-12">
                        Frequently Asked Questions
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {[
                            {
                                q: "What is the PM Score?",
                                a: "The PM Score is our proprietary ranking system that combines momentum, fundamental, and predictive signals into a single 0-100 score. Higher scores indicate stronger conviction based on our models.",
                            },
                            {
                                q: "What is the PM Research Bot?",
                                a: "The PM Research Bot is an AI-powered system that generates research reports and analysis on demand. All outputs are algorithmically generated—no human analysts involved.",
                            },
                            {
                                q: "Is this personalized investment advice?",
                                a: "No. PM Research provides general research content and model portfolios. We don't know your financial situation, so nothing here constitutes personalized advice or recommendations to buy or sell specific securities.",
                            },
                            {
                                q: "How does the model portfolio work?",
                                a: "The model portfolio displays hypothetical positions based on our research. Performance metrics reflect how these model positions would have performed—not actual trades.",
                            },
                            {
                                q: "What are Automated Research Reports?",
                                a: "Deep-dive analyses generated by our PM Research Bot covering sectors, individual tickers, and market themes.",
                            },
                            {
                                q: "Why is everything free?",
                                a: "We believe in open access to research and market analysis. PM Research is a free platform for educational and informational purposes.",
                            },
                        ].map((faq, index) => (
                            <div key={index} className="pm-card">
                                <h3 className="font-semibold mb-2">{faq.q}</h3>
                                <p className="text-sm text-pm-muted leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Disclaimer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 text-center"
                >
                    <p className="text-xs text-pm-muted leading-relaxed max-w-2xl mx-auto">
                        Model portfolio performance is hypothetical. Past performance does not guarantee future results.
                        PM Research provides research content and model portfolios—not personalized investment advice.
                        PM Scores reflect research depth and thesis development, not return predictions. Always conduct your own research before making investment decisions.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
