"use client";

import {
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
    ReferenceLine,
} from "recharts";

interface FlowTrade {
    strike: number;
    expiry: string;
    type: "call" | "put";
    premium: number;
    trade_type: string;
}

interface KeyLevels {
    max_pain: number;
    highest_oi_call: number;
    highest_oi_put: number;
}

export function FlowBubbleChart({ trades, keyLevels }: { trades: FlowTrade[]; keyLevels?: KeyLevels }) {
    if (!trades.length) return null;

    const maxPremium = Math.max(...trades.map((t) => t.premium));

    const chartData = trades.map((t) => ({
        x: t.strike,
        y: t.premium / 1000,
        type: t.type,
        expiry: t.expiry,
        trade: t.trade_type,
        size: Math.max(6, Math.min(24, (t.premium / maxPremium) * 24)),
    }));

    return (
        <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
                    <XAxis
                        type="number"
                        dataKey="x"
                        name="Strike"
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: "#374151" }}
                        tickFormatter={(v: number) => `$${v}`}
                        label={{ value: "Strike Price", position: "bottom", fill: "#6b7280", fontSize: 11, offset: 15 }}
                    />
                    <YAxis
                        type="number"
                        dataKey="y"
                        name="Premium"
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => `$${v}K`}
                    />
                    {keyLevels?.max_pain ? (
                        <ReferenceLine
                            x={keyLevels.max_pain}
                            stroke="#9d4edd"
                            strokeDasharray="4 4"
                            label={{ value: "Max Pain", fill: "#9d4edd", fontSize: 10, position: "top" }}
                        />
                    ) : null}
                    <Tooltip
                        cursor={{ stroke: "#374151", strokeDasharray: "3 3" }}
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload;
                            return (
                                <div className="bg-pm-charcoal border border-pm-border rounded-lg px-3 py-2 shadow-xl">
                                    <div className="text-xs font-mono space-y-1">
                                        <div className="font-semibold text-pm-text">
                                            ${d.x} <span className={d.type === "call" ? "text-pm-green" : "text-pm-red"}>{d.type.toUpperCase()}</span>
                                        </div>
                                        <div className="text-pm-muted">Premium: ${d.y.toFixed(0)}K</div>
                                        <div className="text-pm-muted">Expiry: {d.expiry}</div>
                                        <div className="text-pm-subtle uppercase text-[10px]">{d.trade}</div>
                                    </div>
                                </div>
                            );
                        }}
                    />
                    <Scatter data={chartData}>
                        {chartData.map((entry, i) => (
                            <Cell
                                key={i}
                                fill={entry.type === "call" ? "#00ff9d" : "#ff4757"}
                                fillOpacity={0.6}
                                stroke={entry.type === "call" ? "#00ff9d" : "#ff4757"}
                                strokeOpacity={0.9}
                                strokeWidth={1}
                            />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
