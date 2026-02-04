"use client";

import { motion } from "framer-motion";
import { Bot, MessageSquare, Sparkles, Zap } from "lucide-react";

export default function PMbotPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-pm-charcoal border border-pm-border rounded-full mb-6">
                        <Sparkles className="w-4 h-4 text-pm-purple" />
                        <span className="text-sm font-mono text-pm-muted">AI Research Assistant</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-pm-green">PM</span>
                        <span className="text-pm-text">bot</span>
                    </h1>
                    <p className="text-pm-muted text-lg max-w-2xl mx-auto">
                        Your AI-powered research assistant for generating deep-dive analysis and market insights.
                    </p>
                </motion.div>

                {/* Coming Soon Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="pm-card border-pm-purple/30 text-center py-16 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-pm-purple/5" />

                    <div className="relative z-10">
                        <div className="w-20 h-20 rounded-full bg-pm-purple/20 flex items-center justify-center mx-auto mb-6">
                            <Bot className="w-10 h-10 text-pm-purple" />
                        </div>

                        <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
                        <p className="text-pm-muted max-w-md mx-auto mb-8">
                            PMbot will provide conversational AI research capabilities, allowing you to ask questions about markets, generate custom analysis, and explore investment theses.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <div className="flex items-center gap-2 text-pm-muted">
                                <MessageSquare className="w-5 h-5 text-pm-green" />
                                <span>Natural language queries</span>
                            </div>
                            <div className="flex items-center gap-2 text-pm-muted">
                                <Zap className="w-5 h-5 text-pm-green" />
                                <span>Instant analysis</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
