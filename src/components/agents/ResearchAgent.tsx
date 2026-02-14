"use client";

import { useState } from "react";
import { Loader2, Search, FileText } from "lucide-react";

const DEPTH_OPTIONS = [
    { key: "quick", label: "Quick", desc: "3-5 sources, ~30s" },
    { key: "standard", label: "Standard", desc: "10+ sources, ~60s" },
    { key: "deep", label: "Deep", desc: "20+ sources, ~2min" },
];

export function ResearchAgent() {
    const [topic, setTopic] = useState("");
    const [depth, setDepth] = useState("quick");
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const runResearch = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setError(null);
        setReport(null);

        try {
            const res = await fetch("/api/agents/research", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: topic.trim(), depth }),
            });

            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || "Research failed");
            }

            const json = await res.json();
            setReport(json.report);
        } catch (err: any) {
            setError(err.message || "Research failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="Research topic (e.g. 'NVIDIA AI chip market dominance')"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runResearch()}
                    className="w-full px-4 py-3 bg-pm-black/50 border border-pm-border/50 rounded-lg text-sm text-pm-text placeholder:text-pm-subtle focus:outline-none focus:border-pm-green/50"
                />

                <div className="flex gap-2">
                    {DEPTH_OPTIONS.map((d) => (
                        <button
                            key={d.key}
                            onClick={() => setDepth(d.key)}
                            className={`flex-1 px-3 py-2.5 text-xs font-mono rounded-lg transition-all border ${
                                depth === d.key
                                    ? "bg-pm-green/10 text-pm-green font-semibold border-pm-green/30"
                                    : "text-pm-muted hover:text-pm-text border-pm-border/50"
                            }`}
                        >
                            <div className="font-semibold">{d.label}</div>
                            <div className="text-[10px] mt-0.5 opacity-60">{d.desc}</div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={runResearch}
                    disabled={loading || !topic.trim()}
                    className="w-full px-5 py-3 bg-pm-green text-pm-black text-sm font-semibold rounded-lg hover:bg-pm-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Researching...
                        </>
                    ) : (
                        <>
                            <Search className="w-4 h-4" />
                            Start Research
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="bg-pm-red/5 border border-pm-red/20 rounded-lg px-4 py-3">
                    <p className="text-sm text-pm-red font-mono">{error}</p>
                </div>
            )}

            {report && (
                <div className="bg-pm-black/30 border border-pm-border/30 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-pm-border/30 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-pm-green" />
                        <h3 className="text-sm font-semibold text-pm-text">Research Report</h3>
                    </div>
                    <div className="p-4">
                        <pre className="text-sm text-pm-text whitespace-pre-wrap leading-relaxed font-sans">
                            {report}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
