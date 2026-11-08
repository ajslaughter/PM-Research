"use client";

import { useState, useEffect } from "react";
import { getNextMarketOpen } from "@/lib/marketHours";

function pad(n: number): string {
    return n.toString().padStart(2, "0");
}

export function MarketCountdown() {
    const [diff, setDiff] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        function tick() {
            const target = getNextMarketOpen();
            if (!target) {
                setIsOpen(true);
                setDiff(null);
                return;
            }
            setIsOpen(false);
            const ms = target.getTime() - Date.now();
            if (ms <= 0) {
                setDiff({ d: 0, h: 0, m: 0, s: 0 });
                return;
            }
            const totalSec = Math.floor(ms / 1000);
            const d = Math.floor(totalSec / 86400);
            const h = Math.floor((totalSec % 86400) / 3600);
            const m = Math.floor((totalSec % 3600) / 60);
            const s = totalSec % 60;
            setDiff({ d, h, m, s });
        }
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    if (isOpen || !diff) return null;

    // Build compact countdown string like "14h 23m 07s" or "2d 14h 23m 07s"
    const parts: string[] = [];
    if (diff.d > 0) parts.push(`${diff.d}d`);
    parts.push(`${pad(diff.h)}h`);
    parts.push(`${pad(diff.m)}m`);
    parts.push(`${pad(diff.s)}s`);

    return (
        <span className="type-data">
            Opens in {parts.join(" ")}
        </span>
    );
}
