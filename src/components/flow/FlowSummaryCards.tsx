"use client";

import { Activity, TrendingUp, TrendingDown, Target } from "lucide-react";

interface FlowSummary {
    volume: number;
    volume_avg_ratio: number;
    call_pct: number;
    put_pct: number;
    pc_ratio: number;
    sentiment: "bullish" | "bearish" | "neutral";
}

export function FlowSummaryCards({ summary }: { summary: FlowSummary }) {
    const sentimentColor =
        summary.sentiment === "bullish" ? "text-pm-green" :
        summary.sentiment === "bearish" ? "text-pm-red" : "text-pm-muted";

    const formatVolume = (v: number) => {
        if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
        if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
        return v.toLocaleString();
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-pm-black/30 border border-pm-border/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-pm-green" />
                    <span className="text-[10px] text-pm-muted font-mono uppercase tracking-wider">Volume</span>
                </div>
                <div className="text-2xl font-bold font-mono text-pm-text">
                    {formatVolume(summary.volume)}
                </div>
                <div className="text-xs text-pm-muted font-mono mt-1">
                    {summary.volume_avg_ratio.toFixed(1)}x avg
                </div>
            </div>

            <div className="bg-pm-black/30 border border-pm-border/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-pm-green" />
                    <span className="text-[10px] text-pm-muted font-mono uppercase tracking-wider">Calls</span>
                </div>
                <div className="text-2xl font-bold font-mono text-pm-green">
                    {summary.call_pct.toFixed(0)}%
                </div>
                <div className="w-full bg-pm-border/30 rounded-full h-1.5 mt-2">
                    <div className="bg-pm-green h-1.5 rounded-full" style={{ width: `${summary.call_pct}%` }} />
                </div>
            </div>

            <div className="bg-pm-black/30 border border-pm-border/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-pm-red" />
                    <span className="text-[10px] text-pm-muted font-mono uppercase tracking-wider">Puts</span>
                </div>
                <div className="text-2xl font-bold font-mono text-pm-red">
                    {summary.put_pct.toFixed(0)}%
                </div>
                <div className="w-full bg-pm-border/30 rounded-full h-1.5 mt-2">
                    <div className="bg-pm-red h-1.5 rounded-full" style={{ width: `${summary.put_pct}%` }} />
                </div>
            </div>

            <div className="bg-pm-black/30 border border-pm-border/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-pm-purple" />
                    <span className="text-[10px] text-pm-muted font-mono uppercase tracking-wider">P/C Ratio</span>
                </div>
                <div className={`text-2xl font-bold font-mono ${sentimentColor}`}>
                    {summary.pc_ratio.toFixed(2)}
                </div>
                <div className={`text-xs font-mono font-semibold mt-1 uppercase ${sentimentColor}`}>
                    {summary.sentiment}
                </div>
            </div>
        </div>
    );
}
