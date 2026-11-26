/**
 * The symbol universe for the Charts search box.
 *
 * Suggestions = every ticker on the 9 research watchlists (named from
 * stockDatabase.ts) + the major index ETFs + large-cap crypto pairs.
 * The search also accepts any other valid ticker typed by hand; Yahoo
 * decides whether it exists, so the list is a convenience, not a gate.
 */

import { defaultWatchlists } from "@/lib/watchlists";
import { stockDatabase } from "@/data/stockDatabase";
import type { SymbolInfo } from "./types";

/** Broad-market ETFs people chart most. Yahoo symbols, no carets so they work in URLs. */
const INDEX_ETFS: SymbolInfo[] = [
    { symbol: "SPY", name: "SPDR S&P 500 ETF", group: "Index ETF" },
    { symbol: "QQQ", name: "Invesco QQQ (Nasdaq-100)", group: "Index ETF" },
    { symbol: "DIA", name: "SPDR Dow Jones Industrial Average ETF", group: "Index ETF" },
    { symbol: "IWM", name: "iShares Russell 2000 ETF", group: "Index ETF" },
    { symbol: "VTI", name: "Vanguard Total Stock Market ETF", group: "Index ETF" },
    { symbol: "SMH", name: "VanEck Semiconductor ETF", group: "Index ETF" },
    { symbol: "XLK", name: "Technology Select Sector SPDR", group: "Index ETF" },
    { symbol: "XLE", name: "Energy Select Sector SPDR", group: "Index ETF" },
    { symbol: "XLF", name: "Financial Select Sector SPDR", group: "Index ETF" },
    { symbol: "GLD", name: "SPDR Gold Shares", group: "Index ETF" },
    { symbol: "SLV", name: "iShares Silver Trust", group: "Index ETF" },
    { symbol: "TLT", name: "iShares 20+ Year Treasury Bond ETF", group: "Index ETF" },
    { symbol: "IBIT", name: "iShares Bitcoin Trust", group: "Index ETF" },
];

/** Large-cap crypto, as Yahoo's USD pairs. */
const CRYPTO: SymbolInfo[] = [
    { symbol: "BTC-USD", name: "Bitcoin", group: "Crypto" },
    { symbol: "ETH-USD", name: "Ethereum", group: "Crypto" },
    { symbol: "SOL-USD", name: "Solana", group: "Crypto" },
    { symbol: "XRP-USD", name: "XRP", group: "Crypto" },
    { symbol: "BNB-USD", name: "BNB", group: "Crypto" },
    { symbol: "DOGE-USD", name: "Dogecoin", group: "Crypto" },
    { symbol: "ADA-USD", name: "Cardano", group: "Crypto" },
    { symbol: "AVAX-USD", name: "Avalanche", group: "Crypto" },
    { symbol: "LINK-USD", name: "Chainlink", group: "Crypto" },
];

/**
 * Build the list once at module load. A ticker that sits on several
 * watchlists (TSLA is on three) is listed once, under the first watchlist.
 * BTC-USD is skipped in the watchlist pass so it is grouped as "Crypto".
 */
function buildUniverse(): SymbolInfo[] {
    const seen = new Set<string>();
    const out: SymbolInfo[] = [];
    const push = (info: SymbolInfo) => {
        if (seen.has(info.symbol)) return;
        seen.add(info.symbol);
        out.push(info);
    };

    for (const w of defaultWatchlists) {
        for (const p of w.positions) {
            if (p.ticker === "BTC-USD") continue; // listed under Crypto below
            push({
                symbol: p.ticker,
                name: stockDatabase[p.ticker]?.name ?? p.ticker,
                group: w.name,
            });
        }
    }
    INDEX_ETFS.forEach(push);
    CRYPTO.forEach(push);
    return out;
}

export const SYMBOL_UNIVERSE: SymbolInfo[] = buildUniverse();

const BY_SYMBOL = new Map(SYMBOL_UNIVERSE.map((s) => [s.symbol, s]));

/** Look up a known symbol (case-insensitive). */
export function getSymbolInfo(symbol: string): SymbolInfo | undefined {
    return BY_SYMBOL.get(symbol.toUpperCase());
}

/**
 * Accepted ticker shape: letters, digits, dot, dash, equals, 1–15 chars
 * (covers BRK-B, BTC-USD, FANUY, RDS.A, futures like GC=F).
 * The same check runs server-side before anything is sent to Yahoo.
 */
const SYMBOL_RE = /^[A-Z0-9][A-Z0-9.\-=]{0,14}$/;

/** Uppercase + trim + validate. Returns null for anything that isn't ticker-shaped. */
export function normalizeSymbol(raw: string | null | undefined): string | null {
    if (!raw) return null;
    let decoded = raw;
    try {
        decoded = decodeURIComponent(raw); // "/charts/BRK%2DB" → "BRK-B"
    } catch {
        return null; // malformed % escape
    }
    const s = decoded.trim().toUpperCase();
    return SYMBOL_RE.test(s) ? s : null;
}

/**
 * Rank suggestions for a query:
 *   1. exact ticker match
 *   2. ticker starts with the query
 *   3. name starts with the query
 *   4. ticker or name contains the query
 * An empty query returns the list in its natural order (watchlists first).
 */
export function searchSymbols(query: string, limit = 12): SymbolInfo[] {
    const q = query.trim().toUpperCase();
    if (!q) return SYMBOL_UNIVERSE.slice(0, limit);

    const scored: Array<{ info: SymbolInfo; score: number }> = [];
    for (const info of SYMBOL_UNIVERSE) {
        const sym = info.symbol;
        const name = info.name.toUpperCase();
        let score = -1;
        if (sym === q) score = 0;
        else if (sym.startsWith(q)) score = 1;
        else if (name.startsWith(q)) score = 2;
        else if (sym.includes(q) || name.includes(q)) score = 3;
        if (score >= 0) scored.push({ info, score });
    }
    scored.sort((a, b) => a.score - b.score || a.info.symbol.localeCompare(b.info.symbol));
    return scored.slice(0, limit).map((s) => s.info);
}

/** Crypto trades 24/7, so the chart keeps refreshing outside NYSE hours. */
export function isCryptoSymbol(symbol: string): boolean {
    return /-USD$/.test(symbol);
}
