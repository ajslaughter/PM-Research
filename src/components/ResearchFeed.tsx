"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { ResearchNote } from "@/lib/watchlists";
import { getPmScoreCategory } from "@/services/stockService";
import { formatNoteDate } from "@/lib/format";
import { X } from "lucide-react";

interface ResearchFeedProps {
    category?: string;
}

function NoteReader({ note, onClose }: { note: ResearchNote; onClose: () => void }) {
    const closeRef = useRef<HTMLButtonElement>(null);

    // Escape closes, focus starts on the close button, page behind doesn't scroll
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm overflow-y-auto px-3 sm:px-6 py-6 sm:py-10"
            onClick={onClose}
        >
            <article
                role="dialog"
                aria-modal="true"
                aria-labelledby="note-title"
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-4xl mx-auto bg-pm-charcoal border border-pm-border rounded-lg overflow-hidden"
            >
                <header className="px-5 sm:px-10 pt-8 pb-6 border-b border-pm-border">
                    <p className="text-sm text-pm-muted pr-10">
                        {formatNoteDate(note.date)}
                        {note.linkedWatchlist ? `, ${note.linkedWatchlist}` : ""}
                        {note.readTime ? `, ${note.readTime} read` : ""}
                    </p>
                    <h2 id="note-title" className="mt-2 type-display font-bold text-3xl sm:text-[40px] leading-[1] text-pm-text text-balance">
                        {note.title}
                    </h2>
                    <button
                        ref={closeRef}
                        onClick={onClose}
                        aria-label="Close note"
                        className="absolute top-4 right-4 p-2 rounded-md text-pm-muted hover:text-pm-text hover:bg-pm-dark transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </header>

                <div className="grid md:grid-cols-[1fr_240px]">
                    <div className="px-5 sm:px-10 py-8 text-[17px] leading-[1.7] text-pm-text/85 max-w-[68ch]">
                        {note.author && (
                            <p className="mb-6 text-sm text-pm-muted">By {note.author}</p>
                        )}
                        {note.fullContent.split("\n").map((line, i) => {
                            if (line.startsWith("## ")) {
                                return (
                                    <h3 key={i} className="type-condensed font-semibold text-2xl text-pm-text mt-10 mb-3">
                                        {line.replace("## ", "")}
                                    </h3>
                                );
                            }
                            if (line.startsWith("### ")) {
                                return (
                                    <h4 key={i} className="font-semibold text-lg text-pm-text mt-7 mb-2">
                                        {line.replace("### ", "")}
                                    </h4>
                                );
                            }
                            if (line.startsWith("* ")) {
                                return (
                                    <li key={i} className="ml-5 list-disc marker:text-pm-subtle pl-1 mb-2">
                                        {line.replace("* ", "")}
                                    </li>
                                );
                            }
                            if (line.trim() === "") return <div key={i} className="h-3" />;
                            return (
                                <p key={i} className="mb-3">
                                    {line}
                                </p>
                            );
                        })}
                    </div>

                    <aside className="px-5 sm:px-10 md:px-6 py-8 border-t md:border-t-0 md:border-l border-pm-border space-y-8">
                        <div>
                            <h3 className="text-sm text-pm-muted">PM Score</h3>
                            <p className="mt-1 type-display font-bold text-5xl text-pm-gold">{note.pmScore}</p>
                            <p className="text-sm text-pm-muted">{getPmScoreCategory(note.pmScore)}, out of 100</p>
                            <div className="mt-3 h-1 rounded-full bg-pm-border overflow-hidden" aria-hidden>
                                <div className="h-full bg-pm-gold" style={{ width: `${note.pmScore}%` }} />
                            </div>
                        </div>

                        {note.relatedTickers && note.relatedTickers.length > 0 && (
                            <div>
                                <h3 className="text-sm text-pm-muted">Related tickers</h3>
                                <ul className="mt-2 flex flex-wrap gap-1.5">
                                    {note.relatedTickers.map((ticker) => (
                                        <li
                                            key={ticker}
                                            className="type-condensed font-semibold text-sm px-2 py-1 rounded border border-pm-border text-pm-text"
                                        >
                                            {ticker}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <p className="text-xs text-pm-subtle leading-relaxed">
                            For education and information only, not financial advice. PM Scores reflect research depth
                            and thesis development, not return predictions.
                        </p>
                    </aside>
                </div>
            </article>
        </div>
    );
}

export default function ResearchFeed({ category = "All" }: ResearchFeedProps) {
    const { researchNotes } = useAdmin();
    const [selectedNote, setSelectedNote] = useState<ResearchNote | null>(null);

    // Deep link from the home page: /research?note=<id>
    useEffect(() => {
        const requested = new URLSearchParams(window.location.search).get("note");
        if (requested) {
            const match = researchNotes.find((n) => n.id === requested);
            if (match) setSelectedNote(match);
        }
    }, [researchNotes]);

    const open = (note: ResearchNote) => {
        setSelectedNote(note);
        window.history.replaceState(null, "", `/research?note=${note.id}`);
    };

    const close = useCallback(() => {
        setSelectedNote(null);
        window.history.replaceState(null, "", "/research");
    }, []);

    const notes = researchNotes
        .filter((note) => category === "All" || note.category === category)
        .sort((a, b) => b.date.localeCompare(a.date));

    if (notes.length === 0) {
        return <p className="py-12 text-pm-muted">No research published yet.</p>;
    }

    // Group by month, newest first
    const groups: Array<{ month: string; notes: ResearchNote[] }> = [];
    for (const note of notes) {
        const [y, m] = note.date.split("-").map(Number);
        const month = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        });
        const last = groups[groups.length - 1];
        if (last && last.month === month) last.notes.push(note);
        else groups.push({ month, notes: [note] });
    }

    return (
        <>
            <div className="space-y-12">
                {groups.map((group) => (
                    <section key={group.month} aria-label={group.month}>
                        <h2 className="section-title border-b border-pm-border pb-3">{group.month}</h2>
                        <ul className="divide-y divide-pm-border">
                            {group.notes.map((note) => (
                                <li key={note.id}>
                                    <button
                                        onClick={() => open(note)}
                                        className="w-full text-left grid grid-cols-[1fr_auto] sm:grid-cols-[6.5rem_1fr_auto] items-start gap-x-6 py-5 group"
                                    >
                                        <span className="hidden sm:block text-sm text-pm-subtle pt-1">
                                            {formatNoteDate(note.date, false)}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-lg font-semibold leading-snug text-pm-text group-hover:text-pm-gold transition-colors">
                                                {note.title}
                                            </span>
                                            <span className="mt-1 text-sm text-pm-muted leading-relaxed line-clamp-2 max-w-3xl">
                                                {note.summary}
                                            </span>
                                            <span className="mt-1.5 block text-xs text-pm-subtle">
                                                <span className="sm:hidden">{formatNoteDate(note.date, false)}, </span>
                                                {[note.linkedWatchlist, note.readTime && `${note.readTime} read`]
                                                    .filter(Boolean)
                                                    .join(", ")}
                                            </span>
                                        </span>
                                        <span className="pm-score mt-1" title="PM Score (0–100)">
                                            PM {note.pmScore}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>

            {selectedNote && <NoteReader note={selectedNote} onClose={close} />}
        </>
    );
}
