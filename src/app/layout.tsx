import type { Metadata } from "next";
import "./globals.css";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { AdminProvider } from "@/context/AdminContext";
import Navbar from "@/components/Navbar";
import AdminPanel from "@/components/AdminPanel";

export const metadata: Metadata = {
    title: "PM Research | Predictive Modeling Research",
    description:
        "Institutional-grade stock analysis and predictive modeling for the next generation of capital markets.",
    keywords: ["stock analysis", "predictive modeling", "AI investing", "alpha generation"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="bg-pm-black text-pm-text antialiased">
                <SubscriptionProvider>
                    <AdminProvider>
                        <div className="min-h-screen flex flex-col">
                            <Navbar />
                            <main className="flex-1 pt-16">{children}</main>

                            {/* Footer */}
                            <footer className="border-t border-pm-border bg-pm-charcoal/50">
                                <div className="max-w-7xl mx-auto px-6 py-8">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 font-mono text-sm text-pm-muted">
                                            <span className="text-pm-green">PM</span>
                                            <span>Research</span>
                                            <span className="text-pm-subtle">|</span>
                                            <span>© 2026</span>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm text-pm-muted">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-pm-green animate-pulse" />
                                                Systems Operational
                                            </span>
                                            <span className="font-mono text-xs">v2.1.0</span>
                                        </div>
                                    </div>
                                </div>
                            </footer>
                        </div>

                        {/* Admin Panel - renders when admin mode is active */}
                        <AdminPanel />
                    </AdminProvider>
                </SubscriptionProvider>
            </body>
        </html>
    );
}

