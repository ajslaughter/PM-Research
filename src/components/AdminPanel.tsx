"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "@/context/AdminContext";
import { ResearchNote, PortfolioPosition } from "@/lib/mockData";
import {
    Settings,
    Plus,
    X,
    Save,
    Trash2,
    Edit3,
    FileText,
    Briefcase,
    ChevronDown,
} from "lucide-react";

// Types for forms
type ResearchCategory = "Alpha Signal" | "Sector Analysis" | "Risk Alert" | "Deep Dive";

interface ResearchFormData {
    title: string;
    summary: string;
    fullContent: string;
    category: ResearchCategory;
    pmScore: number;
    readTime: string;
    author: string;
    relatedTickers: string;
}

interface PortfolioFormData {
    entryPrice: number;
    pmScore: number;
    status: "Open" | "Closed";
}

// Admin Panel Component
export default function AdminPanel() {
    const { isAdmin, researchNotes, portfolio, addResearchNote, updateResearchNote, deleteResearchNote, updatePortfolioPosition } = useAdmin();

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"research" | "portfolio">("research");

    // Research form state
    const [showResearchForm, setShowResearchForm] = useState(false);
    const [editingResearch, setEditingResearch] = useState<ResearchNote | null>(null);
    const [researchForm, setResearchForm] = useState<ResearchFormData>({
        title: "",
        summary: "",
        fullContent: "",
        category: "Alpha Signal",
        pmScore: 85,
        readTime: "5 min",
        author: "",
        relatedTickers: "",
    });

    // Portfolio form state
    const [editingPortfolio, setEditingPortfolio] = useState<PortfolioPosition | null>(null);
    const [portfolioForm, setPortfolioForm] = useState<PortfolioFormData>({
        entryPrice: 0,
        pmScore: 85,
        status: "Open",
    });

    // Don't render if not admin
    if (!isAdmin) return null;

    // Reset research form
    const resetResearchForm = () => {
        setResearchForm({
            title: "",
            summary: "",
            fullContent: "",
            category: "Alpha Signal",
            pmScore: 85,
            readTime: "5 min",
            author: "",
            relatedTickers: "",
        });
        setEditingResearch(null);
        setShowResearchForm(false);
    };

    // Handle research submit
    const handleResearchSubmit = () => {
        const noteData = {
            title: researchForm.title,
            summary: researchForm.summary,
            fullContent: researchForm.fullContent,
            category: researchForm.category,
            pmScore: researchForm.pmScore,
            readTime: researchForm.readTime,
            author: researchForm.author || undefined,
            relatedTickers: researchForm.relatedTickers
                ? researchForm.relatedTickers.split(",").map((t) => t.trim())
                : undefined,
            date: new Date().toISOString().split("T")[0],
        };

        if (editingResearch) {
            updateResearchNote(editingResearch.id, noteData);
        } else {
            addResearchNote(noteData);
        }

        resetResearchForm();
    };

    // Handle edit research
    const handleEditResearch = (note: ResearchNote) => {
        setEditingResearch(note);
        setResearchForm({
            title: note.title,
            summary: note.summary,
            fullContent: note.fullContent,
            category: note.category,
            pmScore: note.pmScore,
            readTime: note.readTime,
            author: note.author || "",
            relatedTickers: note.relatedTickers?.join(", ") || "",
        });
        setShowResearchForm(true);
    };

    // Handle edit portfolio
    const handleEditPortfolio = (position: PortfolioPosition) => {
        setEditingPortfolio(position);
        setPortfolioForm({
            entryPrice: position.entryPrice,
            pmScore: position.pmScore,
            status: position.status,
        });
    };

    // Handle portfolio submit
    const handlePortfolioSubmit = () => {
        if (editingPortfolio) {
            updatePortfolioPosition(editingPortfolio.ticker, portfolioForm);
            setEditingPortfolio(null);
        }
    };

    return (
        <>
            {/* Admin Toggle Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-pm-purple to-pm-green shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            >
                <Settings className="w-6 h-6 text-white" />
            </motion.button>

            {/* Admin Panel */}
            <AnimatePresence>
                {isPanelOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 400 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 400 }}
                        className="fixed top-0 right-0 h-full w-full max-w-lg bg-pm-dark border-l border-pm-border z-50 overflow-y-auto shadow-2xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-pm-black border-b border-pm-border p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pm-purple to-pm-green flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg">Admin Panel</h2>
                                    <p className="text-xs text-pm-muted">Manage content</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPanelOpen(false)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-pm-border">
                            <button
                                onClick={() => setActiveTab("research")}
                                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === "research"
                                        ? "bg-pm-charcoal text-pm-green border-b-2 border-pm-green"
                                        : "text-pm-muted hover:text-white"
                                    }`}
                            >
                                <FileText className="w-4 h-4" />
                                Research
                            </button>
                            <button
                                onClick={() => setActiveTab("portfolio")}
                                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === "portfolio"
                                        ? "bg-pm-charcoal text-pm-green border-b-2 border-pm-green"
                                        : "text-pm-muted hover:text-white"
                                    }`}
                            >
                                <Briefcase className="w-4 h-4" />
                                Portfolio
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            {activeTab === "research" && (
                                <div className="space-y-4">
                                    {/* Add New Button */}
                                    {!showResearchForm && (
                                        <button
                                            onClick={() => setShowResearchForm(true)}
                                            className="w-full py-3 rounded-lg border-2 border-dashed border-pm-border text-pm-muted hover:border-pm-green hover:text-pm-green transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Add New Research Article
                                        </button>
                                    )}

                                    {/* Research Form */}
                                    {showResearchForm && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-pm-charcoal rounded-lg border border-pm-border p-4 space-y-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold">
                                                    {editingResearch ? "Edit Article" : "New Article"}
                                                </h3>
                                                <button
                                                    onClick={resetResearchForm}
                                                    className="p-1 hover:bg-white/10 rounded"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Title"
                                                value={researchForm.title}
                                                onChange={(e) => setResearchForm({ ...researchForm, title: e.target.value })}
                                                className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm focus:border-pm-green focus:outline-none"
                                            />

                                            <textarea
                                                placeholder="Summary"
                                                value={researchForm.summary}
                                                onChange={(e) => setResearchForm({ ...researchForm, summary: e.target.value })}
                                                rows={2}
                                                className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm focus:border-pm-green focus:outline-none resize-none"
                                            />

                                            <textarea
                                                placeholder="Full Content (supports markdown-like formatting with ## and ###)"
                                                value={researchForm.fullContent}
                                                onChange={(e) => setResearchForm({ ...researchForm, fullContent: e.target.value })}
                                                rows={6}
                                                className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm focus:border-pm-green focus:outline-none resize-none font-mono"
                                            />

                                            <div className="grid grid-cols-2 gap-3">
                                                <select
                                                    value={researchForm.category}
                                                    onChange={(e) => setResearchForm({ ...researchForm, category: e.target.value as ResearchCategory })}
                                                    className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm focus:border-pm-green focus:outline-none"
                                                >
                                                    <option value="Alpha Signal">Alpha Signal</option>
                                                    <option value="Sector Analysis">Sector Analysis</option>
                                                    <option value="Risk Alert">Risk Alert</option>
                                                    <option value="Deep Dive">Deep Dive</option>
                                                </select>

                                                <input
                                                    type="number"
                                                    placeholder="PM Score"
                                                    value={researchForm.pmScore}
                                                    onChange={(e) => setResearchForm({ ...researchForm, pmScore: parseInt(e.target.value) || 0 })}
                                                    min={0}
                                                    max={100}
                                                    className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm focus:border-pm-green focus:outline-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    placeholder="Read Time (e.g., 5 min)"
                                                    value={researchForm.readTime}
                                                    onChange={(e) => setResearchForm({ ...researchForm, readTime: e.target.value })}
                                                    className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm focus:border-pm-green focus:outline-none"
                                                />

                                                <input
                                                    type="text"
                                                    placeholder="Author"
                                                    value={researchForm.author}
                                                    onChange={(e) => setResearchForm({ ...researchForm, author: e.target.value })}
                                                    className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm focus:border-pm-green focus:outline-none"
                                                />
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Related Tickers (comma separated, e.g., NVDA, MSFT)"
                                                value={researchForm.relatedTickers}
                                                onChange={(e) => setResearchForm({ ...researchForm, relatedTickers: e.target.value })}
                                                className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm focus:border-pm-green focus:outline-none"
                                            />

                                            <button
                                                onClick={handleResearchSubmit}
                                                disabled={!researchForm.title || !researchForm.summary}
                                                className="w-full py-2 rounded-lg bg-pm-green text-pm-black font-medium flex items-center justify-center gap-2 hover:bg-pm-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Save className="w-4 h-4" />
                                                {editingResearch ? "Update Article" : "Publish Article"}
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* Existing Articles List */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm text-pm-muted font-mono uppercase tracking-wider">
                                            Existing Articles ({researchNotes.length})
                                        </h4>
                                        {researchNotes.map((note) => (
                                            <div
                                                key={note.id}
                                                className="bg-pm-charcoal/50 rounded-lg border border-pm-border p-3 flex items-start justify-between gap-3"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-medium text-sm truncate">{note.title}</h5>
                                                    <p className="text-xs text-pm-muted truncate">{note.summary}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] px-2 py-0.5 rounded bg-pm-green/10 text-pm-green">
                                                            {note.category}
                                                        </span>
                                                        <span className="text-[10px] text-pm-muted">{note.date}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleEditResearch(note)}
                                                        className="p-2 rounded hover:bg-white/10 text-pm-muted hover:text-white transition-colors"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteResearchNote(note.id)}
                                                        className="p-2 rounded hover:bg-red-500/20 text-pm-muted hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "portfolio" && (
                                <div className="space-y-4">
                                    {/* Edit Portfolio Form */}
                                    {editingPortfolio && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-pm-charcoal rounded-lg border border-pm-border p-4 space-y-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold">
                                                    Edit {editingPortfolio.ticker}
                                                </h3>
                                                <button
                                                    onClick={() => setEditingPortfolio(null)}
                                                    className="p-1 hover:bg-white/10 rounded"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-pm-muted mb-1 block">Entry Price</label>
                                                    <input
                                                        type="number"
                                                        value={portfolioForm.entryPrice}
                                                        onChange={(e) => setPortfolioForm({ ...portfolioForm, entryPrice: parseFloat(e.target.value) || 0 })}
                                                        step="0.01"
                                                        className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm focus:border-pm-green focus:outline-none"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-xs text-pm-muted mb-1 block">PM Score</label>
                                                    <input
                                                        type="number"
                                                        value={portfolioForm.pmScore}
                                                        onChange={(e) => setPortfolioForm({ ...portfolioForm, pmScore: parseInt(e.target.value) || 0 })}
                                                        min={0}
                                                        max={100}
                                                        className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm focus:border-pm-green focus:outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs text-pm-muted mb-1 block">Status</label>
                                                <select
                                                    value={portfolioForm.status}
                                                    onChange={(e) => setPortfolioForm({ ...portfolioForm, status: e.target.value as "Open" | "Closed" })}
                                                    className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm focus:border-pm-green focus:outline-none"
                                                >
                                                    <option value="Open">Open</option>
                                                    <option value="Closed">Closed</option>
                                                </select>
                                            </div>

                                            <button
                                                onClick={handlePortfolioSubmit}
                                                className="w-full py-2 rounded-lg bg-pm-green text-pm-black font-medium flex items-center justify-center gap-2 hover:bg-pm-green/90 transition-colors"
                                            >
                                                <Save className="w-4 h-4" />
                                                Update Position
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* Portfolio Positions List */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm text-pm-muted font-mono uppercase tracking-wider">
                                            Positions ({portfolio.length})
                                        </h4>
                                        {portfolio.map((position) => (
                                            <div
                                                key={position.ticker}
                                                className="bg-pm-charcoal/50 rounded-lg border border-pm-border p-3 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-pm-green/10 flex items-center justify-center font-mono font-bold text-pm-green text-sm">
                                                        {position.ticker.slice(0, 4)}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-medium text-sm">{position.ticker}</h5>
                                                        <p className="text-xs text-pm-muted">{position.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="text-sm font-mono">${position.entryPrice.toFixed(2)}</div>
                                                        <div className="text-xs text-pm-muted">Entry</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-mono text-pm-green">{position.pmScore}</div>
                                                        <div className="text-xs text-pm-muted">Score</div>
                                                    </div>
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded ${position.status === "Open"
                                                                ? "bg-pm-green/10 text-pm-green"
                                                                : "bg-pm-muted/10 text-pm-muted"
                                                            }`}
                                                    >
                                                        {position.status}
                                                    </span>
                                                    <button
                                                        onClick={() => handleEditPortfolio(position)}
                                                        className="p-2 rounded hover:bg-white/10 text-pm-muted hover:text-white transition-colors"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
