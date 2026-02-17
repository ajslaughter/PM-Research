"use client";

import { motion } from "framer-motion";

// Sector color definitions with unique colors for each sector
// Colors use tailwind color names: emerald, amber, slate, blue, orange, cyan, red, violet, indigo, lime, rose, teal, fuchsia
export const sectorColors: Record<string, {
    bg: string;
    text: string;
    border: string;
    glow: string;
}> = {
    "AI Hardware": {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/50",
        glow: "shadow-emerald-500/20",
    },
    "Cloud/AI": {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/50",
        glow: "shadow-amber-500/20",
    },
    "Consumer Tech": {
        bg: "bg-slate-400/10",
        text: "text-slate-300",
        border: "border-slate-400/50",
        glow: "shadow-slate-400/20",
    },
    "Search/AI": {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/50",
        glow: "shadow-blue-500/20",
    },
    "E-Commerce": {
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        border: "border-orange-500/50",
        glow: "shadow-orange-500/20",
    },
    "Social/AI": {
        bg: "bg-cyan-500/10",
        text: "text-cyan-400",
        border: "border-cyan-500/50",
        glow: "shadow-cyan-500/20",
    },
    "Auto/Robotics": {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/50",
        glow: "shadow-red-500/20",
    },
    "Digital Assets": {
        bg: "bg-violet-500/10",
        text: "text-violet-400",
        border: "border-violet-500/50",
        glow: "shadow-violet-500/20",
    },
    "Enterprise Software": {
        bg: "bg-indigo-500/10",
        text: "text-indigo-400",
        border: "border-indigo-500/50",
        glow: "shadow-indigo-500/20",
    },
    "Fintech": {
        bg: "bg-lime-500/10",
        text: "text-lime-400",
        border: "border-lime-500/50",
        glow: "shadow-lime-500/20",
    },
    "Cybersecurity": {
        bg: "bg-rose-500/10",
        text: "text-rose-400",
        border: "border-rose-500/50",
        glow: "shadow-rose-500/20",
    },
    "Semiconductors": {
        bg: "bg-teal-500/10",
        text: "text-teal-400",
        border: "border-teal-500/50",
        glow: "shadow-teal-500/20",
    },
    "Robotics/Automation": {
        bg: "bg-fuchsia-500/10",
        text: "text-fuchsia-400",
        border: "border-fuchsia-500/50",
        glow: "shadow-fuchsia-500/20",
    },
    // Additional sectors from existing codebase
    "Space": {
        bg: "bg-indigo-500/10",
        text: "text-indigo-400",
        border: "border-indigo-500/50",
        glow: "shadow-indigo-500/20",
    },
    "Quantum": {
        bg: "bg-violet-500/10",
        text: "text-violet-400",
        border: "border-violet-500/50",
        glow: "shadow-violet-500/20",
    },
    "Data Center": {
        bg: "bg-teal-500/10",
        text: "text-teal-400",
        border: "border-teal-500/50",
        glow: "shadow-teal-500/20",
    },
    "Grid Infrastructure": {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/50",
        glow: "shadow-emerald-500/20",
    },
};

// Default styling for unknown sectors
const defaultSectorStyle = {
    bg: "bg-white/5",
    text: "text-gray-400",
    border: "border-white/10",
    glow: "shadow-white/10",
};

// Map tickers to their correct sectors
export function getTickerSector(ticker: string): string {
    const tickerSectorMap: Record<string, string> = {
        // Mag 7
        "NVDA": "AI Hardware",
        "MSFT": "Cloud/AI",
        "AAPL": "Consumer Tech",
        "GOOGL": "Search/AI",
        "AMZN": "E-Commerce",
        "META": "Social/AI",
        "TSLA": "Auto/Robotics",
        // Digital Assets
        "BTC-USD": "Digital Assets",
        // Innovation Watchlist
        "RKLB": "Space",
        "SMCI": "Data Center",
        "VRT": "Data Center",
        "AVGO": "AI Hardware",
        "IONQ": "Quantum",
        // Robotics Watchlist
        "ISRG": "Robotics/Automation",
        "ABBNY": "Auto/Robotics",
        "FANUY": "Auto/Robotics",
        // Additional common tickers
        "ARM": "Semiconductors",
        "PLTR": "Enterprise Software",
        "SQ": "Fintech",
        "CRWD": "Cybersecurity",
        "AMD": "AI Hardware",
        "INTC": "Semiconductors",
        "QCOM": "Semiconductors",
        "CRM": "Cloud/AI",
        "ORCL": "Cloud/AI",
        "IBM": "Enterprise Software",
        "NOW": "Enterprise Software",
        "SNOW": "Cloud/AI",
        "NET": "Cybersecurity",
        "ZS": "Cybersecurity",
        "PANW": "Cybersecurity",
        "COIN": "Digital Assets",
        "MSTR": "Digital Assets",
        "PYPL": "Fintech",
        "V": "Fintech",
        "MA": "Fintech",
        "SHOP": "E-Commerce",
        "BABA": "E-Commerce",
        "JD": "E-Commerce",
        "UBER": "Consumer Tech",
        "ABNB": "Consumer Tech",
        "NFLX": "Consumer Tech",
        "DIS": "Consumer Tech",
        "SNAP": "Social/AI",
        "PINS": "Social/AI",
        "TWTR": "Social/AI",
        "LMT": "Space",
        "RTX": "Space",
        "BA": "Space",
        "ASTR": "Space",
        "SPCE": "Space",
    };

    return tickerSectorMap[ticker.toUpperCase()] || "Unknown";
}

type SectorBadgeSize = "sm" | "md" | "lg";

interface SectorBadgeProps {
    /** The sector name or ticker to display */
    sector?: string;
    /** If provided, will look up the sector from the ticker */
    ticker?: string;
    /** Size variant */
    size?: SectorBadgeSize;
    /** Whether to show hover effects */
    interactive?: boolean;
    /** Additional CSS classes */
    className?: string;
}

const sizeClasses: Record<SectorBadgeSize, string> = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
};

export default function SectorBadge({
    sector,
    ticker,
    size = "md",
    interactive = true,
    className = "",
}: SectorBadgeProps) {
    // Determine the sector to display
    const displaySector = sector || (ticker ? getTickerSector(ticker) : "Unknown");

    // Get the color scheme for this sector
    const colors = sectorColors[displaySector] || defaultSectorStyle;

    const baseClasses = `
        inline-flex items-center justify-center
        rounded border
        font-semibold uppercase tracking-wide
        transition-all duration-200
        ${sizeClasses[size]}
        ${colors.bg}
        ${colors.text}
        ${colors.border}
    `;

    const hoverClasses = interactive
        ? `hover:scale-105 hover:shadow-md ${colors.glow} cursor-default`
        : "";

    if (interactive) {
        return (
            <motion.span
                className={`${baseClasses} ${hoverClasses} ${className}`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
                {displaySector}
            </motion.span>
        );
    }

    return (
        <span className={`${baseClasses} ${className}`}>
            {displaySector}
        </span>
    );
}

// Export color utilities for external use
export function getSectorColors(sector: string) {
    return sectorColors[sector] || defaultSectorStyle;
}
