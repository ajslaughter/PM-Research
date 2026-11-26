"use client";

/**
 * ChartWithTools: a free, TradingView-style chart for one symbol.
 *
 *   <ChartWithTools symbol="NVDA" />
 *
 * What it does
 *   - Candlesticks + volume, rendered by lightweight-charts (TradingView's
 *     open-source engine, Apache 2.0).
 *   - Drawing tools (trend lines, rays, horizontals, Fibonacci, rectangles,
 *     channels, text, brush, ...) from lightweight-charts-drawing (MIT). That
 *     library does the hard parts: placement, hit-testing, anchors, dragging,
 *     Delete/Escape keys. This component only arms tools and stores the result.
 *   - Timeframes 1D..5Y, SMA 20/50/200, EMA 21, volume, RSI 14 (lower pane).
 *   - Compare: a second symbol as a line on the left price axis.
 *   - Crosshair readout with OHLC, bar change and volume.
 *   - Drawings saved per symbol and view settings saved globally, in
 *     localStorage (src/lib/charts/storage.ts).
 *   - Live: while the market is open the last bar refreshes every minute.
 *
 * How it's organised
 *   One effect creates the chart, series and DrawingManager exactly once and
 *   tears them down on unmount. Separate effects then *sync* that imperative
 *   chart to React state: candles, indicators, compare, magnet. Mutable
 *   things the chart callbacks need (current candles, intraday flag, which
 *   symbol's drawings are loaded) live in refs so callbacks never go stale.
 *
 * Browser-only (canvas + window), so pages load it with next/dynamic and ssr: false.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
    CandlestickSeries,
    ColorType,
    CrosshairMode,
    HistogramSeries,
    LineSeries,
    LineStyle,
    TickMarkType,
    createChart,
    type IChartApi,
    type ISeriesApi,
    type Time,
    type UTCTimestamp,
} from "lightweight-charts";
import { DrawingManager, type Drawing, type DrawingKind, type OHLC } from "lightweight-charts-drawing";
import { Loader2 } from "lucide-react";

import { ChartControls } from "./ChartControls";
import { DrawingToolbar, TOOL_SHORTCUTS } from "./DrawingToolbar";
import { useCandles } from "@/hooks/useCandles";
import { INDICATOR_COLORS, ema, rsi, sma, type LinePoint } from "@/lib/charts/indicators";
import { getSymbolInfo } from "@/lib/charts/symbols";
import { loadDrawings, loadSettings, saveDrawings, saveSettings } from "@/lib/charts/storage";
import { CHART_RANGES, DEFAULT_SETTINGS, type Candle, type ChartSettings, type IndicatorSettings } from "@/lib/charts/types";
import { directionClass, formatPct } from "@/lib/format";

/* ------------------------------------------------------------------------ */
/* Theme: the site's Tailwind tokens (tailwind.config.ts), as canvas colors  */
/* ------------------------------------------------------------------------ */

const C = {
    bg: "#151A20", // pm-charcoal: the chart sits in a panel
    border: "#262D36", // pm-border
    grid: "rgba(38, 45, 54, 0.55)", // pm-border, softened so it doesn't compete with candles
    dark: "#1C222A", // pm-dark: crosshair label boxes
    text: "#ECEFF3",
    muted: "#9AA4AF",
    subtle: "#6C7581",
    up: "#3BCF8E", // pm-up: price direction only
    down: "#F0616D", // pm-down: price direction only
    upVol: "rgba(59, 207, 142, 0.35)",
    downVol: "rgba(240, 97, 109, 0.35)",
};

/** Indicator lines that sit on the price pane (RSI gets its own pane). */
const OVERLAY_INDICATORS: Array<{ key: keyof IndicatorSettings; compute: (c: Candle[]) => LinePoint[]; color: string }> = [
    { key: "sma20", compute: (c) => sma(c, 20), color: INDICATOR_COLORS.sma20 },
    { key: "sma50", compute: (c) => sma(c, 50), color: INDICATOR_COLORS.sma50 },
    { key: "sma200", compute: (c) => sma(c, 200), color: INDICATOR_COLORS.sma200 },
    { key: "ema21", compute: (c) => ema(c, 21), color: INDICATOR_COLORS.ema21 },
];

/* ------------------------------------------------------------------------ */
/* Formatting helpers                                                        */
/* ------------------------------------------------------------------------ */

const NY = "America/New_York";
// Intraday bars carry real timestamps and are labelled in exchange (New York) time.
// Daily/weekly bars are stored as 00:00 UTC of their date, so they're labelled in UTC.
const dtf = (opts: Intl.DateTimeFormatOptions, intraday: boolean) =>
    new Intl.DateTimeFormat("en-US", { ...opts, timeZone: intraday ? NY : "UTC" });
const FMT = {
    intraday: {
        year: dtf({ year: "numeric" }, true),
        month: dtf({ month: "short" }, true),
        day: dtf({ day: "numeric" }, true),
        time: dtf({ hour: "numeric", minute: "2-digit" }, true),
        crosshair: dtf({ weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }, true),
    },
    daily: {
        year: dtf({ year: "numeric" }, false),
        month: dtf({ month: "short" }, false),
        day: dtf({ day: "numeric" }, false),
        time: dtf({ month: "short", day: "numeric" }, false),
        crosshair: dtf({ weekday: "short", month: "short", day: "numeric", year: "numeric" }, false),
    },
};

/** Time-axis tick labels. Year/month/day ticks get the coarsest useful label, like TradingView. */
function tickLabel(time: Time, type: TickMarkType, intraday: boolean): string {
    const f = intraday ? FMT.intraday : FMT.daily;
    const d = new Date((time as number) * 1000);
    switch (type) {
        case TickMarkType.Year:
            return f.year.format(d);
        case TickMarkType.Month:
            return f.month.format(d);
        case TickMarkType.DayOfMonth:
            return f.day.format(d);
        default:
            return f.time.format(d);
    }
}

/** Decimal places for a price: 2 for stocks, more for sub-dollar crypto (DOGE, ADA). */
function precisionFor(price: number): number {
    if (price >= 1) return 2;
    if (price >= 0.01) return 4;
    return 6;
}

/** 1234567 → "1.23M". Crypto volume on Yahoo is in USD, so it's large; same format works. */
function formatVolume(v: number): string {
    if (!v) return "—";
    if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
    return v.toFixed(0);
}

const asTime = (t: number) => t as UTCTimestamp;

/* ------------------------------------------------------------------------ */
/* Component                                                                 */
/* ------------------------------------------------------------------------ */

export default function ChartWithTools({ symbol }: { symbol: string }) {
    // ---- View settings (timeframe, indicators, compare, magnet), remembered across visits.
    // Lazy init from localStorage is safe here: this component never renders on the server.
    const [settings, setSettings] = useState<ChartSettings>(() =>
        typeof window === "undefined" ? DEFAULT_SETTINGS : loadSettings()
    );
    const update = useCallback((patch: Partial<ChartSettings>) => setSettings((s) => ({ ...s, ...patch })), []);
    useEffect(() => saveSettings(settings), [settings]);

    // Comparing a symbol with itself is meaningless; ignore a saved compare that equals the main symbol.
    const compareSymbol = settings.compare && settings.compare !== symbol ? settings.compare : null;

    // ---- Data
    const { data, loading, error, reload } = useCandles(symbol, settings.range);
    const { data: compareData, error: compareError } = useCandles(compareSymbol, settings.range);

    // ---- Drawing UI state mirrored from the DrawingManager's events
    const [activeTool, setActiveTool] = useState<DrawingKind | null>(null);
    const [selection, setSelection] = useState<string[]>([]);
    const [drawingCount, setDrawingCount] = useState(0);
    const [drawingsVisible, setDrawingsVisible] = useState(true);
    /** Open text editor for a text drawing, positioned in chart-pane pixels. */
    const [textEdit, setTextEdit] = useState<{ drawing: Drawing; x: number; y: number; value: string; openedAt: number } | null>(null);

    // ---- Crosshair readout: index into the candles of the bar under the cursor (null = latest bar)
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    /** Left inset for the readout so it clears the left price axis when a compare symbol is on. */
    const [readoutLeft, setReadoutLeft] = useState(8);

    // ---- Imperative chart objects (created once)
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const managerRef = useRef<DrawingManager | null>(null);
    const overlayRefs = useRef(new Map<keyof IndicatorSettings, ISeriesApi<"Line">>());
    const rsiRef = useRef<ISeriesApi<"Line"> | null>(null);
    const compareRef = useRef<ISeriesApi<"Line"> | null>(null);

    // ---- Values the chart's callbacks read (refs so the callbacks never capture stale state)
    const candlesRef = useRef<Candle[]>([]);
    const indexByTimeRef = useRef(new Map<number, number>());
    const intradayRef = useRef(false);
    /** "SYMBOL|range" currently on screen: a change means "new view, reset zoom". */
    const viewKeyRef = useRef<string | null>(null);
    /** Symbol whose drawings are loaded into the manager (drawings are per symbol, not per range). */
    const drawingsSymbolRef = useRef<string | null>(null);
    /** True while we swap one symbol's drawings for another's, so that churn isn't saved. */
    const suppressSaveRef = useRef(false);

    /* -------------------------------------------------------------------- */
    /* 1. Create the chart, series and drawing manager once                  */
    /* -------------------------------------------------------------------- */
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // Canvas can't resolve the CSS variable next/font sets, so read the resolved
        // Archivo family off <body> and hand that string to the chart.
        const fontFamily = getComputedStyle(document.body).fontFamily;

        const chart = createChart(el, {
            autoSize: true, // follows the container through resizes and rotation
            layout: {
                background: { type: ColorType.Solid, color: C.bg },
                textColor: C.muted,
                fontFamily,
                fontSize: 11,
                // No logo watermark on the canvas. The Apache-2.0 NOTICE attribution
                // lightweight-charts asks for is the link in this component's footer.
                attributionLogo: false,
                panes: { separatorColor: C.border, separatorHoverColor: C.dark },
            },
            grid: { vertLines: { color: C.grid }, horzLines: { color: C.grid } },
            crosshair: {
                mode: CrosshairMode.Normal, // free crosshair (Magnet mode would hide where you actually point)
                vertLine: { color: C.subtle, style: LineStyle.Dashed, width: 1, labelBackgroundColor: C.dark },
                horzLine: { color: C.subtle, style: LineStyle.Dashed, width: 1, labelBackgroundColor: C.dark },
            },
            rightPriceScale: { borderColor: C.border },
            leftPriceScale: { borderColor: C.border, visible: false },
            timeScale: {
                borderColor: C.border,
                rightOffset: 6,
                tickMarkFormatter: (t: Time, type: TickMarkType) => tickLabel(t, type, intradayRef.current),
            },
            localization: {
                timeFormatter: (t: Time) =>
                    (intradayRef.current ? FMT.intraday : FMT.daily).crosshair.format(new Date((t as number) * 1000)),
            },
        });

        // Price pane: candles on the right scale, leaving room at the bottom for volume.
        const candles = chart.addSeries(CandlestickSeries, {
            upColor: C.up,
            downColor: C.down,
            wickUpColor: C.up,
            wickDownColor: C.down,
            borderVisible: false,
        });
        candles.priceScale().applyOptions({ scaleMargins: { top: 0.08, bottom: 0.22 } });

        // Volume: an overlay histogram on its own hidden scale in the bottom 18% of the pane.
        const volume = chart.addSeries(HistogramSeries, {
            priceScaleId: "volume",
            priceFormat: { type: "volume" },
            lastValueVisible: false,
            priceLineVisible: false,
        });
        chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });

        // Drawing tools live on the candle series (one primitive draws every drawing).
        const manager = new DrawingManager(chart, candles, {
            // Our candles (with volume) for the magnet and volume-based tools.
            bars: () => candlesRef.current as unknown as OHLC[],
            fontFamily,
            magnet: "off",
            // Fatter hit area for fingers: 16px each side = a 32px band (mouse unaffected).
            touchHitTolerance: 16,
        });

        // Mirror manager state into React for the toolbar.
        const offs = [
            manager.on("tool", (kind) => setActiveTool(kind)),
            manager.on("selection", (ids) => setSelection([...ids])),
            manager.on("visibility", (visible) => setDrawingsVisible(visible)),
            manager.on("change", () => {
                setDrawingCount(manager.drawings().length);
                // Persist on every change (add, drag, delete, text edit), per symbol.
                const sym = drawingsSymbolRef.current;
                if (sym && !suppressSaveRef.current) saveDrawings(sym, manager.exportJSON());
            }),
            // A text tool was placed or double-clicked: open our inline editor at that spot.
            // Deferred one task: the event fires inside the placing pointerdown, and that
            // click's own mousedown would otherwise steal focus from the new input at once.
            manager.on("textEdit", (d, pt) => {
                window.setTimeout(
                    () => setTextEdit({ drawing: d, x: pt.x, y: pt.y, value: d.text ?? "", openedAt: Date.now() }),
                    0
                );
            }),
        ];

        // Crosshair → readout. Off-chart (time undefined) falls back to the latest bar.
        const onMove = (param: { time?: Time }) => {
            const i = param.time === undefined ? undefined : indexByTimeRef.current.get(param.time as number);
            setHoverIndex(i ?? null);
        };
        chart.subscribeCrosshairMove(onMove);

        chartRef.current = chart;
        candleRef.current = candles;
        volumeRef.current = volume;
        managerRef.current = manager;
        // Capture the maps for cleanup (lint: refs may change by the time cleanup runs).
        const overlays = overlayRefs.current;

        return () => {
            offs.forEach((off) => off());
            chart.unsubscribeCrosshairMove(onMove);
            manager.destroy();
            chart.remove();
            chartRef.current = null;
            candleRef.current = null;
            volumeRef.current = null;
            managerRef.current = null;
            overlays.clear();
            rsiRef.current = null;
            compareRef.current = null;
            viewKeyRef.current = null;
            drawingsSymbolRef.current = null;
        };
    }, []);

    /* -------------------------------------------------------------------- */
    /* 2. Candles + volume (and drawings when the symbol changes)            */
    /* -------------------------------------------------------------------- */
    useEffect(() => {
        const chart = chartRef.current;
        const candleSeries = candleRef.current;
        const volumeSeries = volumeRef.current;
        const manager = managerRef.current;
        if (!data || !chart || !candleSeries || !volumeSeries || !manager || data.candles.length === 0) return;

        const bars = data.candles;
        const prevBars = candlesRef.current;
        const viewKey = `${data.symbol}|${data.range}`;
        const isNewView = viewKeyRef.current !== viewKey;

        candlesRef.current = bars;
        indexByTimeRef.current = new Map(bars.map((b, i) => [b.time, i]));
        intradayRef.current = data.intraday;

        // Axis shows time of day only for intraday bars.
        chart.applyOptions({ timeScale: { timeVisible: data.intraday, secondsVisible: false } });

        // Precision follows the price: $0.12 DOGE needs 4 decimals, $180 NVDA needs 2.
        const precision = precisionFor(bars[bars.length - 1].close);
        candleSeries.applyOptions({ priceFormat: { type: "price", precision, minMove: 1 / 10 ** precision } });

        const toCandle = (b: Candle) => ({ time: asTime(b.time), open: b.open, high: b.high, low: b.low, close: b.close });
        const toVolume = (b: Candle) => ({ time: asTime(b.time), value: b.volume, color: b.close >= b.open ? C.upVol : C.downVol });

        const lastPrevTime = prevBars[prevBars.length - 1]?.time;
        if (isNewView || lastPrevTime === undefined) {
            candleSeries.setData(bars.map(toCandle));
            volumeSeries.setData(bars.map(toVolume));
        } else {
            // Live refresh of the same view: update() only the last bar and any new ones,
            // so the user's zoom/scroll and any drag in progress are untouched.
            for (const b of bars) {
                if (b.time < lastPrevTime) continue;
                candleSeries.update(toCandle(b));
                volumeSeries.update(toVolume(b));
            }
        }

        if (isNewView) {
            // Open on the requested window (warm-up history stays off-screen to the left)
            // with a few bars of breathing room on the right.
            const from = indexByTimeRef.current.get(data.visibleFrom) ?? 0;
            chart.timeScale().setVisibleLogicalRange({ from, to: bars.length - 1 + 4 });
            viewKeyRef.current = viewKey;
        }

        // Drawings are per symbol. Swap them only when the symbol changes, not the timeframe,
        // so a trend line drawn on 6M is still there on 1Y.
        if (drawingsSymbolRef.current !== data.symbol) {
            suppressSaveRef.current = true;
            manager.clear();
            const saved = loadDrawings(data.symbol);
            if (saved) {
                try {
                    manager.importJSON(saved);
                } catch {
                    // Corrupt or incompatible save: start clean rather than break the chart.
                }
            }
            drawingsSymbolRef.current = data.symbol;
            suppressSaveRef.current = false;
            setDrawingCount(manager.drawings().length);
            setTextEdit(null);
        }

        setHoverIndex(null);
    }, [data]);

    /* -------------------------------------------------------------------- */
    /* 3. Indicators: create / update / remove series to match the toggles   */
    /* -------------------------------------------------------------------- */
    useEffect(() => {
        const chart = chartRef.current;
        const candleSeries = candleRef.current;
        const volumeSeries = volumeRef.current;
        if (!chart || !candleSeries || !volumeSeries) return;
        const bars = data?.candles ?? [];
        const ind = settings.indicators;

        // Moving averages on the price pane. Series are kept (not recreated) while enabled,
        // so a live refresh just re-sets their data.
        for (const def of OVERLAY_INDICATORS) {
            let series = overlayRefs.current.get(def.key);
            if (ind[def.key]) {
                if (!series) {
                    series = chart.addSeries(LineSeries, {
                        color: def.color,
                        lineWidth: 1,
                        priceLineVisible: false,
                        lastValueVisible: false,
                        crosshairMarkerVisible: false,
                    });
                    overlayRefs.current.set(def.key, series);
                }
                series.setData(def.compute(bars).map((p) => ({ time: asTime(p.time), value: p.value })));
            } else if (series) {
                chart.removeSeries(series);
                overlayRefs.current.delete(def.key);
            }
        }

        // Volume on/off; candles take the freed-up space when it's off.
        volumeSeries.applyOptions({ visible: ind.volume });
        candleSeries.priceScale().applyOptions({ scaleMargins: { top: 0.08, bottom: ind.volume ? 0.22 : 0.08 } });

        // RSI 14 in a second pane (pane index 1). Removing its only series removes the pane.
        if (ind.rsi) {
            if (!rsiRef.current) {
                const series = chart.addSeries(
                    LineSeries,
                    {
                        color: INDICATOR_COLORS.rsi,
                        lineWidth: 1,
                        priceLineVisible: false,
                        crosshairMarkerVisible: false,
                        priceFormat: { type: "price", precision: 1, minMove: 0.1 },
                        // Always show the full 0–100 band so 70/30 sit in the same place.
                        autoscaleInfoProvider: () => ({ priceRange: { minValue: 0, maxValue: 100 } }),
                    },
                    1
                );
                // Overbought / oversold guides.
                for (const price of [70, 30]) {
                    series.createPriceLine({ price, color: C.subtle, lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: false, title: "" });
                }
                // Price pane 3/4 of the height, RSI 1/4.
                const panes = chart.panes();
                panes[0]?.setStretchFactor(3);
                panes[1]?.setStretchFactor(1);
                rsiRef.current = series;
            }
            rsiRef.current.setData(rsi(bars, 14).map((p) => ({ time: asTime(p.time), value: p.value })));
        } else if (rsiRef.current) {
            chart.removeSeries(rsiRef.current);
            rsiRef.current = null;
        }
    }, [data, settings.indicators]);

    /* -------------------------------------------------------------------- */
    /* 4. Compare overlay: second symbol as a line on the left axis          */
    /* -------------------------------------------------------------------- */
    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        // Only draw compare data that matches what's on screen (no stale symbol or timeframe).
        const ready =
            compareSymbol && compareData && data && compareData.symbol === compareSymbol && compareData.range === data.range;

        if (!ready) {
            if (compareRef.current) {
                chart.removeSeries(compareRef.current);
                compareRef.current = null;
            }
            chart.applyOptions({ leftPriceScale: { visible: false } });
            setReadoutLeft(8);
            return;
        }

        if (!compareRef.current) {
            compareRef.current = chart.addSeries(LineSeries, {
                color: INDICATOR_COLORS.compare,
                lineWidth: 2,
                priceScaleId: "left",
                priceLineVisible: false,
                lastValueVisible: true,
                crosshairMarkerVisible: true,
            });
        }
        compareRef.current.applyOptions({ title: compareSymbol });
        // Keep only times the main symbol has. Otherwise comparing SPY with BTC-USD would
        // insert weekend/overnight slots into the stock's time axis and gap its candles.
        const times = indexByTimeRef.current;
        compareRef.current.setData(
            compareData.candles.filter((b) => times.has(b.time)).map((b) => ({ time: asTime(b.time), value: b.close }))
        );
        chart.applyOptions({ leftPriceScale: { visible: true } });
        chart.priceScale("left").applyOptions({ scaleMargins: { top: 0.08, bottom: settings.indicators.volume ? 0.22 : 0.08 } });
        // The left axis gets its width on the next paint; read it then and move the readout past it.
        const raf = requestAnimationFrame(() => setReadoutLeft(chart.priceScale("left").width() + 8));
        return () => cancelAnimationFrame(raf);
    }, [compareData, compareSymbol, data, settings.indicators.volume]);

    /* -------------------------------------------------------------------- */
    /* 5. Magnet + keyboard shortcuts                                        */
    /* -------------------------------------------------------------------- */
    useEffect(() => {
        managerRef.current?.setMagnet(settings.magnet ? "weak" : "off");
    }, [settings.magnet]);

    useEffect(() => {
        // Alt+T trend line, Alt+H horizontal, Alt+J horizontal ray, Alt+V vertical,
        // Alt+F Fibonacci, Alt+R rectangle, Alt+N text (TradingView's own bindings where it has one).
        // e.code, not e.key: on macOS Option+T types "†".
        const onKey = (e: KeyboardEvent) => {
            if (!e.altKey || e.ctrlKey || e.metaKey) return;
            const target = e.target as HTMLElement | null;
            if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
            const kind = TOOL_SHORTCUTS[e.code];
            if (!kind) return;
            e.preventDefault();
            managerRef.current?.setTool(kind);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    /* -------------------------------------------------------------------- */
    /* Toolbar actions                                                       */
    /* -------------------------------------------------------------------- */

    const onTool = (kind: DrawingKind | null) => managerRef.current?.setTool(kind);

    const onDeleteSelected = () => {
        const m = managerRef.current;
        if (!m) return;
        for (const id of m.selection()) m.remove(id);
    };

    const onClearAll = () => {
        const m = managerRef.current;
        if (!m || m.drawings().length === 0) return;
        if (window.confirm(`Remove all ${m.drawings().length} drawings on ${symbol}?`)) m.clear();
    };

    const onToggleVisible = () => {
        const m = managerRef.current;
        if (m) m.setDrawingsVisible(!m.drawingsVisible());
    };

    /** Save the chart, drawings included, as a PNG with a one-line symbol/timeframe caption. */
    const onScreenshot = () => {
        const chart = chartRef.current;
        if (!chart) return;
        const shot = chart.takeScreenshot(true); // true = include primitives (the drawings)
        const band = Math.round(28 * (window.devicePixelRatio || 1));
        const out = document.createElement("canvas");
        out.width = shot.width;
        out.height = shot.height + band;
        const ctx = out.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = C.bg;
        ctx.fillRect(0, 0, out.width, out.height);
        ctx.fillStyle = C.text;
        ctx.font = `600 ${Math.round(band * 0.5)}px ${getComputedStyle(document.body).fontFamily}`;
        ctx.textBaseline = "middle";
        const rangeLabel = CHART_RANGES.find((r) => r.value === settings.range)?.label ?? settings.range;
        ctx.fillText(`${symbol} · ${rangeLabel}${compareSymbol ? ` vs ${compareSymbol}` : ""}`, band * 0.4, band / 2);
        ctx.drawImage(shot, 0, band);
        out.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${symbol}-${rangeLabel}-${new Date().toISOString().slice(0, 10)}.png`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }, "image/png");
    };

    /**
     * Write the inline editor's text to the drawing. `text` is optional on every
     * drawing (absent until first set); empty leaves the library's faint placeholder.
     * Read the drawing fresh from the manager in case it was dragged while editing.
     */
    const commitText = () => {
        const m = managerRef.current;
        if (m && textEdit) {
            const current = m.get(textEdit.drawing.id);
            if (current) m.update({ ...current, text: textEdit.value.trim() || undefined });
        }
        setTextEdit(null);
    };

    /* -------------------------------------------------------------------- */
    /* Render                                                                */
    /* -------------------------------------------------------------------- */

    // Header: latest price and change over the selected range.
    const bars = data?.symbol === symbol ? data.candles : [];
    const last = bars[bars.length - 1];
    const rangeChange =
        last && data?.previousClose ? ((last.close - data.previousClose) / data.previousClose) * 100 : null;
    const precision = last ? precisionFor(last.close) : 2;
    const fmt = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: precision, maximumFractionDigits: precision });
    const name = getSymbolInfo(symbol)?.name ?? (data?.symbol === symbol ? data.name : null);
    const rangeLabel = CHART_RANGES.find((r) => r.value === settings.range)?.label;

    // Readout: hovered bar, or the latest. Bar change is vs the previous bar's close.
    const ri = hoverIndex ?? bars.length - 1;
    const rb = bars[ri];
    const rPrev = ri > 0 ? bars[ri - 1] : undefined;
    const barChange = rb && rPrev ? ((rb.close - rPrev.close) / rPrev.close) * 100 : null;
    const barColor = rb ? (rb.close >= rb.open ? "text-pm-up" : "text-pm-down") : "text-pm-muted";

    const showLoading = loading && (!data || data.symbol !== symbol || data.range !== settings.range);

    return (
        <section className="bg-pm-charcoal border border-pm-border rounded-lg overflow-hidden" aria-label={`${symbol} chart`}>
            {/* Symbol header */}
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1 px-3 sm:px-4 pt-3 pb-2">
                <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                        <h2 className="type-condensed text-2xl font-bold text-pm-text">{symbol}</h2>
                        {name && <span className="text-sm text-pm-muted truncate">{name}</span>}
                    </div>
                </div>
                {last && (
                    <div className="flex items-baseline gap-3 type-data">
                        <span className="text-2xl font-semibold text-pm-text">{fmt(last.close)}</span>
                        <span className={`text-sm font-medium ${directionClass(rangeChange)}`}>
                            {formatPct(rangeChange)} <span className="text-pm-subtle font-normal">{rangeLabel}</span>
                        </span>
                    </div>
                )}
            </div>

            <ChartControls
                range={settings.range}
                onRange={(range) => update({ range })}
                indicators={settings.indicators}
                onIndicators={(indicators) => update({ indicators })}
                compare={compareSymbol}
                onCompare={(compare) => update({ compare })}
                symbol={symbol}
            />

            {/* Fixed height for rail + chart together, so a tall tool rail scrolls instead of stretching the panel */}
            <div className="flex flex-col md:flex-row h-[62vh] min-h-[400px] max-h-[760px]">
                <DrawingToolbar
                    activeTool={activeTool}
                    onTool={onTool}
                    magnet={settings.magnet}
                    onMagnet={() => update({ magnet: !settings.magnet })}
                    drawingsVisible={drawingsVisible}
                    onToggleVisible={onToggleVisible}
                    hasSelection={selection.length > 0}
                    onDeleteSelected={onDeleteSelected}
                    hasDrawings={drawingCount > 0}
                    onClearAll={onClearAll}
                    onScreenshot={onScreenshot}
                />

                {/* Chart area. The chart fills it via autoSize. */}
                <div className="relative flex-1 min-w-0 min-h-0">
                    <div ref={containerRef} className="absolute inset-0" />

                    {/* OHLC readout: top-left, never intercepts the pointer */}
                    {rb && (
                        <div
                            className="absolute top-2 z-10 pointer-events-none flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] type-data bg-pm-charcoal/80 rounded px-1.5 py-0.5"
                            style={{ left: readoutLeft, maxWidth: `calc(100% - ${readoutLeft + 72}px)` }}
                        >
                            {(
                                [
                                    ["O", rb.open],
                                    ["H", rb.high],
                                    ["L", rb.low],
                                    ["C", rb.close],
                                ] as const
                            ).map(([k, v]) => (
                                <span key={k}>
                                    <span className="text-pm-subtle">{k}</span> <span className={barColor}>{fmt(v)}</span>
                                </span>
                            ))}
                            <span className={directionClass(barChange)}>{formatPct(barChange)}</span>
                            <span>
                                <span className="text-pm-subtle">Vol</span> <span className="text-pm-muted">{formatVolume(rb.volume)}</span>
                            </span>
                        </div>
                    )}

                    {/* Loading: first load or a new symbol/timeframe (live refreshes are silent) */}
                    {showLoading && (
                        <div className="absolute inset-0 z-20 grid place-items-center bg-pm-charcoal/60">
                            <span className="inline-flex items-center gap-2 text-sm text-pm-muted">
                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Loading {symbol}…
                            </span>
                        </div>
                    )}

                    {/* Error with retry */}
                    {error && !loading && (
                        <div className="absolute inset-0 z-20 grid place-items-center bg-pm-charcoal/90 p-6 text-center">
                            <div>
                                <p className="text-pm-text font-medium">{error}</p>
                                <p className="mt-1 text-sm text-pm-muted">Check the ticker, or try another timeframe.</p>
                                <button type="button" onClick={reload} className="btn-secondary mt-4 text-sm py-2">
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Inline editor for text drawings, opened by the manager's textEdit event */}
                    {textEdit && (
                        <form
                            className="absolute z-30"
                            style={{ left: Math.max(4, textEdit.x), top: Math.max(4, textEdit.y) }}
                            onSubmit={(e) => {
                                e.preventDefault();
                                commitText();
                            }}
                        >
                            <input
                                autoFocus
                                value={textEdit.value}
                                onChange={(e) => setTextEdit({ ...textEdit, value: e.target.value })}
                                // Ignore a blur right after opening (the tail of the placing click).
                                onBlur={(e) => {
                                    if (Date.now() - textEdit.openedAt < 250) e.currentTarget.focus();
                                    else commitText();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                        e.stopPropagation();
                                        setTextEdit(null);
                                    }
                                }}
                                placeholder="Label"
                                aria-label="Drawing text"
                                className="w-56 bg-pm-dark border border-pm-gold rounded px-2 py-1 text-sm text-pm-text focus:outline-none"
                            />
                        </form>
                    )}
                </div>
            </div>

            {/* Footer: status + the attribution the chart library's license asks for */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 border-t border-pm-border text-[11px] text-pm-subtle">
                <span>
                    {compareError && compareSymbol ? `Couldn't load ${compareSymbol} to compare. ` : ""}
                    Drawings save in this browser, per symbol.
                    {data?.intraday ? " Times are New York." : ""} Data: Yahoo Finance, may be delayed.
                </span>
                <a
                    href="https://www.tradingview.com/lightweight-charts/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pm-muted"
                >
                    Charting by TradingView Lightweight Charts™
                </a>
            </div>
        </section>
    );
}
