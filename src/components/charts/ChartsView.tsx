"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { SymbolSearch } from "./SymbolSearch";
import { loadLastSymbol, saveLastSymbol } from "@/lib/charts/storage";
import { normalizeSymbol } from "@/lib/charts/symbols";

/**
 * The /charts page body: header, symbol search, quick picks, and the chart.
 *
 * The chart is loaded client-only (next/dynamic, ssr: false) because
 * lightweight-charts draws to <canvas> and needs `window`. That also keeps
 * the ~200 KB of chart code out of every other page's bundle.
 *
 * The symbol lives in state, not the route: picking a new ticker swaps the
 * data in the same chart instance (no remount, no flash) and rewrites the
 * URL to /charts/<SYMBOL> with history.replaceState so it's shareable.
 */

const ChartWithTools = dynamic(() => import("./ChartWithTools"), {
    ssr: false,
    loading: () => (
        <div className="bg-pm-charcoal border border-pm-border rounded-lg h-[62vh] min-h-[360px] grid place-items-center text-sm text-pm-muted">
            Loading chart…
        </div>
    ),
});

/** One-tap symbols under the search box. */
const QUICK_PICKS = ["SPY", "QQQ", "NVDA", "TSLA", "PLTR", "BTC-USD", "ETH-USD"];
const FALLBACK_SYMBOL = "NVDA";

export function ChartsView({ initialSymbol }: { initialSymbol?: string }) {
    const [symbol, setSymbol] = useState(initialSymbol ?? FALLBACK_SYMBOL);

    // Plain /charts (no symbol in the URL) reopens whatever was charted last.
    // Done in an effect, after hydration, because localStorage doesn't exist on the server.
    useEffect(() => {
        if (initialSymbol) return;
        const last = normalizeSymbol(loadLastSymbol());
        if (last) setSymbol(last);
    }, [initialSymbol]);

    // Remember the symbol and keep the URL shareable.
    useEffect(() => {
        saveLastSymbol(symbol);
        const path = `/charts/${encodeURIComponent(symbol)}`;
        if (window.location.pathname !== path) window.history.replaceState(null, "", path);
        document.title = `${symbol} chart | PM Research`;
    }, [symbol]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-24 md:pb-10">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
                <div>
                    <h1 className="page-title">Charts</h1>
                    <p className="page-lede">
                        Candlesticks, drawing tools and indicators for every watchlist name, the major ETFs and crypto. Free, no
                        limits. Drawings stay in this browser.
                    </p>
                </div>
                <div className="w-full lg:w-96 shrink-0">
                    <SymbolSearch onSelect={setSymbol} />
                    <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Quick picks">
                        {QUICK_PICKS.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setSymbol(s)}
                                aria-pressed={s === symbol}
                                className={`type-condensed text-xs font-semibold px-2 py-1 rounded border transition-colors ${
                                    s === symbol
                                        ? "border-pm-gold/60 text-pm-gold bg-pm-gold/10"
                                        : "border-pm-border text-pm-muted hover:text-pm-text hover:border-pm-subtle"
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <ChartWithTools symbol={symbol} />
        </div>
    );
}
