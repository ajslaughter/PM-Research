"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, BarChart3, ChevronLeft, ChevronRight, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

interface MacroQuote {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

interface CalendarEvent {
    date: string;
    title: string;
    impact: string;
    previous?: number | null;
    forecast?: number | null;
    actual?: number | null;
    unit?: string;
}

interface MacroData {
    data: Record<string, MacroQuote[]>;
    yieldCurve: Array<{ maturity: string; value: number }>;
    riskLevel: string;
    calendar: CalendarEvent[];
    timestamp: string;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
    indices: { label: "Indices", icon: "📊" },
    yields: { label: "Yields", icon: "📈" },
    risk: { label: "Volatility", icon: "⚡" },
    commodities: { label: "Commodities", icon: "🛢️" },
    currency: { label: "Currency", icon: "💵" },
    crypto: { label: "Crypto", icon: "₿" },
};

const RISK_COLORS: Record<string, string> = {
    low: "text-pm-green",
    moderate: "text-yellow-400",
    elevated: "text-orange-400",
    extreme: "text-pm-red",
};

export function MacroAgent() {
    const [loading, setLoading] = useState(true);
    const [macroData, setMacroData] = useState<MacroData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [calendarMonth, setCalendarMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        fetchMacro();
    }, []);

    const fetchMacro = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/agents/macro");
            if (!res.ok) throw new Error("Failed to fetch macro data");
            const json: MacroData = await res.json();
            setMacroData(json);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Calendar helpers
    const calendarDays = useMemo(() => {
        const { year, month } = calendarMonth;
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: Array<{ day: number; dateStr: string } | null> = [];

        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
            days.push({ day: d, dateStr });
        }
        return days;
    }, [calendarMonth]);

    const eventsByDate = useMemo(() => {
        if (!macroData?.calendar) return {};
        const map: Record<string, CalendarEvent[]> = {};
        for (const e of macroData.calendar) {
            if (!map[e.date]) map[e.date] = [];
            map[e.date].push(e);
        }
        return map;
    }, [macroData?.calendar]);

    const todayStr = new Date().toISOString().split("T")[0];
    const monthLabel = new Date(calendarMonth.year, calendarMonth.month).toLocaleString("en-US", { month: "long", year: "numeric" });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-pm-green" />
                <span className="text-sm text-pm-muted font-mono">Loading macro dashboard...</span>
            </div>
        );
    }

    if (error || !macroData) {
        return (
            <div className="bg-pm-red/5 border border-pm-red/20 rounded-lg px-4 py-3">
                <p className="text-sm text-pm-red font-mono">{error || "No data"}</p>
                <button onClick={fetchMacro} className="text-xs text-pm-muted underline mt-2">Retry</button>
            </div>
        );
    }

    const vix = macroData.data.risk?.find((r) => r.symbol === "^VIX");

    return (
        <div className="space-y-6">
            {/* Market Overview Grid */}
            {["indices", "commodities", "currency", "crypto"].map((cat) => {
                const items = macroData.data[cat];
                if (!items?.length) return null;
                const meta = CATEGORY_LABELS[cat];
                return (
                    <div key={cat}>
                        <div className="text-[10px] font-mono text-pm-muted uppercase tracking-wider mb-2">
                            {meta.icon} {meta.label}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {items.map((q) => (
                                <div key={q.symbol} className="bg-pm-black/30 border border-pm-border/20 rounded-lg px-3 py-2.5">
                                    <div className="text-[10px] text-pm-muted font-mono truncate">{q.name}</div>
                                    <div className="flex items-baseline gap-2 mt-0.5">
                                        <span className="text-sm font-mono font-semibold text-pm-text">
                                            {cat === "crypto" ? `$${q.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}` :
                                             cat === "yields" ? `${q.price.toFixed(2)}%` :
                                             q.price >= 1000 ? q.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) :
                                             q.price.toFixed(2)}
                                        </span>
                                        <span className={`text-[11px] font-mono font-semibold ${q.changePercent >= 0 ? "text-pm-green" : "text-pm-red"}`}>
                                            {q.changePercent >= 0 ? "+" : ""}{q.changePercent.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Yield Curve + VIX Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Yield Curve */}
                <div className="bg-pm-black/30 border border-pm-border/30 rounded-lg overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-pm-border/20">
                        <span className="text-[10px] font-mono text-pm-muted uppercase tracking-wider">Treasury Yield Curve</span>
                    </div>
                    <div className="p-2" style={{ height: 180 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={macroData.yieldCurve} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
                                <XAxis
                                    dataKey="maturity"
                                    tick={{ fill: "#6b7280", fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={{ stroke: "#374151" }}
                                />
                                <YAxis
                                    tick={{ fill: "#6b7280", fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                                    width={45}
                                    domain={["auto", "auto"]}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null;
                                        return (
                                            <div className="bg-pm-charcoal border border-pm-border rounded px-2 py-1">
                                                <span className="text-xs font-mono text-pm-text">
                                                    {payload[0].payload.maturity}: {(payload[0].value as number).toFixed(3)}%
                                                </span>
                                            </div>
                                        );
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#9d4edd"
                                    strokeWidth={2.5}
                                    dot={{ fill: "#9d4edd", r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* VIX / Risk Gauge */}
                <div className="bg-pm-black/30 border border-pm-border/30 rounded-lg overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-pm-border/20">
                        <span className="text-[10px] font-mono text-pm-muted uppercase tracking-wider">Risk Gauge</span>
                    </div>
                    <div className="p-4 flex flex-col items-center justify-center" style={{ height: 180 }}>
                        {vix && (
                            <>
                                <div className="text-[10px] text-pm-muted font-mono uppercase mb-1">VIX</div>
                                <div className={`text-4xl font-bold font-mono ${RISK_COLORS[macroData.riskLevel] || "text-pm-muted"}`}>
                                    {vix.price.toFixed(2)}
                                </div>
                                <div className={`text-xs font-mono font-semibold mt-1 ${vix.changePercent >= 0 ? "text-pm-red" : "text-pm-green"}`}>
                                    {vix.changePercent >= 0 ? "+" : ""}{vix.changePercent.toFixed(2)}%
                                </div>
                                <div className={`text-xs font-mono font-semibold uppercase mt-3 px-3 py-1 rounded-full ${
                                    macroData.riskLevel === "low" ? "bg-pm-green/10 text-pm-green" :
                                    macroData.riskLevel === "moderate" ? "bg-yellow-400/10 text-yellow-400" :
                                    macroData.riskLevel === "elevated" ? "bg-orange-400/10 text-orange-400" :
                                    "bg-pm-red/10 text-pm-red"
                                }`}>
                                    {macroData.riskLevel}
                                </div>
                                {/* VIX Scale Bar */}
                                <div className="w-full mt-3 relative">
                                    <div className="h-1.5 rounded-full bg-gradient-to-r from-pm-green via-yellow-400 via-orange-400 to-pm-red" />
                                    <div
                                        className="absolute top-0 w-0.5 h-3 bg-white rounded -translate-x-1/2 -translate-y-[3px]"
                                        style={{ left: `${Math.min(Math.max((vix.price / 50) * 100, 2), 98)}%` }}
                                    />
                                    <div className="flex justify-between mt-1">
                                        <span className="text-[8px] text-pm-subtle font-mono">10</span>
                                        <span className="text-[8px] text-pm-subtle font-mono">20</span>
                                        <span className="text-[8px] text-pm-subtle font-mono">30</span>
                                        <span className="text-[8px] text-pm-subtle font-mono">40</span>
                                        <span className="text-[8px] text-pm-subtle font-mono">50</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Economic Calendar */}
            <div className="bg-pm-black/30 border border-pm-border/30 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-pm-border/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-pm-green" />
                        <span className="text-sm font-semibold text-pm-text">Economic Calendar</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCalendarMonth((p) => {
                                const m = p.month - 1;
                                return m < 0 ? { year: p.year - 1, month: 11 } : { ...p, month: m };
                            })}
                            className="text-pm-muted hover:text-pm-text transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-mono text-pm-text min-w-[130px] text-center">{monthLabel}</span>
                        <button
                            onClick={() => setCalendarMonth((p) => {
                                const m = p.month + 1;
                                return m > 11 ? { year: p.year + 1, month: 0 } : { ...p, month: m };
                            })}
                            className="text-pm-muted hover:text-pm-text transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="p-3">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                            <div key={d} className="text-[10px] font-mono text-pm-subtle text-center py-1">{d}</div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((cell, i) => {
                            if (!cell) return <div key={`empty-${i}`} />;
                            const events = eventsByDate[cell.dateStr] || [];
                            const isToday = cell.dateStr === todayStr;
                            const isSelected = cell.dateStr === selectedDate;
                            const hasHigh = events.some((e) => e.impact === "high");
                            const hasMedium = events.some((e) => e.impact === "medium");

                            return (
                                <button
                                    key={cell.dateStr}
                                    onClick={() => setSelectedDate(isSelected ? null : cell.dateStr)}
                                    className={`relative rounded-md p-1.5 text-center transition-all min-h-[40px] ${
                                        isSelected ? "bg-pm-green/20 border border-pm-green/40" :
                                        isToday ? "bg-pm-border/20 border border-pm-border/50" :
                                        events.length ? "hover:bg-pm-border/10 border border-transparent" :
                                        "border border-transparent"
                                    }`}
                                >
                                    <span className={`text-xs font-mono ${isToday ? "text-pm-green font-bold" : "text-pm-muted"}`}>
                                        {cell.day}
                                    </span>
                                    {events.length > 0 && (
                                        <div className="flex justify-center gap-0.5 mt-0.5">
                                            {hasHigh && <div className="w-1.5 h-1.5 rounded-full bg-pm-red" />}
                                            {hasMedium && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                                            {!hasHigh && !hasMedium && <div className="w-1.5 h-1.5 rounded-full bg-pm-muted" />}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-pm-border/20">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-pm-red" />
                            <span className="text-[10px] text-pm-muted font-mono">High Impact</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                            <span className="text-[10px] text-pm-muted font-mono">Medium</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-pm-muted" />
                            <span className="text-[10px] text-pm-muted font-mono">Low</span>
                        </div>
                    </div>

                    {/* Selected date events */}
                    {selectedDate && eventsByDate[selectedDate] && (
                        <div className="mt-3 pt-3 border-t border-pm-border/20 space-y-3">
                            <div className="text-xs font-mono text-pm-muted">
                                {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                            </div>
                            {eventsByDate[selectedDate].map((evt, i) => {
                                const hasData = evt.previous != null || evt.forecast != null || evt.actual != null;
                                const beat = evt.actual != null && evt.forecast != null && evt.actual > evt.forecast;
                                const miss = evt.actual != null && evt.forecast != null && evt.actual < evt.forecast;
                                const inline = beat ? "BEAT" : miss ? "MISS" : evt.actual != null ? "IN LINE" : null;
                                const u = evt.unit || "";
                                const isPast = selectedDate < todayStr;

                                return (
                                    <div key={i} className="bg-pm-border/5 rounded-lg overflow-hidden">
                                        <div className="flex items-center gap-3 px-4 py-2.5">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                                evt.impact === "high" ? "bg-pm-red" :
                                                evt.impact === "medium" ? "bg-yellow-400" : "bg-pm-muted"
                                            }`} />
                                            <span className="text-sm font-semibold text-pm-text">{evt.title}</span>
                                            {inline && (
                                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ml-auto ${
                                                    beat ? "bg-pm-green/10 text-pm-green" :
                                                    miss ? "bg-pm-red/10 text-pm-red" :
                                                    "bg-pm-border/20 text-pm-muted"
                                                }`}>
                                                    {inline}
                                                </span>
                                            )}
                                            {!inline && (
                                                <span className={`text-[10px] font-mono uppercase ml-auto ${
                                                    isPast && evt.actual == null ? "text-pm-subtle" :
                                                    evt.impact === "high" ? "text-pm-red" :
                                                    evt.impact === "medium" ? "text-yellow-400" : "text-pm-subtle"
                                                }`}>
                                                    {isPast && evt.actual == null ? "pending" : evt.impact}
                                                </span>
                                            )}
                                        </div>

                                        {hasData && (
                                            <div className="px-4 pb-4 pt-1 grid grid-cols-3 gap-4">
                                                <div className="bg-pm-black/40 rounded-lg px-3 py-2.5 text-center">
                                                    <div className="text-[11px] font-mono text-pm-muted uppercase tracking-wider mb-1">Previous</div>
                                                    <div className="text-lg font-mono font-semibold text-pm-text">
                                                        {evt.previous != null ? `${evt.previous}${u}` : "—"}
                                                    </div>
                                                </div>
                                                <div className="bg-pm-black/40 rounded-lg px-3 py-2.5 text-center">
                                                    <div className="text-[11px] font-mono text-pm-muted uppercase tracking-wider mb-1">Forecast</div>
                                                    <div className="text-lg font-mono font-semibold text-pm-text">
                                                        {evt.forecast != null ? `${evt.forecast}${u}` : "—"}
                                                    </div>
                                                </div>
                                                <div className="bg-pm-black/40 rounded-lg px-3 py-2.5 text-center">
                                                    <div className="text-[11px] font-mono text-pm-muted uppercase tracking-wider mb-1">Actual</div>
                                                    <div className={`text-lg font-mono font-bold ${
                                                        evt.actual == null ? "text-pm-subtle" :
                                                        beat ? "text-pm-green" :
                                                        miss ? "text-pm-red" : "text-pm-text"
                                                    }`}>
                                                        {evt.actual != null ? `${evt.actual}${u}` : "—"}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
