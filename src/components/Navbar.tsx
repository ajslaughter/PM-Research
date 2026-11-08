"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, LayoutList, Radio } from "lucide-react";

const navLinks = [
    { href: "/", label: "Home", icon: Activity },
    { href: "/pm-live", label: "PM Live", icon: Radio },
    { href: "/watchlist", label: "Watchlists", icon: LayoutList },
    { href: "/research", label: "Research", icon: BookOpen },
];

function isActivePath(pathname: string, href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
    const pathname = usePathname();

    return (
        <>
            <nav
                className="fixed top-0 left-0 right-0 z-50 bg-pm-black/90 backdrop-blur-md border-b border-pm-border"
                aria-label="Main"
            >
                <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5" aria-label="PM Research home">
                        <span className="type-display grid place-items-center w-8 h-8 rounded bg-pm-gold text-pm-black text-[15px] font-extrabold leading-none">
                            PM
                        </span>
                        <span className="type-condensed text-lg font-semibold tracking-tight text-pm-text">
                            Research
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const active = isActivePath(pathname, link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    aria-current={active ? "page" : undefined}
                                    className={`relative px-3 py-5 text-sm font-medium transition-colors ${
                                        active ? "text-pm-text" : "text-pm-muted hover:text-pm-text"
                                    }`}
                                >
                                    {link.label}
                                    {active && (
                                        <span className="absolute left-3 right-3 bottom-0 h-0.5 bg-pm-gold" aria-hidden />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Mobile bottom navigation */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-pm-black/95 backdrop-blur-md border-t border-pm-border pb-[env(safe-area-inset-bottom)]"
                aria-label="Main"
            >
                <div className="grid grid-cols-4 h-16">
                    {navLinks.map((link) => {
                        const active = isActivePath(pathname, link.href);
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={active ? "page" : undefined}
                                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                                    active ? "text-pm-gold" : "text-pm-muted hover:text-pm-text"
                                }`}
                            >
                                <Icon className="w-5 h-5" aria-hidden />
                                <span className="text-[11px] font-medium">{link.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
