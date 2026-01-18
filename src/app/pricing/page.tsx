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
} from "lucide-react";
import PricingCard, { PricingTierProps } from "@/components/PricingCard";



export default function PricingPage() {
    const { isSubscribed, toggleSubscription } = useSubscription();

    const tiers: PricingTierProps[] = [
        {
            name: "Observer",
            price: 25,
            description: "Essential research access for the informed investor",
            icon: <Zap className="w-7 h-7 text-pm-purple" />,
            features: [
                { text: "Full Research Hub Access", included: true },
                { text: "Weekly Market Analysis", included: true },
                { text: "PM Score Methodology", included: true },
                { text: "Email Alerts", included: true },
                { text: "Portfolio Access", included: false },
                { text: "Custom Research Requests", included: false },
                { text: "Direct Analyst Access", included: false },
            ],
        },
        {
            name: "Operator",
            price: 150,
            description: "Complete institutional-grade toolkit",
            icon: <Crown className="w-7 h-7 text-pm-green" />,
            highlighted: true,
            features: [
                { text: "Everything in Observer", included: true },
                { text: "Full Portfolio Access (The Ledger)", included: true },
                { text: "Real-time Position Updates", included: true },
                { text: "Custom Research Requests", included: true },
                { text: "Direct Analyst Access", included: true },
                { text: "Priority Alert System", included: true },
                { text: "Quarterly Strategy Calls", included: true },
            ],
        },
    ];

    return (
        <div className="relative min-h-screen">
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
                        Unlock institutional-grade research and predictive analytics to gain
                        an advantage in the markets.
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
                                a: "The PM Score is our proprietary ranking system that combines momentum, fundamental, and predictive signals into a single 0-100 score to identify asymmetric opportunities.",
                            },
                            {
                                q: "How often is the portfolio updated?",
                                a: "Operator subscribers receive real-time position updates. New positions and exits are communicated immediately via our priority alert system.",
                            },
                            {
                                q: "Can I request custom research?",
                                a: "Operator subscribers can submit custom research requests for any ticker or sector. Our analysts typically deliver within 48-72 hours.",
                            },
                            {
                                q: "Is there a refund policy?",
                                a: "We offer a 7-day money-back guarantee. If you're not satisfied with the research quality, contact us for a full refund.",
                            },
                        ].map((faq, index) => (
                            <div key={index} className="pm-card">
                                <h3 className="font-semibold mb-2">{faq.q}</h3>
                                <p className="text-sm text-pm-muted leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
