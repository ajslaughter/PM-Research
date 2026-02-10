"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAdmin } from "@/context/AdminContext";
import { ResearchNote } from "@/lib/portfolios";
import {
    Sparkles,
    ArrowRight,
    Lock,
    X,
    Search,
    LineChart,
    AlertTriangle,
    Tag,
} from "lucide-react";
import Link from "next/link";
import PremiumModal from "@/components/PremiumModal";
import React from "react";

// Skeleton loading component for research cards
function ResearchCardSkeleton() {
    return (
        <div className="pm-card flex flex-col h-full animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="h-5 w-24 bg-pm-charcoal rounded" />
                <div className="h-4 w-16 bg-pm-charcoal rounded" />
            </div>

            {/* Title skeleton */}
            <div className="space-y-2 mb-4">
                <div className="h-5 w-full bg-pm-charcoal rounded" />
                <div className="h-5 w-3/4 bg-pm-charcoal rounded" />
            </div>

            {/* Summary skeleton */}
            <div className="space-y-2 mb-4 flex-grow">
                <div className="h-3 w-full bg-pm-charcoal rounded" />
                <div className="h-3 w-full bg-pm-charcoal rounded" />
                <div className="h-3 w-2/3 bg-pm-charcoal rounded" />
            </div>

            {/* Footer skeleton */}
            <div className="flex items-center justify-between pt-4 border-t border-pm-border">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-12 bg-pm-charcoal rounded" />
                    <div className="h-4 w-20 bg-pm-charcoal rounded" />
                </div>
                <div className="h-4 w-16 bg-pm-charcoal rounded" />
            </div>
        </div>
    );
}

// Props interfaces
interface FullContentModalProps {
    note: ResearchNote | null;
    onClose: () => void;
}

interface ResearchCardProps {
    note: ResearchNote;
    onReadClick: () => void;
    isSubscribed: boolean;
}

interface ResearchFeedProps {
    category?: string;
}

// Category styling maps
const categoryStyles: Record<string, string> = {
    "Sector Analysis": "bg-pm-purple/10 text-pm-purple border-pm-purple/30",
    "Risk Assessment": "bg-red-500/10 text-red-400 border-red-500/30",
    "Deep Dive": "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

const categoryIcons: Record<string, React.ReactNode> = {
    "Sector Analysis": <LineChart className="w-3 h-3" />,
    "Risk Assessment": <AlertTriangle className="w-3 h-3" />,
    "Deep Dive": <Search className="w-3 h-3" />,
};

// Research Card Component
function ResearchCard({ note, onReadClick, isSubscribed }: ResearchCardProps) {
    return (
        <div className="pm-card group hover:border-pm-green/30 transition-all duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${categoryStyles[note.category]}`}
                >
                    {categoryIcons[note.category]}
                    {note.category}
                </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold mb-2 group-hover:text-pm-green transition-colors line-clamp-2">
                {note.title}
            </h3>

            {/* Summary */}
            <p className="text-sm text-pm-muted mb-4 flex-grow line-clamp-3">
                {note.summary}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-pm-border">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-pm-green/10 text-pm-green border border-pm-green/30 text-xs font-mono">
                        <Sparkles className="w-3 h-3" />
                        {note.pmScore}
                    </div>
                    <span className="text-xs text-pm-muted">{note.date}</span>
                </div>

                <button
                    onClick={onReadClick}
                    className="flex items-center gap-1 text-sm text-pm-green hover:text-pm-text transition-colors group/btn"
                >
                    {isSubscribed ? (
                        <>
                            <span>Read</span>
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </>
                    ) : (
                        <>
                            <Lock className="w-3 h-3" />
                            <span>Unlock</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

function FullContentModal({ note, onClose }: FullContentModalProps) {
    if (!note) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 overflow-y-auto px-4 py-8"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="max-w-4xl mx-auto bg-pm-dark border border-pm-border rounded-xl shadow-2xl overflow-hidden"
                >
                    {/* Modal Header / Banner */}
                    <div className="relative h-32 bg-gradient-to-r from-pm-black to-pm-charcoal border-b border-pm-border p-8 flex items-end justify-between">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            {/* Abstract Background Graphic */}
                            <svg width="300" height="300" viewBox="0 0 100 100">
                                <path d="M0 0 L100 100 M100 0 L0 100" stroke="currentColor" strokeWidth="0.5" />
                            </svg>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${categoryStyles[note.category]}`}>
                                    {categoryIcons[note.category]}
                                    {note.category}
                                </span>
                                <span className="text-pm-muted text-xs font-mono">{note.date}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                {note.title}
                            </h1>
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-pm-muted hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-[1fr_280px] min-h-[500px]">
                        {/* Main Content Area */}
                        <div className="p-8 md:p-10 border-r border-pm-border bg-pm-black/50">
                            {/* Author Line */}
                            {note.author && (
                                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-pm-border/50">
                                    <div className="w-10 h-10 rounded-full bg-pm-green/20 flex items-center justify-center text-pm-green font-bold text-lg">
                                        {note.author.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-white">{note.author}</div>
                                        <div className="text-xs text-pm-muted">PM Research Strategy Team</div>
                                    </div>
                                </div>
                            )}

                            {/* Text Content - custom styled for "Deep Dive" look */}
                            <div className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-pm-text/80 prose-p:leading-relaxed prose-li:text-pm-text/80 prose-strong:text-pm-green">
                                {/* We parse specific markdown headers to style them nicely without a library */}
                                {note.fullContent.split('\n').map((line, i) => {
                                    if (line.startsWith('## ')) {
                                        return <h2 key={i} className="text-xl mt-8 mb-4 border-l-2 border-pm-green pl-4">{line.replace('## ', '')}</h2>;
                                    }
                                    if (line.startsWith('### ')) {
                                        return <h3 key={i} className="text-lg mt-6 mb-2 text-pm-purple font-mono">{line.replace('### ', '')}</h3>;
                                    }
                                    if (line.startsWith('* ')) {
                                        return <li key={i} className="ml-4 list-disc marker:text-pm-green pl-2 mb-2">{line.replace('* ', '')}</li>;
                                    }
                                    // Default paragraph
                                    if (line.trim() === '') return <div key={i} className="h-4" />;
                                    return <p key={i} className="mb-2">{line}</p>;
                                })}
                            </div>
                        </div>

                        {/* Sidebar / Metadata */}
                        <div className="p-6 bg-pm-black">
                            <div className="mb-8">
                                <h4 className="text-xs font-mono uppercase text-pm-muted mb-4 tracking-wider">PM Sentiment Score</h4>
                                <div className="flex items-center gap-3">
                                    <div className={`text-4xl font-bold ${note.pmScore >= 90 ? 'text-pm-green' : 'text-pm-text'}`}>
                                        {note.pmScore}
                                    </div>
                                    <div className="text-xs text-pm-muted leading-tight">
                                        Out of 100<br />
                                        <span className="text-white">Strong Thesis</span>
                                    </div>
                                </div>
                                <div className="w-full bg-pm-border h-1.5 rounded-full mt-3 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-pm-purple to-pm-green"
                                        style={{ width: `${note.pmScore}%` }}
                                    />
                                </div>
                            </div>

                            {note.relatedTickers && (
                                <div className="mb-8">
                                    <h4 className="text-xs font-mono uppercase text-pm-muted mb-4 tracking-wider flex items-center gap-2">
                                        <Tag className="w-3 h-3" />
                                        Related Assets
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {note.relatedTickers.map(ticker => (
                                            <span key={ticker} className="px-3 py-1 bg-pm-charcoal hover:bg-white/10 border border-pm-border rounded-md text-xs font-mono text-pm-green cursor-pointer transition-colors">
                                                ${ticker}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="p-4 rounded-lg bg-pm-green/5 border border-pm-green/20">
                                <h4 className="text-sm font-bold text-pm-green mb-2">Research Note</h4>
                                <p className="text-xs text-pm-muted leading-relaxed">
                                    This analysis covers a 12-18 month structural outlook. Content is for informational and educational purposes only — not financial advice.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function ResearchFeed({ category = "All" }: ResearchFeedProps) {
    const { isSubscribed } = useSubscription();
    const { researchNotes } = useAdmin();
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState<ResearchNote | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate hydration/loading state
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleReadClick = (note: ResearchNote) => {
        if (isSubscribed) {
            setSelectedNote(note);
        } else {
            setShowPremiumModal(true);
        }
    };

    // Filter and Sort notes
    const filteredNotes = researchNotes
        .filter(note => category === "All" || note.category === category)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Show skeleton while loading
    if (isLoading) {
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <ResearchCardSkeleton key={index} />
                ))}
            </div>
        );
    }

    // Show empty state if no research notes
    if (filteredNotes.length === 0) {
        return (
            <div className="pm-card p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                    <Search className="w-12 h-12 text-pm-muted opacity-50" />
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">No Research Found</h3>
                        <p className="text-sm text-pm-muted">
                            No research notes found for category: <span className="text-pm-green">{category}</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Research Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note, index) => (
                    <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <ResearchCard
                            note={note}
                            onReadClick={() => handleReadClick(note)}
                            isSubscribed={isSubscribed}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Modals */}
            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
            />

            {selectedNote && (
                <FullContentModal
                    note={selectedNote}
                    onClose={() => setSelectedNote(null)}
                />
            )}
        </>
    );
}
