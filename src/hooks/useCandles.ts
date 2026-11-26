"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isMarketOpen } from "@/lib/marketHours";
import { isCryptoSymbol } from "@/lib/charts/symbols";
import type { CandlesResponse, ChartRange } from "@/lib/charts/types";

/**
 * Fetch OHLCV candles from /api/candles for one symbol + timeframe.
 *
 * - A change of symbol or range aborts the request in flight, so a fast
 *   click through NVDA → TSLA → SPY can never paint NVDA last.
 * - While the market is open (always, for crypto) it refetches every 60s so
 *   the last bar stays live. The chart applies those refreshes with
 *   series.update(), so drawings and the user's zoom are left alone.
 * - The previous data stays in place while a new request loads, and
 *   `data.symbol` / `data.range` say what it actually is, so the chart can
 *   tell "new symbol arrived" from "same chart, fresher bars".
 *
 * Pass `null` as the symbol to disable (used by the optional compare overlay).
 */
export function useCandles(symbol: string | null, range: ChartRange) {
    const [data, setData] = useState<CandlesResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const load = useCallback(
        async (opts: { background?: boolean } = {}) => {
            if (!symbol) {
                setData(null);
                setError(null);
                setLoading(false);
                return;
            }

            abortRef.current?.abort();
            const ctrl = new AbortController();
            abortRef.current = ctrl;

            // A background refresh doesn't flash the loading state.
            if (!opts.background) {
                setLoading(true);
                setError(null);
            }

            try {
                const res = await fetch(
                    `/api/candles?symbol=${encodeURIComponent(symbol)}&range=${range}`,
                    { signal: ctrl.signal }
                );
                const body = await res.json();
                if (ctrl.signal.aborted) return;
                if (!res.ok) {
                    // Keep showing the old chart on a failed background refresh.
                    if (!opts.background) {
                        setError(body?.error || "Couldn't load chart data");
                        setData(null);
                    }
                    return;
                }
                setData(body as CandlesResponse);
                setError(null);
            } catch (e) {
                if ((e as Error).name === "AbortError") return;
                if (!opts.background) {
                    setError("Couldn't reach market data. Check your connection and try again.");
                    setData(null);
                }
            } finally {
                if (!ctrl.signal.aborted && !opts.background) setLoading(false);
            }
        },
        [symbol, range]
    );

    // Initial load + reload whenever symbol or range changes.
    useEffect(() => {
        load();
        return () => abortRef.current?.abort();
    }, [load]);

    // Live refresh: every 60s while NYSE is open, or always for crypto.
    // Checked on each tick, so a chart left open across the 9:30 bell starts updating.
    useEffect(() => {
        if (!symbol) return;
        const id = window.setInterval(() => {
            if (document.visibilityState !== "visible") return; // don't poll from a background tab
            if (isCryptoSymbol(symbol) || isMarketOpen()) load({ background: true });
        }, 60_000);
        return () => window.clearInterval(id);
    }, [symbol, load]);

    return { data, loading, error, reload: () => load() };
}
