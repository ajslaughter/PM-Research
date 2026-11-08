"use client";

import { useMemo } from "react";
import { useAdmin } from "@/context/AdminContext";
import { usePrices } from "@/hooks/usePrices";
import { calculateWeightedDayChange, calculateWeightedYTD } from "@/services/stockService";

export interface BoardRow {
    id: string;
    name: string;
    description: string;
    holdings: number;
    ytd: number | null;
    day: number | null;
}

/**
 * Live YTD and day change for every watchlist, from a single price request.
 * Uses the same weighted math as the watchlist table, so the numbers match.
 */
export function useWatchlistBoard() {
    const { watchlists } = useAdmin();

    const tickers = useMemo(
        () => Array.from(new Set(watchlists.flatMap((w) => w.positions.map((p) => p.ticker)))).sort(),
        [watchlists]
    );

    const { prices, marketOpen, isLoading, lastFetch, error } = usePrices(tickers, {
        includeMarketCaps: false,
        pollIntervalOpen: 60_000,
    });

    const rows: BoardRow[] = useMemo(
        () =>
            watchlists.map((w) => {
                const priced = w.positions.some((p) => (prices[p.ticker]?.price ?? 0) > 0);
                return {
                    id: w.id,
                    name: w.name,
                    description: w.description,
                    holdings: w.positions.length,
                    ytd: priced ? calculateWeightedYTD(w.positions, prices, {}) : null,
                    day: priced ? calculateWeightedDayChange(w.positions, prices) : null,
                };
            }),
        [watchlists, prices]
    );

    return { rows, marketOpen, isLoading, lastFetch, error };
}
