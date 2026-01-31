"use client";

import { useMemo } from "react";

// Sector color configuration with specific hex values
// Each sector has: text color, background (10% opacity), border (50% opacity), and glow
const sectorColors: Record<string, { hex: string; text: string; bg: string; border: string; glow: string }> = {
  "AI Hardware": {
    hex: "#34d399",
    text: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/50",
    glow: "shadow-[0_0_10px_rgba(52,211,153,0.15)]",
  },
  "Cloud/AI": {
    hex: "#fbbf24",
    text: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/50",
    glow: "shadow-[0_0_10px_rgba(251,191,36,0.15)]",
  },
  "Consumer Tech": {
    hex: "#cbd5e1",
    text: "text-slate-300",
    bg: "bg-slate-300/10",
    border: "border-slate-300/50",
    glow: "shadow-[0_0_10px_rgba(203,213,225,0.15)]",
  },
  "Search/AI": {
    hex: "#60a5fa",
    text: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/50",
    glow: "shadow-[0_0_10px_rgba(96,165,250,0.15)]",
  },
  "E-Commerce": {
    hex: "#fb923c",
    text: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/50",
    glow: "shadow-[0_0_10px_rgba(251,146,60,0.15)]",
  },
  "Social/AI": {
    hex: "#22d3ee",
    text: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/50",
    glow: "shadow-[0_0_10px_rgba(34,211,238,0.15)]",
  },
  "Auto/Robotics": {
    hex: "#f87171",
    text: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/50",
    glow: "shadow-[0_0_10px_rgba(248,113,113,0.15)]",
  },
  "Digital Assets": {
    hex: "#a78bfa",
    text: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/50",
    glow: "shadow-[0_0_10px_rgba(167,139,250,0.15)]",
  },
  "Enterprise Software": {
    hex: "#818cf8",
    text: "text-indigo-400",
    bg: "bg-indigo-400/10",
    border: "border-indigo-400/50",
    glow: "shadow-[0_0_10px_rgba(129,140,248,0.15)]",
  },
  "Fintech": {
    hex: "#a3e635",
    text: "text-lime-400",
    bg: "bg-lime-400/10",
    border: "border-lime-400/50",
    glow: "shadow-[0_0_10px_rgba(163,230,53,0.15)]",
  },
  "Cybersecurity": {
    hex: "#fb7185",
    text: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/50",
    glow: "shadow-[0_0_10px_rgba(251,113,133,0.15)]",
  },
  "Semiconductors": {
    hex: "#2dd4bf",
    text: "text-teal-400",
    bg: "bg-teal-400/10",
    border: "border-teal-400/50",
    glow: "shadow-[0_0_10px_rgba(45,212,191,0.15)]",
  },
  "Robotics/Automation": {
    hex: "#e879f9",
    text: "text-fuchsia-400",
    bg: "bg-fuchsia-400/10",
    border: "border-fuchsia-400/50",
    glow: "shadow-[0_0_10px_rgba(232,121,249,0.15)]",
  },
};

// Default fallback styling for unknown sectors
const defaultColors = {
  hex: "#9ca3af",
  text: "text-gray-400",
  bg: "bg-gray-400/10",
  border: "border-gray-400/50",
  glow: "shadow-[0_0_10px_rgba(156,163,175,0.15)]",
};

// Ticker to sector mapping
const tickerSectorMap: Record<string, string> = {
  // AI Hardware
  "NVDA": "AI Hardware",

  // Cloud/AI
  "MSFT": "Cloud/AI",

  // Consumer Tech
  "AAPL": "Consumer Tech",

  // Search/AI
  "GOOGL": "Search/AI",
  "GOOG": "Search/AI",

  // E-Commerce
  "AMZN": "E-Commerce",

  // Social/AI
  "META": "Social/AI",

  // Auto/Robotics
  "TSLA": "Auto/Robotics",

  // Digital Assets
  "BTC": "Digital Assets",
  "BTC-USD": "Digital Assets",
  "COIN": "Digital Assets",

  // Enterprise Software
  "PLTR": "Enterprise Software",

  // Cybersecurity
  "CRWD": "Cybersecurity",

  // Semiconductors
  "ARM": "Semiconductors",

  // Robotics/Automation
  "ISRG": "Robotics/Automation",
};

/**
 * Get the sector for a given ticker symbol
 * @param ticker - The stock ticker symbol (e.g., "NVDA", "AAPL")
 * @returns The sector name or "Unknown" if not found
 */
export function getTickerSector(ticker: string): string {
  const normalizedTicker = ticker.toUpperCase().trim();
  return tickerSectorMap[normalizedTicker] || "Unknown";
}

/**
 * Get color configuration for a sector
 * @param sector - The sector name
 * @returns Color configuration object
 */
export function getSectorColors(sector: string) {
  return sectorColors[sector] || defaultColors;
}

// Size variant configurations
const sizeVariants = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

interface SectorBadgeProps {
  /** The sector name to display (e.g., "AI Hardware", "Cloud/AI") */
  sector: string;
  /** Size variant of the badge */
  size?: "sm" | "md" | "lg";
  /** Optional additional class names */
  className?: string;
}

/**
 * SectorBadge Component
 *
 * Displays a styled badge for asset class sectors with unique colors,
 * hover effects, and glow styling.
 *
 * @example
 * <SectorBadge sector="AI Hardware" size="md" />
 * <SectorBadge sector={getTickerSector("NVDA")} />
 */
export default function SectorBadge({
  sector,
  size = "md",
  className = ""
}: SectorBadgeProps) {
  const colors = useMemo(() => getSectorColors(sector), [sector]);
  const sizeClasses = sizeVariants[size];

  return (
    <span
      className={`
        inline-flex items-center justify-center
        ${sizeClasses}
        ${colors.bg}
        ${colors.border}
        ${colors.text}
        ${colors.glow}
        border
        rounded
        font-mono
        uppercase
        tracking-wide
        whitespace-nowrap
        transition-all
        duration-200
        hover:scale-105
        hover:brightness-110
        cursor-default
        select-none
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {sector}
    </span>
  );
}

// Named export for convenience
export { SectorBadge };

// Export sector colors for external use if needed
export { sectorColors, tickerSectorMap };
