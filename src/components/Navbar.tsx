"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
    Activity,
    Radio,
    BookOpen,
    Briefcase,
    Bot,
    Zap,
    User,
    LogOut,
} from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const navLinks = [
        { href: "/", label: "Home", icon: Activity },
        { href: "/pm-live", label: "PM Live", icon: Radio },
        { href: "/watchlist", label: "Watchlist", icon: Briefcase },
        { href: "/research", label: "Research", icon: BookOpen },
        { href: "/pmbot", label: "PMbot", icon: Bot },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-pm-black/80 backdrop-blur-xl border-b border-pm-border">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative">
                                <Zap className="w-8 h-8 text-pm-green" />
                                <div className="absolute inset-0 blur-md bg-pm-green/30 group-hover:bg-pm-green/50 transition-colors" />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight">
                                <span className="text-pm-green">PM</span>
                                <span className="text-pm-text">Research</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href || (link.href === "/watchlist" && pathname.startsWith("/watchlist/"));
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`relative px-3 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1.5
                        ${isActive
                                                ? "text-pm-green"
                                                : "text-pm-muted hover:text-pm-text"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                        {isActive && (
                                            <motion.div
                                                layoutId="navbar-indicator"
                                                className="absolute inset-0 bg-pm-green/10 rounded-lg border border-pm-green/20"
                                                transition={{ type: "spring", duration: 0.5 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Sign In / Sign Up (top right) */}
                        <div className="hidden md:flex items-center gap-2">
                            {user ? (
                                <button
                                    onClick={() => signOut()}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-pm-muted hover:text-pm-text transition-colors"
                                    title={user.email}
                                >
                                    <User className="w-4 h-4 text-pm-green" />
                                    <span className="text-xs text-pm-muted max-w-[120px] truncate">{user.email}</span>
                                    <LogOut className="w-4 h-4" />
                                </button>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-3 py-2 rounded-lg text-sm text-pm-muted hover:text-pm-text transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="px-4 py-2 rounded-lg text-sm font-medium bg-pm-green text-pm-black hover:bg-pm-green/90 transition-colors"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-pm-black/90 backdrop-blur-xl border-t border-pm-border">
                <div className="flex items-center justify-around h-16 px-2">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || (link.href === "/watchlist" && pathname.startsWith("/watchlist/"));
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors
                                    ${isActive
                                        ? "text-pm-green"
                                        : "text-pm-muted hover:text-pm-text"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium">{link.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
