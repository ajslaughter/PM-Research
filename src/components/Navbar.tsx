"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    BookOpen,
    Briefcase,
    Bot,
    Menu,
    X,
    Zap,
} from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: "/", label: "Home", icon: Activity },
        { href: "/portfolio", label: "Portfolio", icon: Briefcase },
        { href: "/research", label: "Research", icon: BookOpen },
        { href: "/pmbot", label: "PMbot", icon: Bot },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-pm-black/80 backdrop-blur-xl border-b border-pm-border">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative">
                            <Zap className="w-8 h-8 text-pm-green" />
                            <div className="absolute inset-0 blur-md bg-pm-green/30 group-hover:bg-pm-green/50 transition-colors" />
                        </div>
                        <span className="font-mono text-xl font-bold tracking-tight">
                            <span className="text-pm-green">PM</span>
                            <span className="text-pm-text">Research</span>
                        </span>
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-pm-muted hover:text-pm-green transition-colors"
                        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2
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
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden overflow-hidden border-t border-pm-border bg-pm-black/95 backdrop-blur-xl"
                    >
                        <div className="px-6 py-4 flex flex-col gap-1">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? "text-pm-green bg-pm-green/10"
                                                : "text-pm-muted hover:text-pm-text hover:bg-pm-charcoal"
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
