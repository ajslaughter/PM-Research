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
        <div className="pm-card border-pm-border/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-pm-border/50">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-pm-green animate-pulse" />
                    <h2 className="text-lg font-semibold text-pm-text">Market Tools</h2>
                    <span className="text-xs text-pm-muted font-mono ml-2">
                        Real-time data
                    </span>
                </div>

                <div className="flex gap-2 overflow-x-auto">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2.5 text-sm font-mono rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
                                    activeTab === tab.key
                                        ? "bg-pm-green text-pm-black font-semibold"
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
