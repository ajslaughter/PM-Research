"use client";

import ResearchFeed from "@/components/ResearchFeed";

export default function ResearchPage() {
    return (
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 sm:py-14">
            <header className="mb-12">
                <h1 className="page-title">Research</h1>
                <p className="page-lede">
                    Deep dives on the companies and technologies behind each watchlist. Every note carries a PM Score
                    for how far the thesis has developed.
                </p>
            </header>

            <ResearchFeed />

            <p className="mt-16 pt-6 border-t border-pm-border text-xs text-pm-subtle leading-relaxed max-w-3xl">
                Research is published for education and information only. PM Research does not provide financial
                advice. PM Scores reflect research depth and thesis development, not return predictions. Do your own
                research before making investment decisions.
            </p>
        </div>
    );
}
