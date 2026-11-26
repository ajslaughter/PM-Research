import type { Metadata } from "next";
import { ChartsView } from "@/components/charts/ChartsView";

export const metadata: Metadata = {
    title: "Charts | PM Research",
    description: "Free interactive candlestick charts with drawing tools, indicators and compare, for every PM Research watchlist name, major ETFs and crypto.",
};

/** /charts opens the last symbol charted in this browser (NVDA the first time). */
export default function ChartsPage() {
    return <ChartsView />;
}
