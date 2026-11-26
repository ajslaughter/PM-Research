"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { normalizeSymbol, searchSymbols } from "@/lib/charts/symbols";

/**
 * Ticker search with autocomplete.
 *
 * Suggests every watchlist ticker + index ETFs + large-cap crypto
 * (src/lib/charts/symbols.ts), ranked by ticker match, then name match.
 * Enter on free text that isn't in the list still works: any ticker-shaped
 * input is accepted, and /api/candles reports back if Yahoo doesn't know it.
 *
 * Keyboard: ↑/↓ move, Enter picks, Escape closes. Implements the ARIA
 * combobox pattern so screen readers announce the active option.
 */
export function SymbolSearch({
    onSelect,
    placeholder = "Search ticker or company",
    autoFocus = false,
    compact = false,
    onCancel,
}: {
    onSelect: (symbol: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
    /** Smaller input, used for the compare picker. */
    compact?: boolean;
    /** Escape on an empty box (the compare picker uses this to close itself). */
    onCancel?: () => void;
}) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const listId = useId();

    const results = useMemo(() => searchSymbols(query, 12), [query]);

    // Close when clicking anywhere outside the search.
    useEffect(() => {
        const onDown = (e: PointerEvent) => {
            if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("pointerdown", onDown);
        return () => document.removeEventListener("pointerdown", onDown);
    }, []);

    useEffect(() => setActive(0), [query]);

    const pick = (symbol: string) => {
        onSelect(symbol);
        setQuery("");
        setOpen(false);
        inputRef.current?.blur();
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            // Highlighted suggestion first; otherwise take the typed text as a ticker.
            if (open && results[active]) pick(results[active].symbol);
            else {
                const typed = normalizeSymbol(query);
                if (typed) pick(typed);
            }
        } else if (e.key === "Escape") {
            if (!query) onCancel?.();
            setOpen(false);
        }
    };

    return (
        <div ref={wrapRef} className="relative w-full">
            <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-pm-subtle pointer-events-none ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`}
                aria-hidden
            />
            <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-activedescendant={open && results[active] ? `${listId}-${active}` : undefined}
                aria-label={placeholder}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                autoFocus={autoFocus}
                value={query}
                placeholder={placeholder}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
                className={`w-full bg-pm-dark border border-pm-border rounded-md text-pm-text placeholder:text-pm-subtle
                    focus:outline-none focus:border-pm-gold focus:ring-1 focus:ring-pm-gold
                    ${compact ? "pl-8 pr-7 py-1.5 text-sm" : "pl-9 pr-8 py-2.5 text-sm"}`}
            />
            {query && (
                <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-pm-subtle hover:text-pm-text"
                    aria-label="Clear search"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}

            {open && results.length > 0 && (
                <ul
                    id={listId}
                    role="listbox"
                    className="absolute z-30 mt-1 w-full max-h-80 overflow-y-auto bg-pm-charcoal border border-pm-border rounded-md shadow-xl py-1"
                >
                    {results.map((r, i) => (
                        <li
                            key={r.symbol}
                            id={`${listId}-${i}`}
                            role="option"
                            aria-selected={i === active}
                            // pointerdown (not click) so the pick happens before the input blurs
                            onPointerDown={(e) => {
                                e.preventDefault();
                                pick(r.symbol);
                            }}
                            onMouseEnter={() => setActive(i)}
                            className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
                                i === active ? "bg-pm-dark" : ""
                            }`}
                        >
                            <span className="type-condensed font-semibold text-sm text-pm-text w-20 shrink-0">
                                {r.symbol}
                            </span>
                            <span className="text-sm text-pm-muted truncate flex-1">{r.name}</span>
                            <span className="text-[11px] text-pm-subtle shrink-0 hidden sm:inline">{r.group}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
