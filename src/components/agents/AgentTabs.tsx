"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3 } from "lucide-react";
import { FlowAgent } from "./FlowAgent";
import { MacroAgent } from "./MacroAgent";

const TABS = [
    { key: "flow", label: "Options Flow", icon: TrendingUp },
    { key: "macro", label: "Macro", icon: BarChart3 },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function AgentTabs() {
    const [activeTab, setActiveTab] = useState<TabKey>("flow");

    return (
        <div className="rounded-lg border border-pm-border bg-pm-charcoal overflow-hidden">
            <div className="px-6 py-4 border-b border-pm-border/50">
                <div className="mb-4">
                    <h2 className="section-title">Market tools</h2>
                    <p className="text-xs text-pm-subtle mt-0.5">Options flow by ticker, plus macro indicators and the economic calendar</p>
                </div>

                <div className="flex gap-2 overflow-x-auto">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${
                                    activeTab === tab.key
                                        ? "bg-pm-gold text-pm-black font-semibold"
                                        : "text-pm-muted hover:text-pm-text hover:bg-pm-border/20"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-6">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === "flow" && <FlowAgent />}
                    {activeTab === "macro" && <MacroAgent />}
                </motion.div>
            </div>
        </div>
    );
}
