"use client";

import { motion } from "framer-motion";
import { useSubscription } from "@/context/SubscriptionContext";
import {
    Check,
    X,
    CreditCard,
    Zap,
    Crown,
    ArrowRight,
    Sparkles,
    Bot,
} from "lucide-react";
import PricingCard, { PricingTierProps } from "@/components/PricingCard";



export default function PricingPage() {
    const { isSubscribed, toggleSubscription } = useSubscription();

    const tiers: PricingTierProps[] = [
        {
            name: "Observer",
            price: 25,
            description: "Core research access for serious investors",
            icon: <Zap className="w-7 h-7 text-pm-purple" />,
            features: [
                { text: "Full Research Hub Access", included: true },
                { text: "Weekly Market Analysis", included: true },
                { text: "PM Score Methodology", included: true },
                { text: "Email Alerts", included: true },
                { text: "Model Portfolio Access", included: false },
                { text: "PM Research Bot Access", included: false },
                { text: "Advanced Analytics Dashboard", included: false },
            ],
        },
        {
            name: "Operator",
            price: 150,
            description: "Full access for investors who demand an edge",
            icon: <Crown className="w-7 h-7 text-pm-green" />,
            highlighted: true,
            features: [
                { text: "Everything in Observer", included: true },
                { text: "Full Model Portfolio Access", included: true },
                { text: "PM Research Bot Access", included: true },
                { text: "Automated Research Reports", included: true },
                { text: "Quarterly Portfolio Reviews", included: true },
                { text: "Advanced Analytics Dashboard", included: true },
            ],
        },
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
                        <CreditCard className="w-4 h-4 text-pm-green" />
                        <span className="text-sm font-mono text-pm-muted">
                            Simple, Transparent Pricing
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Choose Your <span className="text-pm-green">Edge</span>
                    </h1>
                    <p className="text-xl text-pm-muted max-w-2xl mx-auto">
                        Institutional-grade research and model portfolios.
                        Built for investors who take markets seriously.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <PricingCard {...tier} />
                        </motion.div>
                    ))}
                </div>

                {/* Demo Toggle */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                >
                    <div className="pm-card inline-flex flex-col items-center gap-4 p-6">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-pm-purple" />
                            <span className="font-semibold">Demo Mode</span>
                        </div>
                        <p className="text-sm text-pm-muted max-w-sm">
                            Toggle subscription status to preview subscriber vs. guest experiences
                            throughout the platform.
                        </p>
                        <button
                            onClick={toggleSubscription}
                            className={`px-6 py-3 rounded-lg font-mono font-medium transition-all ${isSubscribed
                                ? "bg-pm-green text-pm-black"
                                : "border border-pm-border text-pm-muted hover:border-pm-green hover:text-pm-green"
                                }`}
                        >
                            {isSubscribed ? "SUBSCRIBED ✓" : "ACTIVATE DEMO"}
                        </button>
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
                                a: "Deep-dive analyses generated by our PM Research Bot covering sectors, individual tickers, and market themes. Available on-demand for Operator subscribers.",
                            },
                            {
                                q: "Is there a refund policy?",
                                a: "Yes. 7-day money-back guarantee, no questions asked. If PM Research isn't for you, we'll refund in full.",
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
