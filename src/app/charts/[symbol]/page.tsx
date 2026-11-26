import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChartsView } from "@/components/charts/ChartsView";
import { getSymbolInfo, normalizeSymbol } from "@/lib/charts/symbols";

/**
 * /charts/[symbol], a shareable deep link (e.g. /charts/NVDA, /charts/BTC-USD).
 * Watchlist rows link here. Any ticker-shaped symbol is allowed; if Yahoo has
 * no data for it the chart says so. Malformed input is a 404.
 */

export function generateMetadata({ params }: { params: { symbol: string } }): Metadata {
    const symbol = normalizeSymbol(params.symbol);
    if (!symbol) return { title: "Charts | PM Research" };
    const name = getSymbolInfo(symbol)?.name;
    return {
        title: `${symbol} chart | PM Research`,
        description: `Interactive ${name ? `${name} (${symbol})` : symbol} candlestick chart with free drawing tools and indicators.`,
    };
}

export default function SymbolChartPage({ params }: { params: { symbol: string } }) {
    const symbol = normalizeSymbol(params.symbol);
    if (!symbol) notFound();
    return <ChartsView initialSymbol={symbol} />;
}
