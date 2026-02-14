"use client";

import { useState, useEffect } from "react";

interface Ticker {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePct: number;
}

function formatPrice(price: number): string {
    if (price >= 10000) return price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    if (price >= 1) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return price.toFixed(4);
}

function TickerItem({ t }: { t: Ticker }) {
    const up = t.change >= 0;
    return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap mx-4">
            <span className="text-pm-text font-semibold">{t.name}</span>
            <span className="text-pm-muted">{formatPrice(t.price)}</span>
            <span className={`font-semibold ${up ? "text-pm-green" : "text-pm-red"}`}>
                {up ? "▲" : "▼"} {Math.abs(t.changePct).toFixed(2)}%
            </span>
        </span>
    );
}

export function TickerTape() {
    const [tickers, setTickers] = useState<Ticker[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/ticker-tape");
                if (!res.ok) return;
                const json = await res.json();
                if (json.tickers?.length) setTickers(json.tickers);
            } catch {}
        };
        load();
        const interval = setInterval(load, 60_000);
        return () => clearInterval(interval);
    }, []);

    if (!tickers.length) return null;

    const content = tickers.map((t, i) => <TickerItem key={i} t={t} />);

    return (
        <div className="w-full overflow-hidden bg-pm-black border-y border-pm-border/40 py-2 group">
            <div className="flex animate-ticker group-hover:[animation-play-state:paused]">
                <div className="flex shrink-0 items-center text-xs font-mono">
                    {content}
                </div>
                <div className="flex shrink-0 items-center text-xs font-mono" aria-hidden>
                    {content}
                </div>
            </div>
        </div>
    );
}
