"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import WatchlistTable from "@/components/WatchlistTable";
import { WatchlistErrorBoundary } from "@/components/ErrorBoundary";
import { useAdmin } from "@/context/AdminContext";
import {
    Briefcase,
    Zap,
} from "lucide-react";

// ─── Main Watchlist Page ─────────────────────────────────────────────
export default function WatchlistPage() {
    const { watchlists, activeWatchlistId, setActiveWatchlistId } = useAdmin();

    const selectedWatchlist = watchlists.find(p => p.id === activeWatchlistId) || watchlists[0];

    useEffect(() => {
        if (!selectedWatchlist && watchlists.length > 0) {
            setActiveWatchlistId(watchlists[0].id);
        }
    }, [watchlists, selectedWatchlist, setActiveWatchlistId]);

    if (!selectedWatchlist) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-pm-muted">Loading watchlists...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pb-20 md:pb-0">
            {/* Grid Background */}
            <div className="absolute inset-0 grid-bg opacity-30" />

            {/* Glow Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-pm-green/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-pm-purple/5 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="relative">
                            <Zap className="w-8 h-8 text-pm-green" />
                            <div className="absolute inset-0 blur-md bg-pm-green/30" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            <span className="text-pm-green">PM</span> Watchlist
                        </h1>
                    </div>
                </motion.div>

                {/* Watchlist Selector Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-10"
                >
                    {watchlists.map((watchlist, index) => (
                        <motion.button
                            key={watchlist.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                            onClick={() => setActiveWatchlistId(watchlist.id)}
                            className={`text-left p-3 sm:p-4 rounded-lg border transition-all ${
                                watchlist.id === activeWatchlistId
                                    ? 'bg-pm-green/10 border-pm-green text-pm-text'
                                    : 'bg-pm-charcoal/50 border-pm-border hover:border-pm-green/50 text-pm-muted hover:text-pm-text'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                <Briefcase className={`w-4 h-4 flex-shrink-0 ${watchlist.id === activeWatchlistId ? 'text-pm-green' : ''}`} />
                                <span className="font-semibold text-xs sm:text-sm truncate">{watchlist.name}</span>
                            </div>
                            <p className="text-xs text-pm-muted line-clamp-2">{watchlist.description}</p>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Selected Watchlist Header */}
                <motion.div
                    key={`header-${activeWatchlistId}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6"
                >
                    <h2 className="text-xl sm:text-2xl font-bold text-pm-green">{selectedWatchlist.name}</h2>
                    <p className="text-pm-muted text-sm">{selectedWatchlist.description}</p>
                </motion.div>

                {/* Watchlist Table */}
                <motion.div
                    key={activeWatchlistId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <WatchlistErrorBoundary>
                        <WatchlistTable
                            watchlistId={selectedWatchlist.id}
                            watchlistName={selectedWatchlist.name}
                        />
                    </WatchlistErrorBoundary>
                </motion.div>
            </div>
        </div>
    );
}
