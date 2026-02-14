"use client";

import { useState } from "react";
import { Loader2, Rocket } from "lucide-react";

const COMMANDS = [
    { key: "upcoming", label: "Upcoming" },
    { key: "week", label: "This Week" },
    { key: "recent", label: "Recent" },
    { key: "spac", label: "SPACs" },
    { key: "lockup", label: "Lock-ups" },
];

export function IPOAgent() {
    const [command, setCommand] = useState("upcoming");
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const runIPO = async (cmd?: string) => {
        const c = cmd || command;
        setCommand(c);
        setLoading(true);
        setError(null);
        setReport(null);

        try {
            const res = await fetch("/api/agents/ipo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command: c }),
            });

            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || "IPO fetch failed");
            }

            const json = await res.json();
            setReport(json.report);
        } catch (err: any) {
            setError(err.message || "IPO fetch failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                {COMMANDS.map((cmd) => (
                    <button
                        key={cmd.key}
                        onClick={() => runIPO(cmd.key)}
                        disabled={loading}
                        className={`px-4 py-2.5 text-xs font-mono rounded-lg transition-all border ${
                            command === cmd.key
                                ? "bg-pm-purple/20 text-pm-purple font-semibold border-pm-purple/40"
                                : "text-pm-muted hover:text-pm-text border-pm-border/50 hover:border-pm-border"
                        }`}
                    >
                        {cmd.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="flex items-center justify-center py-16 gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-pm-purple" />
                    <span className="text-sm text-pm-muted font-mono">Fetching IPO data...</span>
                </div>
            )}

            {error && (
                <div className="bg-pm-red/5 border border-pm-red/20 rounded-lg px-4 py-3">
                    <p className="text-sm text-pm-red font-mono">{error}</p>
                </div>
            )}

            {!loading && report && (
                <div className="bg-pm-black/30 border border-pm-border/30 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-pm-border/30 flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-pm-purple" />
                        <h3 className="text-sm font-semibold text-pm-text">IPO Calendar</h3>
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
