import Link from "next/link";
import { Check } from "lucide-react";

const included = [
    "All research notes and future deep dives",
    "Every watchlist with live prices",
    "Daily, quarterly and year-to-date returns",
    "PM Scores and the methodology behind them",
    "PM Live: market heat map, index chart and market tools",
];

const questions = [
    {
        q: "What is the PM Score?",
        a: "A 0 to 100 rating of how well developed and supported an investment thesis is. Higher means stronger conviction in the research. It is not a price target or a return prediction.",
    },
    {
        q: "How are watchlist returns calculated?",
        a: "Each watchlist is held at its stated weights from the Dec 31 close. Year-to-date return is live price against that close, and quarterly returns compound to the year-to-date figure. Stock splits are adjusted for.",
    },
    {
        q: "Is this personalized investment advice?",
        a: "No. PM Research publishes general research and watchlists. We don't know your financial situation, so nothing here is a recommendation to buy or sell a security.",
    },
    {
        q: "Will PM Research stay free?",
        a: "It's free today. If paid features are added later, they'll be announced here first.",
    },
];

export default function PricingPage() {
    return (
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 sm:py-14">
            <header className="mb-12">
                <h1 className="page-title">Free to use</h1>
                <p className="page-lede">All research, watchlists and live market data are open. No subscription needed.</p>
            </header>

            <div className="grid lg:grid-cols-[5fr_7fr] gap-10 lg:gap-14 items-start">
                <section className="rounded-lg border border-pm-border bg-pm-charcoal p-6 sm:p-8" aria-labelledby="included">
                    <p className="type-display font-bold text-6xl text-pm-text">
                        $0
                        <span className="ml-2 type-text text-lg font-normal text-pm-muted align-middle">per month</span>
                    </p>
                    <h2 id="included" className="mt-6 text-sm text-pm-muted">
                        Included
                    </h2>
                    <ul className="mt-3 space-y-3">
                        {included.map((item) => (
                            <li key={item} className="flex gap-3 text-pm-text">
                                <Check className="w-5 h-5 mt-0.5 shrink-0 text-pm-gold" aria-hidden />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <Link href="/watchlist" className="btn-primary w-full mt-8">
                        Open watchlists
                    </Link>
                </section>

                <section aria-labelledby="faq">
                    <h2 id="faq" className="section-title border-b border-pm-border pb-3">
                        Questions
                    </h2>
                    <dl className="divide-y divide-pm-border">
                        {questions.map(({ q, a }) => (
                            <div key={q} className="py-5">
                                <dt className="font-semibold text-pm-text">{q}</dt>
                                <dd className="mt-2 text-pm-muted leading-relaxed max-w-[65ch]">{a}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            </div>

            <p className="mt-16 pt-6 border-t border-pm-border text-xs text-pm-subtle leading-relaxed max-w-3xl">
                Watchlist performance is hypothetical and for research tracking only. Past performance does not guarantee
                future results. Inclusion on a watchlist indicates active research coverage, not a recommendation to
                purchase. Do your own due diligence before making investment decisions.
            </p>
        </div>
    );
}
