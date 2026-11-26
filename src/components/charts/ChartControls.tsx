"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, SlidersHorizontal, X } from "lucide-react";
import { SymbolSearch } from "./SymbolSearch";
import { INDICATOR_COLORS } from "@/lib/charts/indicators";
import { CHART_RANGES, type ChartRange, type IndicatorSettings } from "@/lib/charts/types";

/**
 * The control bar above the chart: timeframe, indicators, compare.
 * It sits outside the plot so nothing covers the candles.
 */

/** Indicator menu rows. The swatch is the line's color on the chart. */
const INDICATOR_ROWS: Array<{ key: keyof IndicatorSettings; label: string; color?: string }> = [
    { key: "sma20", label: "SMA 20", color: INDICATOR_COLORS.sma20 },
    { key: "sma50", label: "SMA 50", color: INDICATOR_COLORS.sma50 },
    { key: "sma200", label: "SMA 200", color: INDICATOR_COLORS.sma200 },
    { key: "ema21", label: "EMA 21", color: INDICATOR_COLORS.ema21 },
    { key: "volume", label: "Volume" },
    { key: "rsi", label: "RSI 14 (lower pane)", color: INDICATOR_COLORS.rsi },
];

/** Close a popover on outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!open) return;
        const onDown = (e: PointerEvent) => {
            if (!ref.current?.contains(e.target as Node)) close();
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
        document.addEventListener("pointerdown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open, close]);
    return ref;
}

export function ChartControls({
    range,
    onRange,
    indicators,
    onIndicators,
    compare,
    onCompare,
    symbol,
}: {
    range: ChartRange;
    onRange: (r: ChartRange) => void;
    indicators: IndicatorSettings;
    onIndicators: (next: IndicatorSettings) => void;
    compare: string | null;
    onCompare: (symbol: string | null) => void;
    /** Main symbol: comparing a symbol with itself is refused. */
    symbol: string;
}) {
    const [indOpen, setIndOpen] = useState(false);
    const [cmpOpen, setCmpOpen] = useState(false);
    const indRef = useDismiss(indOpen, () => setIndOpen(false));
    const cmpRef = useDismiss(cmpOpen, () => setCmpOpen(false));

    const activeCount = Object.values(indicators).filter(Boolean).length;

    return (
        <div className="flex flex-wrap items-center gap-2 px-2 sm:px-3 py-2 border-b border-pm-border">
            {/* Timeframes: a segmented control, gold = selected */}
            <div role="radiogroup" aria-label="Timeframe" className="flex items-center overflow-x-auto [scrollbar-width:none] -mx-1 px-1">
                {CHART_RANGES.map((r) => {
                    const selected = r.value === range;
                    return (
                        <button
                            key={r.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => onRange(r.value)}
                            className={`type-data shrink-0 px-2.5 py-1.5 text-xs font-semibold rounded transition-colors
                                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pm-gold
                                ${selected ? "bg-pm-gold/15 text-pm-gold" : "text-pm-muted hover:text-pm-text"}`}
                        >
                            {r.label}
                        </button>
                    );
                })}
            </div>

            <span className="hidden sm:block w-px h-5 bg-pm-border" aria-hidden />

            {/* Indicators popover */}
            <div ref={indRef} className="relative">
                <button
                    type="button"
                    aria-expanded={indOpen}
                    aria-haspopup="true"
                    onClick={() => setIndOpen((o) => !o)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded text-pm-muted hover:text-pm-text hover:bg-pm-dark"
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden />
                    Indicators
                    {activeCount > 0 && <span className="type-data text-pm-gold">{activeCount}</span>}
                    <ChevronDown className="w-3 h-3" aria-hidden />
                </button>
                {indOpen && (
                    <div className="absolute z-30 mt-1 w-56 bg-pm-charcoal border border-pm-border rounded-md shadow-xl py-1">
                        {INDICATOR_ROWS.map((row) => (
                            <label
                                key={row.key}
                                className="flex items-center gap-2.5 px-3 py-2 text-sm text-pm-text cursor-pointer hover:bg-pm-dark"
                            >
                                <input
                                    type="checkbox"
                                    checked={indicators[row.key]}
                                    onChange={(e) => onIndicators({ ...indicators, [row.key]: e.target.checked })}
                                    className="accent-pm-gold w-3.5 h-3.5"
                                />
                                <span className="flex-1">{row.label}</span>
                                {row.color && (
                                    <span className="w-4 h-0.5 rounded" style={{ backgroundColor: row.color }} aria-hidden />
                                )}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Compare: a chip when active, otherwise a button that opens a search */}
            <div ref={cmpRef} className="relative">
                {compare ? (
                    <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 text-xs rounded border border-pm-border text-pm-text">
                        <span className="w-3 h-0.5 rounded" style={{ backgroundColor: INDICATOR_COLORS.compare }} aria-hidden />
                        <span className="text-pm-muted">vs</span>
                        <span className="type-condensed font-semibold">{compare}</span>
                        <button
                            type="button"
                            onClick={() => onCompare(null)}
                            className="p-0.5 rounded text-pm-subtle hover:text-pm-text"
                            aria-label={`Stop comparing with ${compare}`}
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </span>
                ) : (
                    <button
                        type="button"
                        aria-expanded={cmpOpen}
                        onClick={() => setCmpOpen((o) => !o)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded text-pm-muted hover:text-pm-text hover:bg-pm-dark"
                    >
                        <Plus className="w-3.5 h-3.5" aria-hidden />
                        Compare
                    </button>
                )}
                {cmpOpen && !compare && (
                    <div className="absolute z-30 mt-1 w-72 max-w-[calc(100vw-2rem)] bg-pm-charcoal border border-pm-border rounded-md shadow-xl p-2">
                        <SymbolSearch
                            compact
                            autoFocus
                            placeholder="Overlay a second symbol"
                            onCancel={() => setCmpOpen(false)}
                            onSelect={(s) => {
                                if (s !== symbol) onCompare(s);
                                setCmpOpen(false);
                            }}
                        />
                        <p className="mt-2 px-1 text-[11px] text-pm-subtle leading-snug">
                            Drawn as a line on the left price axis, in its own prices.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
