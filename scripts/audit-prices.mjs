#!/usr/bin/env node
/**
 * Price audit: checks src/data/baselines.ts against Yahoo Finance.
 *
 *   npm run audit:prices
 *
 * For every ticker it compares the stored Dec 31 baseline and the stored
 * quarter-end closes with Yahoo's split-adjusted daily closes, and lists any
 * stock splits since the baseline date. A split makes a static baseline wrong
 * (current prices are post-split), so the stored value must be divided by the
 * split ratio. Exits with code 1 when something needs attention.
 *
 * Run it after any split news, at each quarter end, and at the year rollover.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "src/data/baselines.ts"), "utf8");

const baselineDate = src.match(/BASELINE_DATE = '(\d{4}-\d{2}-\d{2})'/)[1];
const baselines = Object.fromEntries(
    [...src.matchAll(/'([A-Z.\-]+)': \{ ticker: '[A-Z.\-]+', price: ([0-9.]+)/g)].map((m) => [m[1], Number(m[2])])
);

// quarterEndCloses block: '2026-03-31': { 'AAPL': 253.79, ... }
const quarterCloses = {};
const qBlock = src.slice(src.indexOf("export const quarterEndCloses"));
for (const m of qBlock.matchAll(/'(\d{4}-\d{2}-\d{2})': \{([^}]*)\}/g)) {
    quarterCloses[m[1]] = Object.fromEntries(
        [...m[2].matchAll(/'([A-Z.\-]+)': ([0-9.]+)/g)].map((x) => [x[1], Number(x[2])])
    );
}

const TOLERANCE_PCT = 0.05;
const day = (ts) => new Date(ts * 1000).toISOString().slice(0, 10);

async function chart(ticker, period1) {
    const url =
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}` +
        `?period1=${period1}&period2=${Math.floor(Date.now() / 1000)}&interval=1d&events=split`;
    for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (res.ok) return (await res.json()).chart.result[0];
        await new Promise((r) => setTimeout(r, 1500));
    }
    throw new Error(`Yahoo request failed for ${ticker}`);
}

const start = Math.floor(new Date(`${baselineDate}T00:00:00Z`).getTime() / 1000) - 5 * 86400;
let problems = 0;

for (const [ticker, stored] of Object.entries(baselines)) {
    const result = await chart(ticker, start);
    const closes = result.indicators.quote[0].close;
    const byDate = {};
    result.timestamp.forEach((ts, i) => {
        if (closes[i] != null) byDate[day(ts)] = closes[i];
    });
    const lastOnOrBefore = (date) => {
        const dates = Object.keys(byDate).filter((d) => d <= date).sort();
        return dates.length ? byDate[dates[dates.length - 1]] : undefined;
    };

    const notes = [];
    const actual = byDate[baselineDate];
    if (actual === undefined) {
        notes.push(`no ${baselineDate} bar from Yahoo`);
    } else if (Math.abs((stored / actual - 1) * 100) > TOLERANCE_PCT) {
        notes.push(`baseline ${stored} vs Yahoo ${actual.toFixed(2)}`);
    }

    for (const [date, values] of Object.entries(quarterCloses)) {
        if (!(ticker in values)) continue;
        const q = lastOnOrBefore(date);
        if (q !== undefined && Math.abs((values[ticker] / q - 1) * 100) > TOLERANCE_PCT) {
            notes.push(`${date} close ${values[ticker]} vs Yahoo ${q.toFixed(2)}`);
        }
    }

    const splits = Object.values(result.events?.splits ?? {})
        .filter((s) => day(s.date) > baselineDate)
        .map((s) => `${s.numerator}:${s.denominator} split on ${day(s.date)}`);
    // A split is fine once the stored values are split-adjusted (they then match Yahoo).
    if (splits.length && notes.length) notes.push(...splits);

    if (notes.length) {
        problems++;
        console.log(`✗ ${ticker.padEnd(8)} ${notes.join("; ")}`);
    } else {
        console.log(`✓ ${ticker.padEnd(8)} ok${splits.length ? ` (${splits.join(", ")}, already adjusted)` : ""}`);
    }
}

console.log(problems ? `\n${problems} ticker(s) need attention.` : "\nAll baselines match Yahoo Finance.");
process.exit(problems ? 1 : 0);
