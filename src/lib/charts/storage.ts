/**
 * localStorage persistence for the Charts section.
 *
 *   pm-charts:drawings:<SYMBOL>  the DrawingManager's exportJSON() for that symbol
 *   pm-charts:settings           ChartSettings (timeframe, indicators, compare, magnet)
 *   pm-charts:last-symbol        what /charts opens on next time
 *
 * Every access is wrapped in try/catch: storage can be missing or throw
 * (Safari private mode, blocked site data, quota full), and the chart
 * must still work, just without remembering anything.
 */

import { DEFAULT_SETTINGS, DEFAULT_INDICATORS, CHART_RANGES, type ChartSettings } from "./types";

const PREFIX = "pm-charts";
const drawingsKey = (symbol: string) => `${PREFIX}:drawings:${symbol.toUpperCase()}`;
const SETTINGS_KEY = `${PREFIX}:settings`;
const LAST_SYMBOL_KEY = `${PREFIX}:last-symbol`;

function read(key: string): string | null {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function write(key: string, value: string | null) {
    try {
        if (value === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, value);
    } catch {
        // Storage unavailable or full: the chart keeps working, it just won't remember.
    }
}

/** Saved drawings JSON for a symbol, or null if there are none. */
export function loadDrawings(symbol: string): string | null {
    return read(drawingsKey(symbol));
}

/** Save drawings JSON; an empty list removes the key so storage doesn't fill with "[]". */
export function saveDrawings(symbol: string, json: string) {
    write(drawingsKey(symbol), json === "[]" ? null : json);
}

/**
 * Load settings, merged over the defaults so a settings blob saved by an
 * older version (missing a newer field) still produces a complete object.
 */
export function loadSettings(): ChartSettings {
    const raw = read(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    try {
        const parsed = JSON.parse(raw) as Partial<ChartSettings>;
        const range = CHART_RANGES.some((r) => r.value === parsed.range) ? parsed.range! : DEFAULT_SETTINGS.range;
        return {
            range,
            indicators: { ...DEFAULT_INDICATORS, ...(parsed.indicators ?? {}) },
            compare: typeof parsed.compare === "string" ? parsed.compare : null,
            magnet: parsed.magnet === true,
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export function saveSettings(settings: ChartSettings) {
    write(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadLastSymbol(): string | null {
    return read(LAST_SYMBOL_KEY);
}

export function saveLastSymbol(symbol: string) {
    write(LAST_SYMBOL_KEY, symbol);
}
