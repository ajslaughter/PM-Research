"use client";

import { useState } from "react";
import { Loader2, Search, TrendingUp, DollarSign } from "lucide-react";
import { FlowSummaryCards } from "@/components/flow/FlowSummaryCards";
import { FlowTradesTable } from "@/components/flow/FlowTradesTable";
import { FlowBubbleChart } from "@/components/flow/FlowBubbleChart";

interface Expiration {
    ts: number;
    label: string;
}

interface FlowData {
    ticker: string;
    price: number;
    change: number;
    expiry: string;
    expirations: Expiration[];
    summary: {
        volume: number;
        volume_avg_ratio: number;
        call_pct: number;
        put_pct: number;
        pc_ratio: number;
        sentiment: "bullish" | "bearish" | "neutral";
        total_call_vol: number;
        total_put_vol: number;
        total_call_oi: number;
        total_put_oi: number;
    };
    notable_trades: Array<{
        strike: number;
        expiry: string;
        type: "call" | "put";
        premium: number;
        trade_type: string;
        volume: number;
        openInterest: number;
        iv: number;
        lastPrice: number;
    }>;
    key_levels: {
        max_pain: number;
        highest_oi_call: number;
        highest_oi_put: number;
    };
}

const QUICK_TICKERS = ["SPY", "QQQ", "TSLA", "NVDA", "AAPL", "AMD", "META", "AMZN"];

export function FlowAgent() {
    const [ticker, setTicker] = useState("");
    const [loading, setLoading] = useState(false);
    const [flowData, setFlowData] = useState<FlowData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedExpiry, setSelectedExpiry] = useState<number | null>(null);

    const runFlow = async (t?: string, expiration?: number | null) => {
        const symbol = (t || ticker).trim().toUpperCase();
        if (!symbol) return;
        setTicker(symbol);
        setLoading(true);
        setError(null);
        if (!expiration) { setFlowData(null); setSelectedExpiry(null); }

        try {
            const body: any = { ticker: symbol };
            if (expiration) body.expiration = expiration;

            const res = await fetch("/api/agents/flow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || "Options fetch failed");
            }

            const json = await res.json();
            setFlowData(json.data);
        } catch (err: any) {
            setError(err.message || "Failed to fetch options data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Input */}
            <div className="space-y-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Enter ticker (e.g. TSLA)"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && runFlow()}
                        className="flex-1 px-4 py-2.5 bg-pm-black/50 border border-pm-border/50 rounded-lg text-sm text-pm-text font-mono placeholder:text-pm-subtle focus:outline-none focus:border-pm-green/50"
                    />
                    <button
                        onClick={() => runFlow()}
                        disabled={loading || !ticker.trim()}
                        className="px-5 py-2.5 bg-pm-green text-pm-black text-sm font-semibold rounded-lg hover:bg-pm-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Scan
                    </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {QUICK_TICKERS.map((t) => (
                        <button
                            key={t}
                            onClick={() => runFlow(t)}
                            disabled={loading}
                            className="px-3 py-1.5 text-[11px] font-mono rounded-md transition-all border border-pm-border/30 text-pm-muted hover:text-pm-text hover:border-pm-border disabled:opacity-50"
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12 gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-pm-green" />
                    <span className="text-sm text-pm-muted font-mono">Fetching options chain...</span>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-pm-red/5 border border-pm-red/20 rounded-lg px-4 py-3">
                    <p className="text-sm text-pm-red font-mono">{error}</p>
                </div>
            )}

            {/* Results */}
            {!loading && flowData && (
                <>
                    {/* Ticker Header */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-2xl font-bold font-mono text-pm-text">{flowData.ticker}</span>
                        <span className="text-lg font-mono text-pm-muted">${flowData.price?.toFixed(2)}</span>
                        <span className={`text-sm font-mono font-semibold ${flowData.change >= 0 ? "text-pm-green" : "text-pm-red"}`}>
                            {flowData.change >= 0 ? "+" : ""}{flowData.change?.toFixed(2)}%
                        </span>
                    </div>

                    {/* Expiry Selector */}
                    {flowData.expirations?.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-pm-text uppercase tracking-wider font-semibold">Expiry</span>
                            <div className="relative">
                                <select
                                    value={selectedExpiry ?? ""}
                                    onChange={(e) => {
                                        const ts = Number(e.target.value);
                                        setSelectedExpiry(ts);
                                        runFlow(flowData.ticker, ts);
                                    }}
                                    disabled={loading}
                                    className="pl-3 pr-8 py-2 bg-pm-black/80 border border-pm-border rounded-lg text-sm text-pm-text font-mono focus:outline-none focus:border-pm-green/50 cursor-pointer appearance-none"
                                >
                                    {flowData.expirations.map((exp) => (
                                        <option key={exp.ts} value={exp.ts}>
                                            {exp.label}
                                        </option>
                                    ))}
                                </select>
                                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pm-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" /></svg>
                            </div>
                            <span className="text-xs text-pm-muted font-mono">
                                {flowData.expirations.length} dates available
                            </span>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <FlowSummaryCards summary={flowData.summary} />

                    {/* Key Levels */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-pm-black/30 border border-pm-border/30 rounded-lg px-4 py-3 text-center">
                            <div className="text-[10px] text-pm-muted font-mono uppercase tracking-wider mb-1">Max Pain</div>
                            <div className="text-lg font-bold font-mono text-pm-purple">${flowData.key_levels.max_pain}</div>
                        </div>
                        <div className="bg-pm-black/30 border border-pm-border/30 rounded-lg px-4 py-3 text-center">
                            <div className="text-[10px] text-pm-muted font-mono uppercase tracking-wider mb-1">Top Call OI</div>
                            <div className="text-lg font-bold font-mono text-pm-green">${flowData.key_levels.highest_oi_call}</div>
                        </div>
                        <div className="bg-pm-black/30 border border-pm-border/30 rounded-lg px-4 py-3 text-center">
                            <div className="text-[10px] text-pm-muted font-mono uppercase tracking-wider mb-1">Top Put OI</div>
                            <div className="text-lg font-bold font-mono text-pm-red">${flowData.key_levels.highest_oi_put}</div>
                        </div>
                    </div>

                    {/* Bubble Chart */}
                    {flowData.notable_trades?.length > 0 && (
                        <div className="bg-pm-black/30 border border-pm-border/30 rounded-lg overflow-hidden">
                            <div className="px-4 py-3 border-b border-pm-border/30">
                                <h3 className="text-sm font-semibold text-pm-text">Premium Distribution</h3>
                                <p className="text-[10px] text-pm-muted font-mono mt-0.5">
                                    <span className="text-pm-green">Green</span> = Calls · <span className="text-pm-red">Red</span> = Puts · Size = Premium · <span className="text-pm-purple">Purple</span> = Max Pain
                                </p>
                            </div>
                            <div className="p-2">
                                <FlowBubbleChart trades={flowData.notable_trades} keyLevels={flowData.key_levels} />
                            </div>
                        </div>
                    )}

                    {/* Trades Table */}
                    {flowData.notable_trades?.length > 0 && (
                        <div className="bg-pm-black/30 border border-pm-border/30 rounded-lg overflow-hidden">
                            <div className="px-4 py-3 border-b border-pm-border/30 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-pm-green" />
                                <h3 className="text-sm font-semibold text-pm-text">Most Active Contracts</h3>
                                <span className="text-[10px] text-pm-muted font-mono ml-auto">
                                    {flowData.notable_trades.length} contracts · sorted by volume
                                </span>
                            </div>
                            <FlowTradesTable trades={flowData.notable_trades} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
