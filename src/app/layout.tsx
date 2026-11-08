import type { Metadata } from "next";
import Link from "next/link";
import { Archivo } from "next/font/google";
import "./globals.css";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { AdminProvider } from "@/context/AdminContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import AdminPanel from "@/components/AdminPanel";

// One family, two voices: condensed for display and tickers, regular width for reading.
const archivo = Archivo({
    subsets: ["latin"],
    axes: ["wdth"],
    display: "swap",
    variable: "--font-archivo",
});

export const metadata: Metadata = {
    title: "PM Research | Predictive Modeling Research",
    description:
        "Thematic watchlists and research on the companies building AI, robotics, energy, space, quantum and biotech, with live prices and PM Scores.",
    keywords: ["stock research", "thematic watchlists", "AI stocks", "PM Score"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const year = new Date().getFullYear();

    return (
        <html lang="en" className={`dark ${archivo.variable}`}>
            <body className="bg-pm-black text-pm-text font-sans antialiased">
                <AuthProvider>
                <SubscriptionProvider>
                    <AdminProvider>
                        <div className="min-h-screen flex flex-col">
                            <Navbar />
                            <main className="flex-1 pt-16">{children}</main>

                            <footer className="border-t border-pm-border">
                                <div className="max-w-6xl mx-auto px-5 sm:px-6 py-8 pb-24 md:pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-pm-muted">
                                    <p>
                                        <span className="text-pm-text font-semibold">PM Research</span>
                                        <span className="mx-2 text-pm-border">/</span>
                                        Research, not investment advice. © {year}
                                    </p>
                                    <nav className="flex items-center gap-6" aria-label="Legal">
                                        <Link href="/pricing" className="hover:text-pm-text transition-colors">
                                            Pricing
                                        </Link>
                                        <Link href="/legal/terms" className="hover:text-pm-text transition-colors">
                                            Terms
                                        </Link>
                                        <Link href="/legal/privacy" className="hover:text-pm-text transition-colors">
                                            Privacy
                                        </Link>
                                    </nav>
                                </div>
                            </footer>
                        </div>

                        {/* Admin Panel - renders when admin mode is active */}
                        <AdminPanel />
                    </AdminProvider>
                </SubscriptionProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
