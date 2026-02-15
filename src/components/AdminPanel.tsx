"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "@/context/AdminContext";
import { ResearchNote } from "@/lib/portfolios";
import { StockData } from "@/data/stockDatabase";
import {
    Settings,
    Plus,
    X,
    Save,
    Trash2,
    Edit3,
    FileText,
    Briefcase,
    RefreshCw,
    AlertTriangle,
    Check,
    Search,
} from "lucide-react";

// Types for forms
type ResearchCategory = "Sector Analysis" | "Deep Dive";

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

// Admin Panel Component
export default function AdminPanel() {
    const {
        isAdmin,
        researchNotes,
        portfolios,
        activePortfolioId,
        setActivePortfolioId,
        stockDb,
        addResearchNote,
        updateResearchNote,
        deleteResearchNote,
        addPortfolio,
        updatePortfolio,
        deletePortfolio,
        addPosition,
        updatePosition,
        removePosition,
        rebalanceWeights,
        addStock,
    } = useAdmin();

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"research" | "portfolio">("portfolio");

    // Research form state
    const [showResearchForm, setShowResearchForm] = useState(false);
    const [editingResearch, setEditingResearch] = useState<ResearchNote | null>(null);
    const [researchForm, setResearchForm] = useState<ResearchFormData>({
        title: "",
        summary: "",
        fullContent: "",
        category: "Sector Analysis",
        pmScore: 85,
        readTime: "5 min",
        author: "",
        relatedTickers: "",
    });

    // Portfolio form state
    const [showNewPortfolioForm, setShowNewPortfolioForm] = useState(false);
    const [newPortfolioName, setNewPortfolioName] = useState("");
    const [newPortfolioDesc, setNewPortfolioDesc] = useState("");

    // Add position state
    const [newTicker, setNewTicker] = useState("");
    const [newWeight, setNewWeight] = useState(10);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState("");

    // Get current portfolio
    const currentPortfolio = portfolios.find((p) => p.id === activePortfolioId);

    // Calculate total weight for current portfolio
    const totalWeight = currentPortfolio?.positions.reduce((acc, p) => acc + p.weight, 0) || 0;
    const weightWarning = totalWeight !== 100;

    // Don't render if not admin
    if (!isAdmin) return null;

    // Reset research form
    const resetResearchForm = () => {
        setResearchForm({
            title: "",
            summary: "",
            fullContent: "",
            category: "Sector Analysis",
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

    // Handle new portfolio submit
    const handleNewPortfolioSubmit = () => {
        if (newPortfolioName.trim()) {
            addPortfolio(newPortfolioName.trim(), newPortfolioDesc.trim());
            setNewPortfolioName("");
            setNewPortfolioDesc("");
            setShowNewPortfolioForm(false);
        }
    };

    // Handle add position
    const handleAddPosition = async () => {
        if (!newTicker.trim() || !currentPortfolio) return;

        const ticker = newTicker.trim().toUpperCase();
        setSearchError("");

        // Check if already in portfolio
        if (currentPortfolio.positions.find((p) => p.ticker === ticker)) {
            setSearchError("Ticker already in portfolio");
            return;
        }

        // Check if in stock database
        if (stockDb[ticker]) {
            addPosition(currentPortfolio.id, ticker, newWeight);
            setNewTicker("");
            return;
        }

        // Fetch from API
        setIsSearching(true);
        try {
            const res = await fetch(`/api/stock-info?ticker=${ticker}`);
            if (res.ok) {
                const data = await res.json();
                // Add to stock database
                const newStock: StockData = {
                    ticker: data.ticker,
                    name: data.name,
                    assetClass: data.assetClass || 'Unknown',
                    sector: data.sector || 'Unknown',
                    yearlyClose: data.yearlyClose,
                    pmScore: data.pmScore || 75,
                    lastUpdated: data.lastUpdated || new Date().toISOString().split('T')[0],
                };
                addStock(newStock);
                addPosition(currentPortfolio.id, ticker, newWeight);
                setNewTicker("");
            } else {
                setSearchError("Ticker not found");
            }
        } catch (error) {
            setSearchError("Failed to fetch ticker info");
        } finally {
            setIsSearching(false);
        }
    };

    // Handle weight change
    const handleWeightChange = (ticker: string, weight: number) => {
        if (currentPortfolio) {
            updatePosition(currentPortfolio.id, ticker, weight);
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
                                    <p className="text-xs text-pm-muted">Manage portfolios & content</p>
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
                                onClick={() => setActiveTab("portfolio")}
                                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === "portfolio"
                                    ? "bg-pm-charcoal text-pm-green border-b-2 border-pm-green"
                                    : "text-pm-muted hover:text-white"
                                    }`}
                            >
                                <Briefcase className="w-4 h-4" />
                                Portfolio
                            </button>
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
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            {activeTab === "portfolio" && (
                                <div className="space-y-4">
                                    {/* Portfolio Selector */}
                                    <div className="space-y-2">
                                        <label className="text-xs text-pm-muted uppercase tracking-wider">
                                            Select Portfolio
                                        </label>
                                        <div className="flex gap-2">
                                            <select
                                                value={activePortfolioId}
                                                onChange={(e) => setActivePortfolioId(e.target.value)}
                                                className="flex-1 px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm focus:border-pm-green focus:outline-none"
                                            >
                                                {portfolios.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => setShowNewPortfolioForm(true)}
                                                className="px-3 py-2 bg-pm-green/10 text-pm-green border border-pm-green/30 rounded-lg hover:bg-pm-green/20 transition-colors"
                                                title="Create new portfolio"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Portfolio Form */}
                                    {showNewPortfolioForm && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-pm-charcoal rounded-lg border border-pm-border p-4 space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-sm">New Portfolio</h3>
                                                <button onClick={() => setShowNewPortfolioForm(false)} className="p-1 hover:bg-white/10 rounded">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Portfolio Name"
                                                value={newPortfolioName}
                                                onChange={(e) => setNewPortfolioName(e.target.value)}
                                                className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm focus:border-pm-green focus:outline-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                value={newPortfolioDesc}
                                                onChange={(e) => setNewPortfolioDesc(e.target.value)}
                                                className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm focus:border-pm-green focus:outline-none"
                                            />
                                            <button
                                                onClick={handleNewPortfolioSubmit}
                                                disabled={!newPortfolioName.trim()}
                                                className="w-full py-2 rounded-lg bg-pm-green text-pm-black font-medium flex items-center justify-center gap-2 hover:bg-pm-green/90 transition-colors disabled:opacity-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Create Portfolio
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* Current Portfolio Info */}
                                    {currentPortfolio && (
                                        <div className="bg-pm-charcoal/50 rounded-lg border border-pm-border p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-bold">{currentPortfolio.name}</h3>
                                                    <p className="text-xs text-pm-muted">{currentPortfolio.description}</p>
                                                </div>
                                                {portfolios.length > 1 && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`Delete "${currentPortfolio.name}"?`)) {
                                                                deletePortfolio(currentPortfolio.id);
                                                            }
                                                        }}
                                                        className="p-2 rounded hover:bg-red-500/20 text-pm-muted hover:text-red-400 transition-colors"
                                                        title="Delete portfolio"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Weight Warning */}
                                            {weightWarning && (
                                                <div className={`flex items-center gap-2 text-xs p-2 rounded ${totalWeight > 100 ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                    <AlertTriangle className="w-4 h-4" />
                                                    <span>
                                                        Total weight: {totalWeight.toFixed(1)}%
                                                        {totalWeight > 100 ? ' (over-allocated)' : ' (under-allocated)'}
                                                    </span>
                                                </div>
                                            )}

                                            {!weightWarning && (
                                                <div className="flex items-center gap-2 text-xs p-2 rounded bg-pm-green/10 text-pm-green">
                                                    <Check className="w-4 h-4" />
                                                    <span>Fully allocated (100%)</span>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => rebalanceWeights(currentPortfolio.id)}
                                                    disabled={currentPortfolio.positions.length === 0}
                                                    className="flex-1 py-2 rounded-lg bg-pm-purple/10 text-pm-purple border border-pm-purple/30 text-xs font-medium flex items-center justify-center gap-2 hover:bg-pm-purple/20 transition-colors disabled:opacity-50"
                                                >
                                                    <RefreshCw className="w-3 h-3" />
                                                    Equal Weight
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Add Position */}
                                    <div className="bg-pm-charcoal/50 rounded-lg border border-pm-border p-4 space-y-3">
                                        <h4 className="text-sm font-medium">Add Position</h4>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Ticker (e.g., AAPL)"
                                                    value={newTicker}
                                                    onChange={(e) => {
                                                        setNewTicker(e.target.value.toUpperCase());
                                                        setSearchError("");
                                                    }}
                                                    className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm focus:border-pm-green focus:outline-none"
                                                />
                                            </div>
                                            <div className="w-20">
                                                <input
                                                    type="number"
                                                    placeholder="Weight"
                                                    value={newWeight}
                                                    onChange={(e) => setNewWeight(parseFloat(e.target.value) || 0)}
                                                    min={0}
                                                    max={100}
                                                    step={0.1}
                                                    className="w-full px-3 py-2 bg-pm-black border border-pm-border rounded-lg text-sm focus:border-pm-green focus:outline-none"
                                                />
                                            </div>
                                            <button
                                                onClick={handleAddPosition}
                                                disabled={!newTicker.trim() || isSearching}
                                                className="px-3 py-2 bg-pm-green text-pm-black rounded-lg hover:bg-pm-green/90 transition-colors disabled:opacity-50"
                                            >
                                                {isSearching ? (
                                                    <Search className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Plus className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                        {searchError && (
                                            <p className="text-xs text-red-400">{searchError}</p>
                                        )}
                                    </div>

                                    {/* Positions List */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm text-pm-muted font-semibold uppercase tracking-wider">
                                            Positions ({currentPortfolio?.positions.length || 0})
                                        </h4>
                                        {currentPortfolio?.positions.map((position) => {
                                            const stock = stockDb[position.ticker];
                                            return (
                                                <div
                                                    key={position.ticker}
                                                    className="bg-pm-charcoal/50 rounded-lg border border-pm-border p-3 flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="w-10 h-10 rounded-lg bg-pm-green/10 flex items-center justify-center font-bold text-pm-green text-xs">
                                                            {position.ticker.slice(0, 4)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h5 className="font-medium text-sm">{position.ticker}</h5>
                                                            <p className="text-xs text-pm-muted truncate">
                                                                {stock?.name || 'Unknown'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                value={position.weight}
                                                                onChange={(e) => handleWeightChange(position.ticker, parseFloat(e.target.value) || 0)}
                                                                min={0}
                                                                max={100}
                                                                step={0.1}
                                                                className="w-16 px-2 py-1 bg-pm-black border border-pm-border rounded text-sm text-right focus:border-pm-green focus:outline-none"
                                                            />
                                                            <span className="text-xs text-pm-muted">%</span>
                                                        </div>
                                                        <button
                                                            onClick={() => removePosition(currentPortfolio.id, position.ticker)}
                                                            className="p-2 rounded hover:bg-red-500/20 text-pm-muted hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(!currentPortfolio?.positions || currentPortfolio.positions.length === 0) && (
                                            <p className="text-sm text-pm-muted text-center py-4">
                                                No positions. Add some above.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

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
                                                    <option value="Sector Analysis">Sector Analysis</option>
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
                                        <h4 className="text-sm text-pm-muted font-semibold uppercase tracking-wider">
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
