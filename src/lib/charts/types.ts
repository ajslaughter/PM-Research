/**
 * Shared types for the Charts section (/charts).
 *
 * These are deliberately plain data shapes so they can cross the wire
 * (the /api/candles response), live in localStorage (saved settings), and
 * be handed to lightweight-charts without conversion.
 */

/**
 * Timeframe buttons shown above the chart. The value is what we send to
 * /api/candles as `range`; the server maps it to a Yahoo range + bar interval.
 */
export type ChartRange = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "ytd" | "1y" | "5y";

/** Button order and labels for the timeframe bar. */
export const CHART_RANGES: Array<{ value: ChartRange; label: string }> = [
    { value: "1d", label: "1D" },
    { value: "5d", label: "5D" },
    { value: "1mo", label: "1M" },
    { value: "3mo", label: "3M" },
    { value: "6mo", label: "6M" },
    { value: "ytd", label: "YTD" },
    { value: "1y", label: "1Y" },
    { value: "5y", label: "5Y" },
];

/**
 * One OHLCV bar.
 *
 * `time` is a UNIX timestamp in seconds (lightweight-charts' UTCTimestamp).
 *   - Intraday bars keep their real timestamp; the chart formats them in New York time.
 *   - Daily and weekly bars are snapped to 00:00 UTC of the exchange's local date,
 *     so a stock bar and a crypto bar for the same day share one time slot
 *     (needed for the compare overlay) and the date label never drifts a day.
 */
export interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

/** Response body of GET /api/candles. */
export interface CandlesResponse {
    symbol: string;
    range: ChartRange;
    /** Yahoo bar interval actually used, e.g. "5m", "1d", "1wk". */
    interval: string;
    /** True when bars are intraday (time-of-day labels on the axis). */
    intraday: boolean;
    /**
     * First bar that belongs to the requested window. Bars before it are
     * warm-up history so SMA 200 / RSI are correct from the left edge; the
     * chart opens scrolled to `visibleFrom` and the user can pan back into them.
     */
    visibleFrom: number;
    /** Close before the window, used for the "change over range" readout. */
    previousClose: number | null;
    currency: string | null;
    /** Display name from Yahoo (fallback when the symbol isn't in our database). */
    name: string | null;
    candles: Candle[];
}

/** Which indicators are switched on. All free, all client-side. */
export interface IndicatorSettings {
    sma20: boolean;
    sma50: boolean;
    sma200: boolean;
    ema21: boolean;
    volume: boolean;
    rsi: boolean;
}

export const DEFAULT_INDICATORS: IndicatorSettings = {
    sma20: false,
    sma50: true,
    sma200: false,
    ema21: false,
    volume: true,
    rsi: false,
};

/** Everything about the chart view we remember between visits (not drawings). */
export interface ChartSettings {
    range: ChartRange;
    indicators: IndicatorSettings;
    /** Symbol overlaid as a line on the left price axis, or null for none. */
    compare: string | null;
    /** Drawing magnet: snap drawing points to the bar's OHLC. */
    magnet: boolean;
}

export const DEFAULT_SETTINGS: ChartSettings = {
    range: "6mo",
    indicators: DEFAULT_INDICATORS,
    compare: null,
    magnet: false,
};

/** One entry in the symbol search. */
export interface SymbolInfo {
    symbol: string;
    name: string;
    /** Grouping shown in the dropdown: a watchlist theme, "Index ETF" or "Crypto". */
    group: string;
}
