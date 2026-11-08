/**
 * Yahoo Finance helpers for fresh quotes.
 *
 * Quotes are fetched with `cache: "no-store"`: Next's data cache serves the
 * *stale* copy to the first visitor after its revalidate window, which on a
 * quiet site meant heat maps and ticker tapes could show hours-old moves.
 * The batch quote endpoint keeps that affordable (one request per 100 symbols).
 */

const YAHOO_UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const CRUMB_TTL_MS = 60 * 60 * 1000;
const CHART = "https://query1.finance.yahoo.com/v8/finance/chart";

let crumbCache: { crumb: string; cookie: string; timestamp: number } | null = null;

export interface Quote {
    price: number;
    previousClose: number;
    change: number;
    changePercent: number;
}

/**
 * Crumb + cookie for Yahoo's v7/v10 endpoints (required since 2023). Cached for an hour.
 */
export async function getYahooCrumb(): Promise<{ crumb: string; cookie: string } | null> {
    if (crumbCache && Date.now() - crumbCache.timestamp < CRUMB_TTL_MS) {
        return { crumb: crumbCache.crumb, cookie: crumbCache.cookie };
    }

    try {
        const cookies: string[] = [];
        const collect = (res: Response) =>
            res.headers.forEach((value, key) => {
                if (key.toLowerCase() === "set-cookie") cookies.push(value.split(";")[0]);
            });

        collect(await fetch("https://fc.yahoo.com/", { headers: { "User-Agent": YAHOO_UA }, redirect: "manual", cache: "no-store" }));
        if (cookies.length === 0) {
            collect(await fetch("https://finance.yahoo.com/", { headers: { "User-Agent": YAHOO_UA }, redirect: "manual", cache: "no-store" }));
        }
        const cookie = cookies.join("; ");
        if (!cookie) return null;

        const res = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
            headers: { "User-Agent": YAHOO_UA, Cookie: cookie },
            cache: "no-store",
        });
        if (!res.ok) return null;
        const crumb = await res.text();
        if (!crumb || crumb.length >= 50 || crumb.includes("<!")) return null;

        crumbCache = { crumb, cookie, timestamp: Date.now() };
        return { crumb, cookie };
    } catch {
        return null;
    }
}

/** Invalidate the crumb after an auth failure. */
export function resetYahooCrumb() {
    crumbCache = null;
}

/** Batch quotes (v7). Returns only the symbols Yahoo answered for. */
async function fetchBatchQuotes(symbols: string[]): Promise<Record<string, Quote>> {
    const out: Record<string, Quote> = {};
    const auth = await getYahooCrumb();
    if (!auth) return out;

    for (let i = 0; i < symbols.length; i += 100) {
        const chunk = symbols.slice(i, i + 100);
        try {
            const url =
                `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${chunk.map(encodeURIComponent).join(",")}` +
                `&crumb=${encodeURIComponent(auth.crumb)}`;
            const res = await fetch(url, {
                headers: { "User-Agent": YAHOO_UA, Accept: "application/json", Cookie: auth.cookie },
                cache: "no-store",
            });
            if (res.status === 401 || res.status === 403) {
                resetYahooCrumb();
                break;
            }
            if (!res.ok) continue;
            const data = await res.json();
            for (const q of data?.quoteResponse?.result ?? []) {
                const price = q.regularMarketPrice;
                const prev = q.regularMarketPreviousClose;
                if (typeof price === "number" && price > 0 && typeof prev === "number" && prev > 0) {
                    out[q.symbol] = {
                        price,
                        previousClose: prev,
                        change: price - prev,
                        changePercent: ((price - prev) / prev) * 100,
                    };
                }
            }
        } catch {
            // fall through to per-symbol chart requests
        }
    }
    return out;
}

/** One symbol from the chart endpoint (no auth needed). Previous close = prior session's close. */
export async function fetchChartQuote(symbol: string): Promise<Quote | null> {
    try {
        const res = await fetch(`${CHART}/${encodeURIComponent(symbol)}?range=1d&interval=1d`, {
            headers: { "User-Agent": "Mozilla/5.0" },
            cache: "no-store",
        });
        if (!res.ok) return null;
        const meta = (await res.json())?.chart?.result?.[0]?.meta;
        const price = meta?.regularMarketPrice;
        const prev = meta?.chartPreviousClose || meta?.previousClose;
        if (!price || price <= 0 || !prev || prev <= 0) return null;
        return { price, previousClose: prev, change: price - prev, changePercent: ((price - prev) / prev) * 100 };
    } catch {
        return null;
    }
}

/**
 * Fresh quotes for many symbols: batch endpoint first, chart endpoint for anything
 * it missed (15 at a time).
 */
export async function fetchQuotes(symbols: string[]): Promise<Record<string, Quote>> {
    const unique = Array.from(new Set(symbols));
    const quotes = await fetchBatchQuotes(unique);
    const missing = unique.filter((s) => !quotes[s]);
    for (let i = 0; i < missing.length; i += 15) {
        const chunk = missing.slice(i, i + 15);
        const results = await Promise.all(chunk.map(fetchChartQuote));
        chunk.forEach((symbol, j) => {
            const q = results[j];
            if (q) quotes[symbol] = q;
        });
    }
    return quotes;
}
