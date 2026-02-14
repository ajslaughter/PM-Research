"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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

// Speed in pixels per second
const SPEED = 150;

export function TickerTape() {
    const [tickers, setTickers] = useState<Ticker[]>([]);
    const [gainers, setGainers] = useState<Ticker[]>([]);
    const [losers, setLosers] = useState<Ticker[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const firstRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>(0);
    const posRef = useRef(0);
    const pausedRef = useRef(false);
    const widthRef = useRef(0);

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

    const animate = useCallback((prevTime: number) => {
        rafRef.current = requestAnimationFrame((now) => {
            if (!pausedRef.current && containerRef.current) {
                const dt = (now - prevTime) / 1000;
                posRef.current -= SPEED * dt;
                if (widthRef.current > 0 && posRef.current <= -widthRef.current) {
                    posRef.current += widthRef.current;
                }
                containerRef.current.style.transform = `translateX(${posRef.current}px)`;
            }
            animate(now);
        });
    }, []);

    useEffect(() => {
        if (!tickers.length) return;
        // Measure after render
        const t = setTimeout(() => {
            if (firstRef.current) {
                widthRef.current = firstRef.current.offsetWidth;
            }
            animate(performance.now());
        }, 100);
        return () => {
            clearTimeout(t);
            cancelAnimationFrame(rafRef.current);
        };
    }, [tickers, gainers, losers, animate]);

    if (!tickers.length) return null;

    const content = tickers.map((t, i) => <TickerItem key={i} t={t} />);

    const separator = (label: string) => (
        <span key={label} className="inline-flex items-center mx-4 whitespace-nowrap">
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

    return (
        <div
            className="w-full overflow-hidden bg-pm-black border-y border-pm-border/40 py-2"
            onMouseEnter={() => { pausedRef.current = true; }}
            onMouseLeave={() => { pausedRef.current = false; }}
        >
            <div ref={containerRef} className="flex will-change-transform">
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
