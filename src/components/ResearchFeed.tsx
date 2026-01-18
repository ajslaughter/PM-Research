"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscription } from "@/context/SubscriptionContext";
import { mockResearchNotes, ResearchNote } from "@/lib/mockData";
import {
    Clock,
    Sparkles,
    ArrowRight,
    Lock,
    X,
    AlertTriangle,
    TrendingUp,
    Search,
    LineChart,
} from "lucide-react";
import Link from "next/link";
import PremiumModal from "@/components/PremiumModal";
import React from "react";

// Category styling
const categoryStyles: Record<string, string> = {
    "Alpha Signal": "bg-pm-green/10 text-pm-green border-pm-green/30",
    "Sector Analysis": "bg-pm-purple/10 text-pm-purple border-pm-purple/30",
    "Risk Alert": "bg-pm-red/10 text-pm-red border-pm-red/30",
    "Deep Dive": "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

const categoryIcons: Record<string, React.ReactNode> = {
    "Alpha Signal": <TrendingUp className="w-4 h-4" />,
    "Sector Analysis": <LineChart className="w-4 h-4" />,
    "Risk Alert": <AlertTriangle className="w-4 h-4" />,
    "Deep Dive": <Search className="w-4 h-4" />,
};



interface ResearchCardProps {
    note: ResearchNote;
    onReadClick: () => void;
    isSubscribed: boolean;
}

function ResearchCard({ note, onReadClick, isSubscribed }: ResearchCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pm-card-hover group h-full flex flex-col"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <span
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono border ${categoryStyles[note.category]
                        }`}
                >
                    {categoryIcons[note.category]}
                    {note.category}
                </span>

                <span className="pm-score">
                    <Sparkles className="w-3 h-3" />
                    {note.pmScore}
                </span>
            </div>

            {/* Title & Summary */}
            <h3 className="text-lg font-semibold mb-2 group-hover:text-pm-green transition-colors">
                {note.title}
            </h3>
            <p className="text-pm-muted text-sm leading-relaxed flex-1">
                {note.summary}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-pm-border">
                <div className="flex items-center gap-4 text-xs text-pm-muted">
                    <span>{note.date}</span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {note.readTime}
                    </span>
                </div>

                <button
                    onClick={onReadClick}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${isSubscribed
                        ? "text-pm-green hover:text-pm-green/80"
                        : "text-pm-muted hover:text-pm-purple"
                        }`}
                >
                    {isSubscribed ? "Read Analysis" : "Premium Only"}
                    {isSubscribed ? (
                        <ArrowRight className="w-4 h-4" />
                    ) : (
                        <Lock className="w-4 h-4" />
                    )}
                </button>
            </div>
        </motion.div>
    );
}

interface FullContentModalProps {
    note: ResearchNote | null;
    onClose: () => void;
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
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto"
            >
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    onClick={(e) => e.stopPropagation()}
                    className="max-w-3xl mx-auto my-8 px-4"
                >
                    <div className="pm-card relative">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-pm-muted hover:text-pm-text transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <span
                                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono border ${categoryStyles[note.category]
                                        }`}
                                >
                                    {categoryIcons[note.category]}
                                    {note.category}
                                </span>
                                <span className="pm-score">
                                    <Sparkles className="w-3 h-3" />
                                    PM Score: {note.pmScore}
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold mb-2">{note.title}</h2>

                            <div className="flex items-center gap-4 text-sm text-pm-muted">
                                <span>{note.date}</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {note.readTime}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="prose prose-invert max-w-none">
                            <div
                                className="text-pm-text/90 leading-relaxed whitespace-pre-wrap font-mono text-sm"
                                style={{ whiteSpace: "pre-wrap" }}
                            >
                                {note.fullContent}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-pm-border flex items-center justify-between">
                            <span className="text-sm text-pm-muted">
                                PM Research &bull; Premium Analysis
                            </span>
                            <button onClick={onClose} className="btn-secondary text-sm py-2">
                                Close
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function ResearchFeed() {
    const { isSubscribed } = useSubscription();
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState<ResearchNote | null>(null);

    const handleReadClick = (note: ResearchNote) => {
        if (isSubscribed) {
            setSelectedNote(note);
        } else {
            setShowPremiumModal(true);
        }
    };

    return (
        <>
            {/* Research Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockResearchNotes.map((note, index) => (
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
