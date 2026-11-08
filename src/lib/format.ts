/**
 * Shared number formatting for prices and returns.
 */

/** "+1.23%", "−4.56%", "0.00%" — true minus sign so signed columns line up. */
export function formatPct(value: number | null | undefined, digits = 2): string {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    const rounded = Number(value.toFixed(digits));
    if (rounded === 0) return `${(0).toFixed(digits)}%`;
    const sign = rounded > 0 ? "+" : "−";
    return `${sign}${Math.abs(rounded).toFixed(digits)}%`;
}

/** Text color for a return: up, down, or neutral for flat / missing. */
export function directionClass(value: number | null | undefined, digits = 2): string {
    if (value === null || value === undefined || Number.isNaN(value)) return "text-pm-muted";
    const rounded = Number(value.toFixed(digits));
    if (rounded > 0) return "text-pm-up";
    if (rounded < 0) return "text-pm-down";
    return "text-pm-muted";
}

export function formatPrice(value: number | null | undefined): string {
    if (!value || value <= 0) return "—";
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatMarketCap(value: number | null | undefined): string {
    if (!value || value <= 0) return "—";
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${value.toLocaleString("en-US")}`;
}

/** "Mar 8, 2026" from "2026-03-08" without timezone drift. */
export function formatNoteDate(isoDate: string, withYear = true): string {
    const [y, m, d] = isoDate.split("-").map(Number);
    if (!y || !m || !d) return isoDate;
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(withYear ? { year: "numeric" } : {}),
        timeZone: "UTC",
    });
}

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** "Nine" for 9; numerals past twelve. */
export function countWord(n: number, capitalize = false): string {
    const word = NUMBER_WORDS[n] ?? String(n);
    return capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}
