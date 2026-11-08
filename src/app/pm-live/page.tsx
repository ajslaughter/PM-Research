"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Activity,
    Loader2,
    MessageCircle,
    Check,
    AlertCircle,
    Newspaper,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ReferenceLine,
} from "recharts";
import { AgentTabs } from "@/components/agents/AgentTabs";
import { TickerTape } from "@/components/TickerTape";
import { MarketCountdown } from "@/components/MarketCountdown";
import { getSessionNote, isMarketOpen } from "@/lib/marketHours";
import { formatPct } from "@/lib/format";

// Market indices/assets to chart
// Line colors avoid the up/down greens and reds so a line's color never reads as a gain or loss
const CHART_SYMBOLS = [
    { symbol: "SPY", label: "S&P 500", color: "#ECEFF3" },
    { symbol: "QQQ", label: "Nasdaq", color: "#7AA2F7" },
    { symbol: "DIA", label: "Dow Jones", color: "#B39DDB" },
    { symbol: "IWM", label: "Russell 2000", color: "#4FC1C6" },
    { symbol: "GLD", label: "Gold", color: "#E9B949" },
    { symbol: "BTC-USD", label: "Bitcoin", color: "#F7931A" },
];

const TIMEFRAMES = [
    { key: "1d", label: "1D" },
    { key: "5d", label: "5D" },
    { key: "1mo", label: "1M" },
    { key: "ytd", label: "YTD" },
    { key: "1y", label: "1Y" },
    { key: "5y", label: "5Y" },
] as const;

type TimeframeKey = (typeof TIMEFRAMES)[number]["key"];

interface ChartPoint {
    time: string;
    [symbol: string]: number | string;
}

interface MapStock {
    ticker: string;
    name: string;
    industry: string;
    weight: number;
    change: number;
    price: number;
}

interface MapData {
    sectors: Record<string, MapStock[]>;
    sectorMeta: Record<string, { totalWeight: number; weightedChange: number; color: string }>;
    label: string;
}

const MAP_FILTERS = [
    { key: "sp500", label: "S&P 500" },
    { key: "dow30", label: "Dow 30" },
    { key: "nasdaq100", label: "Nasdaq 100" },
    { key: "etf", label: "ETFs" },
    { key: "crypto", label: "Crypto" },
    { key: "futures", label: "Futures" },
    { key: "world", label: "World" },
    { key: "themes", label: "Themes" },
] as const;

type MapFilterKey = (typeof MAP_FILTERS)[number]["key"];

interface FeedEntry {
    type: string;
    message: string;
    timestamp: string;
    chart: string | null;
}

const FEED_TYPE_LABELS: Record<string, { label: string; color: string }> = {
    "open": { label: "OPEN", color: "text-pm-green" },
    "close": { label: "CLOSE", color: "text-pm-red" },
    "update": { label: "HOURLY", color: "text-pm-muted" },
    "analyst_morning": { label: "ANALYST", color: "text-pm-purple" },
    "analyst_earnings": { label: "EARNINGS", color: "text-yellow-400" },
    "analyst_scorecard": { label: "SCORECARD", color: "text-pm-purple" },
    "analyst_weekly": { label: "WEEKLY", color: "text-pm-purple" },
};

function getHeatColor(change: number): string {
    const abs = Math.min(Math.abs(change), 4);
    const intensity = abs / 4;
    if (change >= 0) {
        const r = Math.round(10 * (1 - intensity));
        const g = Math.round(50 + intensity * 180);
        const b = Math.round(20 + intensity * 30);
        return `rgb(${r}, ${g}, ${b})`;
    } else {
        const r = Math.round(50 + intensity * 190);
        const g = Math.round(10 * (1 - intensity));
        const b = Math.round(15 + intensity * 15);
        return `rgb(${r}, ${g}, ${b})`;
    }
}

// Custom tooltip for the chart
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-pm-black/95 border border-pm-border rounded-md px-3 py-2.5 shadow-xl">
            <p className="text-xs text-pm-muted mb-1.5">{label}</p>
            {payload.map((entry: any) => {
                const sym = CHART_SYMBOLS.find((s) => s.symbol === entry.dataKey);
                const val = entry.value as number;
                return (
                    <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-pm-muted">{sym?.label || entry.dataKey}</span>
                        <span
                            className={`type-data ml-auto pl-3 ${val > 0 ? "text-pm-up" : val < 0 ? "text-pm-down" : "text-pm-muted"}`}
                        >
                            {formatPct(val)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// Intraday bucket size (seconds) for each timeframe; daily+ ranges bucket by date.
const INTRADAY_BUCKET: Partial<Record<TimeframeKey, number>> = { "1d": 300, "5d": 1800 };

/**
 * Merge per-symbol series into chart rows keyed by time, so every line is plotted
 * against the moment it was recorded. (Rows used to be matched by array index,
 * which put Friday's stock session on the same x position as Sunday's bitcoin.)
 */
function mergeSeriesByTime(
    data: Record<string, Array<{ t: number; value: number }>>,
    range: TimeframeKey
): ChartPoint[] {
    const bucket = INTRADAY_BUCKET[range];
    const keyOf = (t: number) =>
        bucket ? String(Math.floor(t / bucket) * bucket) : new Date(t * 1000).toISOString().slice(0, 10);

    const rows = new Map<string, { t: number; values: Record<string, number> }>();
    for (const sym of CHART_SYMBOLS) {
        for (const point of data[sym.symbol] ?? []) {
            const key = keyOf(point.t);
            const row = rows.get(key) ?? { t: point.t, values: {} };
            row.t = Math.min(row.t, point.t);
            row.values[sym.symbol] = point.value;
            rows.set(key, row);
        }
    }

    const sorted = Array.from(rows.values()).sort((a, b) => a.t - b.t);
    if (sorted.length === 0) return [];

    const etDay = (t: number) =>
        new Date(t * 1000).toLocaleDateString("en-US", { timeZone: "America/New_York" });
    const spansDays = etDay(sorted[0].t) !== etDay(sorted[sorted.length - 1].t);

    const label = (t: number): string => {
        const date = new Date(t * 1000);
        const tz = "America/New_York";
        if (range === "1d") {
            return date.toLocaleString("en-US", {
                ...(spansDays ? { weekday: "short" as const } : {}),
                hour: "numeric",
                minute: "2-digit",
                timeZone: tz,
            });
        }
        if (range === "5d") {
            return date.toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit", timeZone: tz });
        }
        if (range === "5y") {
            return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
        }
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    };

    return sorted.map((row) => ({ time: label(row.t), ...row.values }));
}

export default function PMLivePage() {
    const [timeframe, setTimeframe] = useState<TimeframeKey>("1d");
    const [chartData, setChartData] = useState<ChartPoint[]>([]);
    const [chartLoading, setChartLoading] = useState(true);
    const [latestValues, setLatestValues] = useState<Record<string, number>>({});
    const [chartUpdated, setChartUpdated] = useState<Date | null>(null);
    const [mapFilter, setMapFilter] = useState<MapFilterKey>("sp500");
    const [mapData, setMapData] = useState<MapData | null>(null);
    const [mapLoading, setMapLoading] = useState(true);
    const [hoveredStock, setHoveredStock] = useState<{ stock: MapStock; sector: string; x: number; y: number } | null>(null);
    const [alertPhone, setAlertPhone] = useState("");
    const [alertStatus, setAlertStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [alertMessage, setAlertMessage] = useState("");
    const [feedEntries, setFeedEntries] = useState<FeedEntry[]>([]);
    const [feedExpanded, setFeedExpanded] = useState(false);
    const [expandedFeedItems, setExpandedFeedItems] = useState<Set<number>>(new Set());

    const handleAlertSignup = async () => {
        if (!alertPhone.trim()) return;
        setAlertStatus("loading");
        try {
            const res = await fetch("/api/alerts/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: alertPhone.trim() }),
            });
            const json = await res.json();
            if (!res.ok) {
                setAlertStatus("error");
                setAlertMessage(json.error || "Failed to subscribe");
            } else {
                setAlertStatus("success");
                setAlertMessage(json.message);
                setAlertPhone("");
            }
        } catch {
            setAlertStatus("error");
            setAlertMessage("Something went wrong");
        }
    };

    // Fetch live feed from bot
    useEffect(() => {
        async function fetchFeed() {
            try {
                const res = await fetch("/api/live-feed");
                if (!res.ok) return;
                const json = await res.json();
                setFeedEntries(json.feed || []);
            } catch {}
        }
        fetchFeed();
        const interval = setInterval(fetchFeed, 60000); // refresh every minute
        return () => clearInterval(interval);
    }, []);

    // Fetch historical data for chart
    const fetchChart = useCallback(async (range: TimeframeKey) => {
        setChartLoading(true);
        try {
            const symbols = CHART_SYMBOLS.map((s) => s.symbol).join(",");
            const res = await fetch(`/api/historical?symbols=${symbols}&range=${range}`);
            if (!res.ok) throw new Error("Failed");
            const json = await res.json();
            const data: Record<string, Array<{ t: number; value: number }>> = json.data;
            const merged = mergeSeriesByTime(data, range);
            setChartData(merged);
            setChartUpdated(new Date());

            const latest: Record<string, number> = {};
            for (const sym of CHART_SYMBOLS) {
                const series = data[sym.symbol];
                if (series && series.length > 0) {
                    latest[sym.symbol] = series[series.length - 1].value;
                }
            }
            setLatestValues(latest);
        } catch {
            setChartData([]);
        } finally {
            setChartLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChart(timeframe);
    }, [timeframe, fetchChart]);

    // Fetch market map data
    useEffect(() => {
        async function fetchMap() {
            setMapLoading(true);
            try {
                const res = await fetch(`/api/market-map?filter=${mapFilter}`);
                if (!res.ok) throw new Error("Failed");
                const json: MapData = await res.json();
                setMapData(json);
            } catch {
                setMapData(null);
            } finally {
                setMapLoading(false);
            }
        }
        fetchMap();
    }, [mapFilter]);

    // Holiday-aware market status, re-checked every minute
    const [marketOpen, setMarketOpen] = useState(() => isMarketOpen());
    const [sessionNote, setSessionNote] = useState<string | null>(() => getSessionNote());
    useEffect(() => {
        const id = setInterval(() => {
            setMarketOpen(isMarketOpen());
            setSessionNote(getSessionNote());
        }, 60_000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="relative overflow-hidden min-h-screen">
            <section className="relative pt-12 sm:pt-14 pb-16">
                <div className="max-w-6xl mx-auto px-5 sm:px-6">
                    <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <h1 className="page-title">PM Live</h1>
                            <p className="page-lede">Major indices, gold and bitcoin, the S&amp;P 500 heat map and market tools.</p>
                        </div>
                        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-pm-muted md:justify-end md:text-right">
                            <span className="inline-flex items-center gap-2 text-pm-text">
                                <span
                                    className={`w-2 h-2 rounded-full ${marketOpen ? "bg-pm-gold animate-pulse-slow" : "bg-pm-subtle"}`}
                                    aria-hidden
                                />
                                {marketOpen ? "Market open" : "Market closed"}
                            </span>
                            {sessionNote && <span>{sessionNote}</span>}
                            {!marketOpen && <MarketCountdown />}
                            {chartUpdated && (
                                <span>
                                    Updated{" "}
                                    {chartUpdated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                </span>
                            )}
                        </p>
                    </header>

                    {/* Ticker Tape */}
                    <TickerTape />

                    {/* Market Performance Chart */}
                    <div className="mt-12">
                        <div className="rounded-lg border border-pm-border bg-pm-charcoal overflow-hidden">
                            <div className="px-6 py-4 border-b border-pm-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="section-title">Market performance</h2>
                                    <p className="text-xs text-pm-subtle mt-0.5">
                                        % change from the close before the period. YTD is measured from Dec 31.
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 bg-pm-black rounded-md p-1 border border-pm-border" role="group" aria-label="Chart period">
                                    {TIMEFRAMES.map((tf) => (
                                        <button
                                            key={tf.key}
                                            onClick={() => setTimeframe(tf.key)}
                                            aria-pressed={timeframe === tf.key}
                                            className={`px-3 py-1.5 text-xs type-data rounded transition-colors ${
                                                timeframe === tf.key
                                                    ? "bg-pm-gold text-pm-black font-semibold"
                                                    : "text-pm-muted hover:text-pm-text"
                                            }`}
                                        >
                                            {tf.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="px-6 pt-4 flex flex-wrap gap-x-5 gap-y-2">
                                {CHART_SYMBOLS.map((sym) => {
                                    const val = latestValues[sym.symbol];
                                    return (
                                        <div key={sym.symbol} className="flex items-center gap-2 text-xs">
                                            <span
                                                className="w-3 h-0.5 rounded-full"
                                                style={{ backgroundColor: sym.color }}
                                                aria-hidden
                                            />
                                            <span className="text-pm-muted">{sym.label}</span>
                                            {val !== undefined && (
                                                <span
                                                    className={`type-data font-semibold ${val > 0 ? "text-pm-up" : val < 0 ? "text-pm-down" : "text-pm-muted"}`}
                                                >
                                                    {formatPct(val)}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="px-2 sm:px-4 py-4 h-[280px] sm:h-[350px] md:h-[400px]">
                                {chartLoading ? (
                                    <div className="flex items-center justify-center h-full gap-3 text-pm-muted">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="text-sm">Loading chart…</span>
                                    </div>
                                ) : chartData.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-pm-muted text-sm">
                                        Chart data isn&apos;t available right now. Try another period or check back shortly.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <XAxis
                                                dataKey="time"
                                                tick={{ fill: "#6C7581", fontSize: 11 }}
                                                tickLine={false}
                                                axisLine={{ stroke: "#262D36" }}
                                                interval="preserveStartEnd"
                                                minTickGap={50}
                                            />
                                            <YAxis
                                                tick={{ fill: "#6C7581", fontSize: 11 }}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(v: number) =>
                                                    `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`
                                                }
                                                width={55}
                                            />
                                            <ReferenceLine y={0} stroke="#3A424D" strokeDasharray="3 3" />
                                            <Tooltip content={<ChartTooltip />} />
                                            {CHART_SYMBOLS.map((sym) => (
                                                <Line
                                                    key={sym.symbol}
                                                    type="monotone"
                                                    dataKey={sym.symbol}
                                                    stroke={sym.color}
                                                    strokeWidth={1.75}
                                                    dot={false}
                                                    isAnimationActive={false}
                                                    connectNulls
                                                />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Market Map */}
                    <div className="mt-12">
                        <div className="rounded-lg border border-pm-border bg-pm-charcoal overflow-hidden">
                            {/* Map Header with Filter Bar */}
                            <div className="px-6 py-4 border-b border-pm-border/50">
                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
                                    <h2 className="section-title">{mapData?.label || "Market map"}</h2>
                                    <span className="text-xs text-pm-subtle">
                                        Change vs prior close, sized by index weight
                                    </span>
                                </div>
                                {/* Filter Pills */}
                                <div className="flex flex-wrap gap-1.5">
                                    {MAP_FILTERS.map((f) => (
                                        <button
                                            key={f.key}
                                            onClick={() => setMapFilter(f.key)}
                                            aria-pressed={mapFilter === f.key}
                                            className={`px-3 py-1.5 text-xs rounded transition-colors border ${
                                                mapFilter === f.key
                                                    ? "bg-pm-gold text-pm-black font-semibold border-pm-gold"
                                                    : "text-pm-muted hover:text-pm-text border-pm-border/50 hover:border-pm-border"
                                            }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-3">
                                {mapLoading ? (
                                    <div className="flex items-center justify-center h-64 gap-3 text-pm-muted">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="text-sm">Loading market map…</span>
                                    </div>
                                ) : !mapData ? (
                                    <div className="flex items-center justify-center h-64 text-pm-muted text-sm">
                                        Market data couldn&apos;t load. Pick another view or try again shortly.
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-0.5">
                                        {Object.entries(mapData.sectorMeta)
                                            .sort((a, b) => b[1].totalWeight - a[1].totalWeight)
                                            .map(([sector, meta]) => {
                                                const stocks = mapData.sectors[sector] || [];
                                                const industries: Record<string, MapStock[]> = {};
                                                for (const s of stocks) {
                                                    if (!industries[s.industry]) industries[s.industry] = [];
                                                    industries[s.industry].push(s);
                                                }

                                                return (
                                                    <div
                                                        key={sector}
                                                        className="flex flex-col gap-0.5 border border-pm-border/30 rounded overflow-hidden"
                                                        style={{
                                                            flexGrow: Math.round(meta.totalWeight * 10),
                                                            flexBasis: `${Math.max(120, Math.round(meta.totalWeight * 25))}px`,
                                                        }}
                                                    >
                                                        <div
                                                            className="px-2 py-1 text-[10px] font-bold text-white/90 uppercase tracking-wider"
                                                            style={{ backgroundColor: meta.color + "40" }}
                                                        >
                                                            {sector}
                                                        </div>

                                                        <div className="flex flex-wrap gap-0.5 p-0.5 flex-1">
                                                            {Object.entries(industries).map(([industry, indStocks]) => {
                                                                const indWeight = indStocks.reduce((s, st) => s + st.weight, 0);
                                                                return (
                                                                    <div
                                                                        key={industry}
                                                                        className="flex flex-col gap-0.5"
                                                                        style={{
                                                                            flexGrow: Math.round(indWeight * 10),
                                                                            flexBasis: `${Math.max(45, Math.round(indWeight * 20))}px`,
                                                                        }}
                                                                    >
                                                                        <div className="text-[8px] text-white/50 font-semibold uppercase tracking-wider px-0.5 truncate">
                                                                            {industry}
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-px flex-1">
                                                                            {indStocks
                                                                                .sort((a, b) => b.weight - a.weight)
                                                                                .map((stock) => {
                                                                                    const isHuge = stock.weight >= 3;
                                                                                    const isLarge = stock.weight >= 1.0;
                                                                                    const isMed = stock.weight >= 0.3;
                                                                                    return (
                                                                                        <div
                                                                                            key={stock.ticker}
                                                                                            className="rounded-sm flex flex-col items-center justify-center text-center cursor-default transition-all hover:brightness-130 hover:z-10"
                                                                                            style={{
                                                                                                backgroundColor: getHeatColor(stock.change),
                                                                                                flexGrow: Math.round(stock.weight * 10),
                                                                                                flexBasis: `${Math.max(36, Math.round(stock.weight * 22))}px`,
                                                                                                minHeight: isHuge ? "80px" : isLarge ? "60px" : isMed ? "44px" : "36px",
                                                                                            }}
                                                                                            onMouseEnter={(e) => {
                                                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                                                setHoveredStock({
                                                                                                    stock,
                                                                                                    sector,
                                                                                                    x: rect.left + rect.width / 2,
                                                                                                    y: rect.top,
                                                                                                });
                                                                                            }}
                                                                                            onMouseLeave={() => setHoveredStock(null)}
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                                                setHoveredStock((prev) =>
                                                                                                    prev?.stock.ticker === stock.ticker
                                                                                                        ? null
                                                                                                        : { stock, sector, x: rect.left + rect.width / 2, y: rect.top }
                                                                                                );
                                                                                            }}
                                                                                        >
                                                                                            <span
                                                                                                className={`font-bold text-white drop-shadow-md leading-tight ${
                                                                                                    isHuge ? "text-sm" : isLarge ? "text-xs" : isMed ? "text-[10px]" : "text-[8px]"
                                                                                                }`}
                                                                                            >
                                                                                                {stock.ticker}
                                                                                            </span>
                                                                                            <span
                                                                                                className={`font-mono font-bold text-white drop-shadow-md ${
                                                                                                    isHuge ? "text-xs" : isLarge ? "text-[10px]" : "text-[8px]"
                                                                                                }`}
                                                                                            >
                                                                                                {stock.change >= 0 ? "+" : ""}
                                                                                                {stock.change.toFixed(isMed ? 2 : 1)}%
                                                                                            </span>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Live Market Feed */}
                    {feedEntries.length > 0 && (
                        <div className="mt-12">
                            <div className="rounded-lg border border-pm-border bg-pm-charcoal overflow-hidden">
                                <div className="px-4 sm:px-6 py-4 border-b border-pm-border/50 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <h2 className="section-title">Live feed</h2>
                                        <span className="text-xs text-pm-muted font-mono hidden sm:inline">
                                            Market updates & analyst reports
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setFeedExpanded(!feedExpanded)}
                                        className="text-pm-muted hover:text-pm-text transition-colors"
                                    >
                                        {feedExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="divide-y divide-pm-border/20">
                                    {(feedExpanded ? feedEntries : feedEntries.slice(0, 5)).map((entry, i) => {
                                        const isAnalyst = entry.type.startsWith("analyst_");
                                        const meta = FEED_TYPE_LABELS[entry.type] || { label: entry.type.toUpperCase(), color: "text-pm-muted" };
                                        const time = new Date(entry.timestamp);
                                        const timeStr = time.toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true,
                                            timeZone: "America/New_York",
                                        });
                                        const dateStr = time.toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            timeZone: "America/New_York",
                                        });
                                        const isItemExpanded = expandedFeedItems.has(i);
                                        const isLong = entry.message.length > 200;

                                        return (
                                            <div
                                                key={`${entry.timestamp}-${i}`}
                                                className={`px-3 sm:px-6 py-3 flex gap-2 sm:gap-4 ${isLong ? "cursor-pointer hover:bg-pm-border/5 transition-colors" : ""}`}
                                                onClick={() => {
                                                    if (!isLong) return;
                                                    setExpandedFeedItems((prev) => {
                                                        const next = new Set(prev);
                                                        if (next.has(i)) next.delete(i);
                                                        else next.add(i);
                                                        return next;
                                                    });
                                                }}
                                            >
                                                <div className="flex-shrink-0 w-16 sm:w-20 text-right">
                                                    <div className="text-[10px] sm:text-xs text-pm-muted font-mono">{timeStr}</div>
                                                    <div className="text-[9px] sm:text-[10px] text-pm-subtle font-mono">{dateStr}</div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {isAnalyst ? (
                                                            <Newspaper className="w-3.5 h-3.5 text-pm-purple" />
                                                        ) : (
                                                            <Activity className="w-3.5 h-3.5 text-pm-green" />
                                                        )}
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${meta.color}`}>
                                                            {meta.label}
                                                        </span>
                                                        {isLong && !isItemExpanded && (
                                                            <span className="text-[10px] text-pm-subtle ml-auto">click to expand</span>
                                                        )}
                                                    </div>
                                                    <p className={`text-sm text-pm-text whitespace-pre-wrap leading-relaxed ${isItemExpanded ? "" : "line-clamp-3"}`}>
                                                        {entry.message}
                                                    </p>
                                                    {isLong && isItemExpanded && (
                                                        <span className="text-[10px] text-pm-subtle mt-1 inline-block">click to collapse</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {feedEntries.length > 5 && !feedExpanded && (
                                    <button
                                        onClick={() => setFeedExpanded(true)}
                                        className="w-full px-6 py-3 text-xs text-pm-muted hover:text-pm-text font-mono text-center border-t border-pm-border/20 transition-colors"
                                    >
                                        Show {feedEntries.length - 5} more updates
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* AI Agents */}
                    <div className="mt-12">
                        <AgentTabs />
                    </div>

                    {/* Live Alerts Signup */}
                    <div className="mt-12">
                        <div className="rounded-lg border border-pm-border bg-pm-charcoal overflow-hidden">
                            <div className="px-6 py-6 flex flex-col md:flex-row items-center gap-6">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-md bg-pm-gold/10 border border-pm-gold/20 flex items-center justify-center flex-shrink-0">
                                        <MessageCircle className="w-6 h-6 text-pm-gold" />
                                    </div>
                                    <div>
                                        <h3 className="type-condensed text-xl font-semibold text-pm-text">
                                            Get live market alerts
                                        </h3>
                                        <p className="text-sm text-pm-muted mt-0.5">
                                            Receive real-time market updates via iMessage — open, hourly, and close reports with charts.
                                        </p>
                                        <p className="text-xs text-pm-subtle mt-1">
                                            iPhone only. Sign-ups are approved manually.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                    {alertStatus === "success" ? (
                                        <div className="flex items-center gap-2 text-pm-green text-sm font-mono">
                                            <Check className="w-4 h-4" />
                                            <span>{alertMessage}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex gap-2">
                                                <input
                                                    type="tel"
                                                    placeholder="(555) 123-4567"
                                                    value={alertPhone}
                                                    onChange={(e) => {
                                                        setAlertPhone(e.target.value);
                                                        if (alertStatus === "error") setAlertStatus("idle");
                                                    }}
                                                    onKeyDown={(e) => e.key === "Enter" && handleAlertSignup()}
                                                    className="px-4 py-2.5 bg-pm-black/50 border border-pm-border/50 rounded-lg text-sm text-pm-text font-mono placeholder:text-pm-subtle focus:outline-none focus:border-pm-gold w-full sm:w-48"
                                                />
                                                <button
                                                    onClick={handleAlertSignup}
                                                    disabled={alertStatus === "loading" || !alertPhone.trim()}
                                                    className="btn-primary py-2.5 text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {alertStatus === "loading" ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        "Sign Up"
                                                    )}
                                                </button>
                                            </div>
                                            {alertStatus === "error" && (
                                                <div className="flex items-center gap-1.5 text-pm-red text-xs font-mono">
                                                    <AlertCircle className="w-3 h-3" />
                                                    <span>{alertMessage}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hover/Tap Tooltip */}
                    {hoveredStock && mapData && (() => {
                        const { stock, sector, x, y } = hoveredStock;
                        const industryPeers = (mapData.sectors[sector] || [])
                            .filter((s) => s.industry === stock.industry)
                            .sort((a, b) => b.weight - a.weight);

                        const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
                        const tooltipW = Math.min(340, windowWidth - 16);
                        const left = Math.min(Math.max(x - tooltipW / 2, 8), windowWidth - tooltipW - 8);
                        const top = y - 8;

                        return (
                            <>
                            {/* Tap-to-dismiss overlay (mobile) */}
                            <div
                                className="fixed inset-0 z-40 md:hidden"
                                onClick={() => setHoveredStock(null)}
                            />
                            <div
                                className="fixed z-50 pointer-events-none"
                                style={{
                                    left: `${left}px`,
                                    bottom: `${(typeof window !== "undefined" ? window.innerHeight : 800) - top}px`,
                                }}
                            >
                                <div
                                    className="bg-pm-charcoal border border-pm-border rounded-lg shadow-2xl overflow-hidden"
                                    style={{ width: `${tooltipW}px` }}
                                >
                                    <div className="px-3 py-2 border-b border-pm-border/50 bg-pm-black/50">
                                        <div className="text-[10px] font-bold text-pm-muted uppercase tracking-wider">
                                            {sector} — {stock.industry}
                                        </div>
                                    </div>

                                    <div className="px-3 py-2 border-b border-pm-border/30">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-sm font-bold text-pm-text">{stock.ticker}</span>
                                                <span className="text-[10px] text-pm-muted ml-2">{stock.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-mono text-pm-text">
                                                    {stock.price > 0 ? `$${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                                                </span>
                                                <span className={`text-xs font-mono font-bold ml-2 ${stock.change >= 0 ? "text-pm-green" : "text-pm-red"}`}>
                                                    {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="max-h-[200px] overflow-y-auto">
                                        <table className="w-full text-[11px]">
                                            <tbody>
                                                {industryPeers.map((peer) => (
                                                    <tr
                                                        key={peer.ticker}
                                                        className={`border-b border-pm-border/20 ${peer.ticker === stock.ticker ? "bg-pm-border/10" : ""}`}
                                                    >
                                                        <td className="px-3 py-1 font-mono font-semibold text-pm-text">{peer.ticker}</td>
                                                        <td className="px-2 py-1 font-mono text-pm-text text-right">
                                                            {peer.price > 0 ? peer.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                                                        </td>
                                                        <td className={`px-3 py-1 font-mono font-semibold text-right ${peer.change >= 0 ? "text-pm-green" : "text-pm-red"}`}>
                                                            {peer.change >= 0 ? "+" : ""}{peer.change.toFixed(2)}%
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            </>
                        );
                    })()}

                </div>
            </section>
        </div>
    );
}
