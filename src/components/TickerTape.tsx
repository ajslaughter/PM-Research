"use client";

import { useState, useEffect, useRef } from "react";

interface Ticker {
    symbol: string;
    name: string;
    tag: string;
    price: number;
    change: number;
    changePct: number;
    badge?: string;
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
    const [gainers, setGainers] = useState<Ticker[]>([]);
    const [losers, setLosers] = useState<Ticker[]>([]);
    const firstRef = useRef<HTMLDivElement>(null);
    const [scrollWidth, setScrollWidth] = useState(0);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/ticker-tape");
                if (!res.ok) return;
                const json = await res.json();
                if (json.tickers?.length) setTickers(json.tickers);
                if (json.gainers?.length) setGainers(json.gainers);
                if (json.losers?.length) setLosers(json.losers);
            } catch {}
        };
        load();
        const interval = setInterval(load, 60_000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (firstRef.current) {
            setScrollWidth(firstRef.current.scrollWidth);
        }
    }, [tickers, gainers, losers]);

    if (!tickers.length) return null;

    const content = tickers.map((t, i) => <TickerItem key={i} t={t} />);

    const separator = (label: string) => (
        <span className="inline-flex items-center mx-4 whitespace-nowrap">
            <span className="text-pm-border mx-2">│</span>
            <span className="text-[10px] font-mono text-pm-muted uppercase tracking-widest">{label}</span>
            <span className="text-pm-border mx-2">│</span>
        </span>
    );

    const movers = [
        ...gainers.length ? [separator("TOP GAINERS"), ...gainers.map((t, i) => <TickerItem key={`g${i}`} t={t} />)] : [],
        ...losers.length ? [separator("TOP LOSERS"), ...losers.map((t, i) => <TickerItem key={`l${i}`} t={t} />)] : [],
    ];

    const all = [...content, ...movers];

    // Duration scales with content width — ~300px per second (fast)
    const duration = scrollWidth > 0 ? Math.max(10, scrollWidth / 300) : 30;

    return (
        <div className="w-full overflow-hidden bg-pm-black border-y border-pm-border/40 py-2 group">
            <div
                className="flex group-hover:[animation-play-state:paused]"
                style={{
                    animation: `ticker ${duration}s linear infinite`,
                }}
            >
                <div ref={firstRef} className="flex shrink-0 items-center text-xs font-mono">
                    {all}
                </div>
                <div className="flex shrink-0 items-center text-xs font-mono" aria-hidden>
                    {all}
                </div>
            </div>
        </div>
    );
}
