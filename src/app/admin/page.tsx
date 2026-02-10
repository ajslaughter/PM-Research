"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Sparkles,
    Loader2,
    Check,
    AlertCircle,
    Send,
    Eye,
    Save,
    Trash2,
    LogOut,
} from "lucide-react";
import { ResearchNote } from "@/lib/portfolios";
import { useResearch } from "@/context/ResearchContext";
import { supabase } from "@/lib/supabase";

const categories = ["Sector Analysis", "Risk Assessment", "Deep Dive"];

export default function AdminPage() {
    const [topic, setTopic] = useState("");
    const [category, setCategory] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [generatedArticle, setGeneratedArticle] = useState<Partial<ResearchNote> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const { addResearchNote } = useResearch();
    const router = useRouter();

    // Get current user info
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || null);
            }
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        await fetch('/api/auth/session', { method: 'DELETE' });
        router.push('/login');
    };

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError("Please enter a topic");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedArticle(null);

        try {
            // Get the current session for auth token
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError("Session expired. Please log in again.");
                router.push('/login');
                return;
            }

            const response = await fetch("/api/generate-article", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ topic, category: category || undefined }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate article");
            }

            setGeneratedArticle(data.article);
            setError(null); // Ensure error is cleared on success
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate article");
            setGeneratedArticle(null); // Clear any stale article on error
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!generatedArticle) return;

        setIsSaving(true);
        setError(null);

        try {
            console.log('Saving article:', generatedArticle);
            // Use ResearchContext which saves to both Supabase AND local state
            await addResearchNote(generatedArticle as Omit<ResearchNote, 'id'>);

            setSuccess("Article saved and published!");
            setGeneratedArticle(null);
            setTopic("");
            setCategory("");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Save error:', err);
            const errorMessage = err instanceof Error ? err.message : "Failed to save article";
            setError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        setGeneratedArticle(null);
        setError(null);
    };

    return (
        <div className="relative min-h-screen">
            <div className="absolute inset-0 grid-bg opacity-30" />

            <div className="relative max-w-4xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-pm-purple/10 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-pm-purple" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Research Generator</h1>
                                <p className="text-pm-muted">AI-powered forward-looking research</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {userEmail && (
                                <span className="text-sm text-pm-muted hidden md:block">
                                    {userEmail}
                                </span>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-pm-charcoal border border-pm-border rounded-lg text-pm-muted hover:text-pm-text hover:border-red-500/30 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Generator Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="pm-card mb-8"
                >
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-pm-text mb-2">
                                Research Topic / Thesis
                            </label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Humanoid robotics, Solid-state batteries, Space manufacturing..."
                                className="w-full px-4 py-3 bg-pm-black border border-pm-border rounded-lg text-pm-text placeholder:text-pm-muted focus:outline-none focus:border-pm-green transition-colors"
                                disabled={isGenerating}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-pm-text mb-2">
                                Category (optional)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(category === cat ? "" : cat)}
                                        disabled={isGenerating}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            category === cat
                                                ? "bg-pm-green text-pm-black"
                                                : "bg-pm-charcoal border border-pm-border text-pm-muted hover:text-pm-text hover:border-pm-green/30"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !topic.trim()}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating Research...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Generate Article
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Error Message - only show if no article generated */}
                {error && !generatedArticle && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}

                {/* Success Message */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-pm-green/10 border border-pm-green/30 rounded-lg flex items-center gap-3 text-pm-green"
                    >
                        <Check className="w-5 h-5 flex-shrink-0" />
                        <span>{success}</span>
                    </motion.div>
                )}

                {/* Generated Article Preview */}
                {generatedArticle && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pm-card"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-pm-green">
                                <Eye className="w-5 h-5" />
                                <span className="font-medium">Preview</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-pm-green/10 border border-pm-green/30 rounded text-pm-green text-sm font-mono">
                                    PM Score: {generatedArticle.pmScore}
                                </span>
                                <span className="px-3 py-1 bg-pm-purple/10 border border-pm-purple/30 rounded text-pm-purple text-sm">
                                    {generatedArticle.category}
                                </span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold mb-3">{generatedArticle.title}</h2>
                        <p className="text-pm-muted mb-4">{generatedArticle.summary}</p>

                        {generatedArticle.relatedTickers && generatedArticle.relatedTickers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {generatedArticle.relatedTickers.map((ticker) => (
                                    <span
                                        key={ticker}
                                        className="px-2 py-1 bg-pm-charcoal border border-pm-border rounded text-xs font-mono text-pm-green"
                                    >
                                        ${ticker}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="border-t border-pm-border pt-6 mb-6">
                            <div className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-pm-text/80 prose-li:text-pm-text/80">
                                {generatedArticle.fullContent?.split('\n').map((line, i) => {
                                    if (line.startsWith('## ')) {
                                        return <h2 key={i} className="text-xl mt-6 mb-3 border-l-2 border-pm-green pl-4">{line.replace('## ', '')}</h2>;
                                    }
                                    if (line.startsWith('### ')) {
                                        return <h3 key={i} className="text-lg mt-4 mb-2 text-pm-purple font-mono">{line.replace('### ', '')}</h3>;
                                    }
                                    if (line.startsWith('* ')) {
                                        return <li key={i} className="ml-4 list-disc marker:text-pm-green pl-2 mb-1">{line.replace('* ', '')}</li>;
                                    }
                                    if (line.trim() === '') return <div key={i} className="h-3" />;
                                    return <p key={i} className="mb-2">{line}</p>;
                                })}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save & Publish
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDiscard}
                                disabled={isSaving}
                                className="px-6 py-3 bg-pm-charcoal border border-pm-border rounded-lg text-pm-muted hover:text-pm-text hover:border-red-500/30 transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-5 h-5" />
                                Discard
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
