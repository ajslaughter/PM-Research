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
            description: "Essential research access for educational purposes",
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
            description: "Complete research and model portfolio access",
            icon: <Crown className="w-7 h-7 text-pm-green" />,
            highlighted: true,
            features: [
                { text: "Everything in Observer", included: true },
                { text: "Full Model Portfolio Access", included: true },
                { text: "Model Portfolio Tracking", included: true },
                { text: "PM Research Bot Access", included: true },
                { text: "Automated Research Reports", included: true },
                { text: "Quarterly Portfolio Reviews", included: true },
                { text: "Advanced Analytics Dashboard", included: true },
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
                        Research & Model Portfolio <span className="text-pm-green">Access</span>
                    </h1>
                    <p className="text-xl text-pm-muted max-w-2xl mx-auto">
                        Access educational research and model portfolio tracking tools
                        for informational purposes only.
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
                                a: "The PM Score is our proprietary ranking system that combines momentum, fundamental, and predictive signals into a single 0-100 score for educational and informational purposes.",
                            },
                            {
                                q: "What is the PM Research Bot?",
                                a: "The PM Research Bot is a fully automated AI system that generates research reports and analysis. It operates without any human involvement - all outputs are algorithmically generated. The bot does not provide personalized investment advice.",
                            },
                            {
                                q: "Is this investment advice?",
                                a: "No. PM Research provides educational research content and model portfolio tracking for informational purposes only. We do not provide personalized investment advice. All content is for educational use and should not be construed as a recommendation to buy or sell any security.",
                            },
                            {
                                q: "How does the model portfolio work?",
                                a: "The model portfolio is a hypothetical portfolio for educational demonstration purposes. Position updates and performance metrics are provided for informational and educational purposes only, not as trading recommendations.",
                            },
                            {
                                q: "What are Automated Research Reports?",
                                a: "Automated Research Reports are AI-generated analyses produced by our PM Research Bot. These reports are algorithmically created without human analyst involvement and are provided for educational purposes only.",
                            },
                            {
                                q: "Is there a refund policy?",
                                a: "We offer a 7-day money-back guarantee. If you're not satisfied with the research content, contact us for a full refund.",
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
                    <div className="pm-card bg-pm-charcoal/50 p-6 max-w-3xl mx-auto">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <Bot className="w-5 h-5 text-pm-purple" />
                            <span className="font-semibold text-sm">Important Disclosure</span>
                        </div>
                        <p className="text-xs text-pm-muted leading-relaxed">
                            PM Research provides educational content and model portfolio tracking for informational purposes only.
                            The PM Research Bot is a fully automated AI system with no human involvement in content generation.
                            Nothing on this platform constitutes personalized investment advice, a recommendation, or an offer to buy or sell securities.
                            Past performance of model portfolios does not guarantee future results.
                            Always consult with a qualified financial advisor before making investment decisions.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
