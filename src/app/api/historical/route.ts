import { NextRequest, NextResponse } from "next/server";

// Yahoo Finance chart API — returns historical OHLC data
// Symbols: SPY (S&P 500), QQQ (Nasdaq), DIA (Dow), IWM (Russell 2000), GLD (Gold), BTC-USD (Bitcoin)

interface YahooChartResult {
    timestamp: number[];
    indicators: {
        quote: Array<{
            close: (number | null)[];
        }>;
    };
}

const RANGE_MAP: Record<string, { range: string; interval: string }> = {
    "1d": { range: "1d", interval: "5m" },
    "5d": { range: "5d", interval: "30m" },
    "1mo": { range: "1mo", interval: "1d" },
    "ytd": { range: "ytd", interval: "1d" },
    "1y": { range: "1y", interval: "1d" },
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const symbols = searchParams.get("symbols")?.split(",") || [];
    const range = searchParams.get("range") || "1d";

    if (symbols.length === 0) {
        return NextResponse.json({ error: "No symbols provided" }, { status: 400 });
    }

    const config = RANGE_MAP[range];
    if (!config) {
        return NextResponse.json({ error: "Invalid range" }, { status: 400 });
    }

    try {
        const results: Record<string, Array<{ time: string; value: number }>> = {};

        await Promise.all(
            symbols.map(async (symbol) => {
                try {
                    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${config.range}&interval=${config.interval}&includePrePost=false`;
                    const res = await fetch(url, {
                        headers: { "User-Agent": "Mozilla/5.0" },
                        next: { revalidate: range === "1d" ? 60 : 300 },
                    });

                    if (!res.ok) return;

                    const data = await res.json();
                    const chart: YahooChartResult = data.chart?.result?.[0];
                    if (!chart?.timestamp || !chart?.indicators?.quote?.[0]?.close) return;

                    const timestamps = chart.timestamp;
                    const closes = chart.indicators.quote[0].close;

                    // Find first valid close price as baseline for % calculation
                    let baseline = 0;
                    for (const c of closes) {
                        if (c !== null && c > 0) {
                            baseline = c;
                            break;
                        }
                    }

                    if (baseline === 0) return;

                    const points: Array<{ time: string; value: number }> = [];
                    for (let i = 0; i < timestamps.length; i++) {
                        const close = closes[i];
                        if (close === null || close === undefined) continue;

                        const pctChange = ((close - baseline) / baseline) * 100;
                        const date = new Date(timestamps[i] * 1000);

                        let timeLabel: string;
                        if (range === "1d") {
                            timeLabel = date.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                                timeZone: "America/New_York",
                            });
                        } else if (range === "5d") {
                            timeLabel = date.toLocaleDateString("en-US", {
                                weekday: "short",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                                timeZone: "America/New_York",
                            });
                        } else {
                            timeLabel = date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                timeZone: "America/New_York",
                            });
                        }

                        points.push({ time: timeLabel, value: Math.round(pctChange * 100) / 100 });
                    }

                    results[symbol] = points;
                } catch {
                    // Skip failed symbols
                }
            })
        );

        return NextResponse.json({ data: results, range });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
