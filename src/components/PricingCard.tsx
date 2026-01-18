"use client";

import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import React from "react";

export interface PricingTierProps {
    name: string;
    price: number;
    description: string;
    features: { text: string; included: boolean }[];
    highlighted?: boolean;
    icon: React.ReactNode;
}

export default function PricingCard({
    name,
    price,
    description,
    features,
    highlighted = false,
    icon,
}: PricingTierProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative rounded-xl border p-8 ${highlighted
                ? "bg-gradient-to-b from-pm-charcoal to-pm-black border-pm-green/50 shadow-neon-green"
                : "bg-pm-charcoal border-pm-border"
                }`}
        >
            {/* Popular Badge */}
            {highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-pm-green text-pm-black px-4 py-1 rounded-full text-xs font-mono font-bold">
                        MOST POPULAR
                    </span>
                </div>
            )}

            {/* Header */}
            <div className="text-center mb-8">
                <div
                    className={`w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${highlighted ? "bg-pm-green/20" : "bg-pm-purple/20"
                        }`}
                >
                    {icon}
                </div>

                <h3 className="text-2xl font-bold mb-2">{name}</h3>
                <p className="text-pm-muted text-sm">{description}</p>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
                <span className="text-5xl font-mono font-bold">${price}</span>
                <span className="text-pm-muted">/month</span>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                    <li
                        key={index}
                        className={`flex items-center gap-3 ${feature.included ? "text-pm-text" : "text-pm-muted"
                            }`}
                    >
                        {feature.included ? (
                            <Check className="w-5 h-5 text-pm-green flex-shrink-0" />
                        ) : (
                            <X className="w-5 h-5 text-pm-subtle flex-shrink-0" />
                        )}
                        <span className="text-sm">{feature.text}</span>
                    </li>
                ))}
            </ul>

            {/* CTA */}
            <button
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${highlighted
                    ? "bg-pm-green text-pm-black hover:shadow-neon-green"
                    : "border border-pm-green text-pm-green hover:bg-pm-green/10"
                    }`}
            >
                Get Started
                <ArrowRight className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
