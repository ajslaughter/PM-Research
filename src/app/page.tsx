"use client";

import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { useWatchlistBoard, type BoardRow } from "@/hooks/useWatchlistBoard";
import { TRACKING_YEAR, BASELINE_DATE } from "@/data/baselines";
import { countWord, directionClass, formatNoteDate, formatPct } from "@/lib/format";

function YtdBar({ value, scale }: { value: number | null; scale: number }) {
    // Diverging bar: zero in the middle, gains to the right, losses to the left.
    const share = value === null ? 0 : Math.min(Math.abs(value) / scale, 1) * 50;
    const positive = (value ?? 0) >= 0;
    return (
        <div className="relative h-2 w-full" aria-hidden>
            <div className="absolute inset-y-0 left-1/2 w-px bg-pm-border" />
            <div
                className={`absolute inset-y-0 rounded-sm transition-[width] duration-700 ease-out ${
                    positive ? "left-1/2 bg-pm-up/70" : "right-1/2 bg-pm-down/70"
                }`}
                style={{ width: `${share}%` }}
            />
        </div>
    );
}

function BoardRowLink({ row, scale, loading }: { row: BoardRow; scale: number; loading: boolean }) {
    return (
        <li>
            <Link
                href={`/watchlist?list=${row.id}`}
                className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_5.5rem_8rem_6.5rem] items-center gap-x-4 px-4 sm:px-5 py-3.5 hover:bg-pm-dark transition-colors"
            >
                <span className="min-w-0">
                    <span className="block type-condensed font-semibold text-[17px] text-pm-text truncate">
                        {row.name}
                    </span>
                    <span className="block text-xs text-pm-subtle truncate">{row.description}</span>
                </span>
                <span className={`type-data text-sm text-right ${loading ? "text-pm-subtle" : directionClass(row.day)}`}>
                    {loading ? "…" : formatPct(row.day)}
                </span>
                <span className="hidden md:block">
                    <YtdBar value={loading ? null : row.ytd} scale={scale} />
                </span>
                <span
                    className={`type-display font-bold text-2xl text-right ${loading ? "text-pm-subtle" : directionClass(row.ytd)}`}
                >
                    {loading ? "…" : formatPct(row.ytd, 1)}
                </span>
            </Link>
        </li>
    );
}

export default function LandingPage() {
    const { rows, marketOpen, isLoading, lastFetch, error } = useWatchlistBoard();
    const { researchNotes, watchlists } = useAdmin();

    const loading = isLoading && !lastFetch;
    const scale = Math.max(10, ...rows.map((r) => Math.abs(r.ytd ?? 0)));
    const sortedRows = [...rows].sort((a, b) => (b.ytd ?? -Infinity) - (a.ytd ?? -Infinity));
    const latestNotes = [...researchNotes]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 4);

    const updated = lastFetch
        ? lastFetch.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        : null;

    return (
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
            <section className="grid lg:grid-cols-[5fr_7fr] gap-10 lg:gap-14 pt-12 sm:pt-16 lg:pt-20 pb-16">
                <div className="lg:self-center">
                    <h1 className="type-display font-extrabold text-[44px] sm:text-6xl lg:text-[64px] leading-[0.92] text-pm-text text-balance">
                        Frontier tech research, tracked live
                    </h1>
                    <p className="mt-6 text-lg text-pm-muted leading-relaxed max-w-md">
                        {countWord(watchlists.length, true)} watchlists across AI, chips, robotics, energy, space, quantum, defense
                        and biotech.
                        Every name carries a PM Score, and every return is measured from the Dec 31 close.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href="/watchlist" className="btn-primary">
                            Open watchlists
                        </Link>
                        <Link href="/research" className="btn-secondary">
                            Read the research
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border border-pm-border bg-pm-charcoal overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_5.5rem_8rem_6.5rem] gap-x-4 px-4 sm:px-5 py-3 border-b border-pm-border text-xs text-pm-muted">
                        <span>Watchlist</span>
                        <span className="text-right">Today</span>
                        <span className="hidden md:block" aria-hidden />
                        <span className="text-right">{TRACKING_YEAR} YTD</span>
                    </div>
                    <ul className="divide-y divide-pm-border">
                        {sortedRows.map((row) => (
                            <BoardRowLink key={row.id} row={row} scale={scale} loading={loading} />
                        ))}
                    </ul>
                    <p className="px-4 sm:px-5 py-3 border-t border-pm-border text-xs text-pm-subtle">
                        {error && !lastFetch
                            ? "Live prices are unavailable right now. Try again in a minute."
                            : `${marketOpen ? "Market open" : "Market closed"}${updated ? `, prices updated ${updated}` : ""}. YTD is measured from the ${formatNoteDate(BASELINE_DATE)} close.`}
                    </p>
                </div>
            </section>

            <section className="pb-16" aria-labelledby="latest-research">
                <div className="flex items-baseline justify-between gap-4 border-b border-pm-border pb-3">
                    <h2 id="latest-research" className="section-title">
                        Latest research
                    </h2>
                    <Link href="/research" className="text-sm text-pm-muted hover:text-pm-text transition-colors">
                        All research
                    </Link>
                </div>
                <ul className="divide-y divide-pm-border">
                    {latestNotes.map((note) => (
                        <li key={note.id}>
                            <Link
                                href={`/research?note=${note.id}`}
                                className="grid grid-cols-[1fr_auto] sm:grid-cols-[7rem_1fr_auto] items-start gap-x-6 py-4 group"
                            >
                                <span className="hidden sm:block text-sm text-pm-subtle pt-1">
                                    {formatNoteDate(note.date)}
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-base sm:text-lg font-semibold leading-snug text-pm-text group-hover:text-pm-gold transition-colors">
                                        {note.title}
                                    </span>
                                    <span className="block mt-0.5 text-sm text-pm-subtle">
                                        <span className="sm:hidden">{formatNoteDate(note.date)}{note.linkedWatchlist ? ", " : ""}</span>
                                        {note.linkedWatchlist}
                                    </span>
                                </span>
                                <span className="pm-score mt-1" title="PM Score (0–100)">
                                    PM {note.pmScore}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            <p className="pb-12 text-xs text-pm-subtle leading-relaxed max-w-3xl">
                Watchlist performance is hypothetical and assumes each list is held at its stated weights from
                the Dec 31 close. Past performance does not guarantee future results. PM Research publishes research
                and watchlists, not personalized investment advice. PM Scores reflect research depth and thesis
                development, not return predictions.
            </p>
        </div>
    );
}
