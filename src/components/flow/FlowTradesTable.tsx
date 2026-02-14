"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";

interface FlowTrade {
    strike: number;
    expiry: string;
    type: "call" | "put";
    premium: number;
    trade_type: string;
}

type SortKey = "premium" | "strike";

export function FlowTradesTable({ trades }: { trades: FlowTrade[] }) {
    const [sortBy, setSortBy] = useState<SortKey>("premium");
    const [sortDesc, setSortDesc] = useState(true);

    const sorted = [...trades].sort((a, b) => {
        const diff = sortBy === "premium" ? b.premium - a.premium : b.strike - a.strike;
        return sortDesc ? diff : -diff;
    });

    const toggleSort = (col: SortKey) => {
        if (sortBy === col) setSortDesc(!sortDesc);
        else { setSortBy(col); setSortDesc(true); }
    };

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortBy !== col) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
        return sortDesc ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />;
    };

    const formatPremium = (v: number) => {
        if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
        if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
        return `$${v.toLocaleString()}`;
    };

    if (!trades.length) return null;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-pm-border/50">
                        <th
                            className="text-left px-3 py-2.5 text-[10px] font-mono text-pm-muted uppercase tracking-wider cursor-pointer hover:text-pm-text transition-colors"
                            onClick={() => toggleSort("strike")}
                        >
                            <div className="flex items-center gap-1">Strike <SortIcon col="strike" /></div>
                        </th>
                        <th className="text-left px-3 py-2.5 text-[10px] font-mono text-pm-muted uppercase tracking-wider">
                            Expiry
                        </th>
                        <th className="text-left px-3 py-2.5 text-[10px] font-mono text-pm-muted uppercase tracking-wider">
                            Type
                        </th>
                        <th
                            className="text-right px-3 py-2.5 text-[10px] font-mono text-pm-muted uppercase tracking-wider cursor-pointer hover:text-pm-text transition-colors"
                            onClick={() => toggleSort("premium")}
                        >
                            <div className="flex items-center justify-end gap-1">Premium <SortIcon col="premium" /></div>
                        </th>
                        <th className="text-left px-3 py-2.5 text-[10px] font-mono text-pm-muted uppercase tracking-wider">
                            Trade
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((trade, i) => (
                        <tr key={i} className="border-b border-pm-border/10 hover:bg-pm-border/5 transition-colors">
                            <td className="px-3 py-2.5 font-mono font-semibold text-pm-text">
                                ${trade.strike.toLocaleString()}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-pm-muted text-xs">
                                {trade.expiry}
                            </td>
                            <td className="px-3 py-2.5">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                    trade.type === "call"
                                        ? "bg-pm-green/10 text-pm-green border border-pm-green/20"
                                        : "bg-pm-red/10 text-pm-red border border-pm-red/20"
                                }`}>
                                    {trade.type}
                                </span>
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono font-semibold text-pm-text">
                                {formatPremium(trade.premium)}
                            </td>
                            <td className="px-3 py-2.5 text-xs font-mono text-pm-muted uppercase">
                                {trade.trade_type}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
