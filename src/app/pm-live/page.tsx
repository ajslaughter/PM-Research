"use client";

import { motion } from "framer-motion";
import {
    Radio,
    TrendingUp,
    BarChart3,
    Clock,
    Sunrise,
    Sun,
    Sunset,
} from "lucide-react";

export default function PMLivePage() {
    const sessions = [
        { label: "Pre-Market Open", icon: Sunrise, time: "9:00 AM ET" },
        { label: "Mid-Day Summary", icon: Sun, time: "12:30 PM ET" },
        { label: "End of Close", icon: Sunset, time: "4:15 PM ET" },
    ];

    return (
        <div className="relative overflow-hidden pb-20 md:pb-0 min-h-screen">
            {/* Grid Background */}
            <div className="absolute inset-0 grid-bg opacity-50" />

            {/* Glow Effects */}
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-pm-green/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-pm-purple/10 rounded-full blur-3xl" />

            <section className="relative pt-24 pb-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center space-y-6"
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-pm-charcoal border border-pm-border rounded-full">
                            <Radio className="w-4 h-4 text-pm-green animate-pulse" />
                            <span className="text-sm font-mono text-pm-muted">
                                Live Market Updates
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                            <span className="text-pm-green">PM</span>
                            <span className="text-pm-text"> Live</span>
                        </h1>

                        <p className="text-xl text-pm-muted max-w-2xl mx-auto leading-relaxed">
                            Real-time market updates, daily performance charts, and
                            session summaries from{" "}
                            <span className="text-pm-text">open to close</span>.
                        </p>
                    </motion.div>

                    {/* Session Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16"
                    >
                        {sessions.map((session, i) => {
                            const Icon = session.icon;
                            return (
                                <div
                                    key={session.label}
                                    className="pm-card border-pm-border/50 p-6 text-center space-y-3"
                                >
                                    <Icon className="w-8 h-8 text-pm-green mx-auto" />
                                    <h3 className="text-pm-text font-semibold">
                                        {session.label}
                                    </h3>
                                    <p className="text-sm text-pm-muted font-mono">
                                        {session.time}
                                    </p>
                                </div>
                            );
                        })}
                    </motion.div>

                    {/* Placeholder Chart Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mt-12"
                    >
                        <div className="pm-card border-pm-border/50 p-8 md:p-12">
                            <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
                                <div className="relative">
                                    <BarChart3 className="w-16 h-16 text-pm-green/40" />
                                    <div className="absolute inset-0 blur-lg bg-pm-green/10" />
                                </div>
                                <h2 className="text-2xl font-bold text-pm-text">
                                    Coming Soon
                                </h2>
                                <p className="text-pm-muted max-w-md">
                                    Live spaghetti charts tracking daily portfolio
                                    performance, intraday moves, and session-by-session
                                    market recaps.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-pm-muted font-mono pt-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Live data feed in development</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
