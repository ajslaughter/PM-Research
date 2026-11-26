/**
 * Technical indicators for the Charts section, computed in the browser
 * from the candles we already have. No paid data, no extra requests.
 *
 * Every function returns `{ time, value }` points, the shape a
 * lightweight-charts LineSeries takes. Bars before the indicator has
 * enough history are omitted rather than drawn as zeros, so a line simply
 * starts once it's valid. /api/candles fetches extra warm-up history so
 * that's normally before the left edge of the visible window.
 */

import type { Candle } from "./types";

export interface LinePoint {
    time: number;
    value: number;
}

/** Simple moving average of closes over `period` bars (rolling sum, O(n)). */
export function sma(candles: Candle[], period: number): LinePoint[] {
    const out: LinePoint[] = [];
    let sum = 0;
    for (let i = 0; i < candles.length; i++) {
        sum += candles[i].close;
        if (i >= period) sum -= candles[i - period].close;
        if (i >= period - 1) out.push({ time: candles[i].time, value: sum / period });
    }
    return out;
}

/**
 * Exponential moving average of closes.
 * Seeded with the SMA of the first `period` closes (the standard
 * convention, and what TradingView does), then k = 2 / (period + 1).
 */
export function ema(candles: Candle[], period: number): LinePoint[] {
    const out: LinePoint[] = [];
    if (candles.length < period) return out;

    const k = 2 / (period + 1);
    let prev = 0;
    for (let i = 0; i < period; i++) prev += candles[i].close;
    prev /= period;
    out.push({ time: candles[period - 1].time, value: prev });

    for (let i = period; i < candles.length; i++) {
        prev = candles[i].close * k + prev * (1 - k);
        out.push({ time: candles[i].time, value: prev });
    }
    return out;
}

/**
 * Relative Strength Index with Wilder's smoothing (the classic RSI 14).
 *   avgGain/avgLoss start as plain averages of the first `period` changes,
 *   then avg = (prevAvg * (period - 1) + current) / period.
 *   RSI = 100 - 100 / (1 + avgGain / avgLoss)
 */
export function rsi(candles: Candle[], period = 14): LinePoint[] {
    const out: LinePoint[] = [];
    if (candles.length <= period) return out;

    let gain = 0;
    let loss = 0;
    for (let i = 1; i <= period; i++) {
        const change = candles[i].close - candles[i - 1].close;
        if (change >= 0) gain += change;
        else loss -= change;
    }
    let avgGain = gain / period;
    let avgLoss = loss / period;

    const value = () => (avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
    out.push({ time: candles[period].time, value: value() });

    for (let i = period + 1; i < candles.length; i++) {
        const change = candles[i].close - candles[i - 1].close;
        avgGain = (avgGain * (period - 1) + Math.max(change, 0)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.max(-change, 0)) / period;
        out.push({ time: candles[i].time, value: value() });
    }
    return out;
}

/**
 * Indicator line colors. Gold is PM's own voice and green/red mean price
 * direction, so indicators use a separate, neutral set that reads on the
 * dark chart background.
 */
export const INDICATOR_COLORS = {
    sma20: "#7AA2F7", // blue
    sma50: "#C792EA", // violet
    sma200: "#ECEFF3", // paper
    ema21: "#5FC4C4", // teal
    rsi: "#C792EA",
    compare: "#7AA2F7",
} as const;
