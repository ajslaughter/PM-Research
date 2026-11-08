"use client";

import { useEffect } from "react";
import WatchlistTable from "@/components/WatchlistTable";
import { WatchlistErrorBoundary } from "@/components/ErrorBoundary";
import { useAdmin } from "@/context/AdminContext";
import { useWatchlistBoard } from "@/hooks/useWatchlistBoard";
import { TRACKING_YEAR } from "@/data/baselines";
import { countWord, directionClass, formatPct } from "@/lib/format";

export default function WatchlistPage() {
    const { watchlists, activeWatchlistId, setActiveWatchlistId } = useAdmin();
    const { rows, isLoading: boardLoading, lastFetch } = useWatchlistBoard();

    const selectedWatchlist = watchlists.find((p) => p.id === activeWatchlistId) || watchlists[0];

    // Deep link from the home board: /watchlist?list=<id>
    useEffect(() => {
        const requested = new URLSearchParams(window.location.search).get("list");
        if (requested && watchlists.some((w) => w.id === requested)) {
            setActiveWatchlistId(requested);
        }
    }, [watchlists, setActiveWatchlistId]);

    useEffect(() => {
        if (!selectedWatchlist && watchlists.length > 0) {
            setActiveWatchlistId(watchlists[0].id);
        }
    }, [watchlists, selectedWatchlist, setActiveWatchlistId]);

    const choose = (id: string) => {
        setActiveWatchlistId(id);
        window.history.replaceState(null, "", `/watchlist?list=${id}`);
    };

    if (!selectedWatchlist) {
        return <p className="max-w-6xl mx-auto px-5 sm:px-6 py-16 text-pm-muted">Loading watchlists…</p>;
    }

    const boardById = Object.fromEntries(rows.map((r) => [r.id, r]));
    const boardReady = !boardLoading || !!lastFetch;

    return (
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 sm:py-14">
            <header className="mb-10">
                <h1 className="page-title">Watchlists</h1>
                <p className="page-lede">
                    {countWord(watchlists.length, true)} themed lists, each held at fixed weights from the Dec 31 close. Pick one to see its holdings,
                    live prices and {TRACKING_YEAR} returns.
                </p>
            </header>

            {/* Watchlist picker */}
            <div
                role="group"
                aria-label="Choose a watchlist"
                className="-mx-5 px-5 sm:mx-0 sm:px-0 flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2 overflow-x-auto pb-1 sm:overflow-visible snap-x"
            >
                {watchlists.map((watchlist) => {
                    const active = watchlist.id === selectedWatchlist.id;
                    const ytd = boardById[watchlist.id]?.ytd ?? null;
                    return (
                        <button
                            key={watchlist.id}
                            aria-pressed={active}
                            onClick={() => choose(watchlist.id)}
                            className={`snap-start shrink-0 min-w-[11rem] sm:min-w-0 text-left rounded-md border px-4 py-3 transition-colors ${
                                active
                                    ? "border-pm-gold bg-pm-dark"
                                    : "border-pm-border bg-pm-charcoal hover:border-pm-subtle"
                            }`}
                        >
                            <span className="flex items-baseline justify-between gap-3">
                                <span className="type-condensed font-semibold text-[15px] text-pm-text truncate">
                                    {watchlist.name}
                                </span>
                                <span className={`type-data text-sm ${boardReady ? directionClass(ytd) : "text-pm-subtle"}`}>
                                    {boardReady ? formatPct(ytd, 1) : "…"}
                                </span>
                            </span>
                            <span className="mt-0.5 block text-xs text-pm-subtle truncate">{watchlist.description}</span>
                        </button>
                    );
                })}
            </div>

            <section className="mt-12" aria-labelledby="selected-watchlist">
                <h2 id="selected-watchlist" className="type-display font-bold text-3xl sm:text-4xl text-pm-text">
                    {selectedWatchlist.name}
                </h2>
                <p className="mt-1 text-pm-muted">{selectedWatchlist.description}</p>

                <div className="mt-6">
                    <WatchlistErrorBoundary>
                        <WatchlistTable
                            key={selectedWatchlist.id}
                            watchlistId={selectedWatchlist.id}
                            watchlistName={selectedWatchlist.name}
                        />
                    </WatchlistErrorBoundary>
                </div>
            </section>
        </div>
    );
}
