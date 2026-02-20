"use client";

import { useState, useEffect } from "react";

/**
 * Calculates the next NYSE market open in ET.
 * Market hours: Mon–Fri 9:30 AM – 4:00 PM ET.
 * Returns null if the market is currently open.
 */
function getNextMarketOpen(): Date | null {
    const now = new Date();
    const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const day = et.getDay(); // 0=Sun, 6=Sat
    const time = et.getHours() * 60 + et.getMinutes();

    const OPEN = 570;  // 9:30 AM
    const CLOSE = 960;  // 4:00 PM

    // Market is currently open
    if (day >= 1 && day <= 5 && time >= OPEN && time < CLOSE) {
        return null;
    }

    // Build the next open date in ET
    const next = new Date(et);
    next.setSeconds(0, 0);
    next.setHours(9, 30, 0, 0);

    if (day >= 1 && day <= 5 && time < OPEN) {
        // Weekday before open — opens today
    } else if (day === 5 && time >= CLOSE) {
        // Friday after close — opens Monday
        next.setDate(next.getDate() + 3);
    } else if (day === 6) {
        // Saturday — opens Monday
        next.setDate(next.getDate() + 2);
    } else if (day === 0) {
        // Sunday — opens Monday
        next.setDate(next.getDate() + 1);
    } else {
        // Weekday after close — opens next day
        next.setDate(next.getDate() + 1);
    }

    // Convert the ET target back to a UTC-based Date for diff calculation.
    const utcMs = now.getTime();
    const etMs = et.getTime();
    const offsetMs = etMs - utcMs;
    return new Date(next.getTime() - offsetMs);
}

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
        <span className="text-sm font-mono text-pm-green tabular-nums">
            Opens in {parts.join(" ")}
        </span>
    );
}
