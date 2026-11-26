"use client";

import type { ReactNode } from "react";
import type { DrawingKind } from "lightweight-charts-drawing";
import { Brush, Camera, Eraser, Eye, EyeOff, Magnet, MousePointer2, MoveVertical, Square, Trash2, Type } from "lucide-react";

/**
 * The drawing tools rail.
 *
 * Desktop: a vertical rail on the chart's left edge (like TradingView).
 * Mobile:  a single horizontally scrolling row above the chart, so it
 *          never covers the candles.
 *
 * The buttons only *arm* tools: placement, hit-testing, anchors, dragging and
 * Delete/Escape keys are all handled by lightweight-charts-drawing's
 * DrawingManager inside ChartWithTools. Gold marks the armed tool and any
 * toggle that's on; that's the only accent in the rail.
 */

/** Small stroke icons for tools lucide has no glyph for. 16px, currentColor. */
const svg = (children: ReactNode) => (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden>
        {children}
    </svg>
);
const ICONS = {
    trendLine: svg(<><path d="M3 13 13 3" /><circle cx="3" cy="13" r="1.4" fill="currentColor" /><circle cx="13" cy="3" r="1.4" fill="currentColor" /></>),
    ray: svg(<><path d="M3 13 15 1" /><circle cx="3" cy="13" r="1.4" fill="currentColor" /></>),
    extendedLine: svg(<path d="M1 15 15 1" />),
    horizontalLine: svg(<><path d="M1 8h14" /><circle cx="8" cy="8" r="1.4" fill="currentColor" /></>),
    horizontalRay: svg(<><path d="M4 8h11" /><circle cx="4" cy="8" r="1.4" fill="currentColor" /></>),
    verticalLine: svg(<><path d="M8 1v14" /><circle cx="8" cy="8" r="1.4" fill="currentColor" /></>),
    channel: svg(<><path d="M1 11 11 1" /><path d="M5 15 15 5" /></>),
    fib: svg(<><path d="M1 2.5h14" /><path d="M1 6h14" opacity={0.7} /><path d="M1 8.5h14" opacity={0.7} /><path d="M1 13.5h14" /></>),
    long: svg(<><path d="M2 9h12" /><path d="M2 3h12v6H2z" fill="currentColor" fillOpacity={0.2} stroke="none" /><path d="M2 3h12" /><path d="M2 13h12" opacity={0.6} /></>),
};

/** One tool button definition. `kind` is a DrawingManager tool id (docs/TOOLS.md). */
interface ToolDef {
    kind: DrawingKind;
    label: string;
    icon: ReactNode;
    /** Alt+<key> shortcut shown in the tooltip (wired up in ChartWithTools). */
    shortcut?: string;
}

/** Grouped like TradingView's rail: lines, levels, Fibonacci/shapes, annotation. */
export const TOOL_GROUPS: ToolDef[][] = [
    [
        { kind: "trend-line", label: "Trend line", icon: ICONS.trendLine, shortcut: "T" },
        { kind: "ray", label: "Ray", icon: ICONS.ray },
        { kind: "extended-line", label: "Extended line", icon: ICONS.extendedLine },
        { kind: "parallel-channel", label: "Parallel channel", icon: ICONS.channel },
    ],
    [
        { kind: "horizontal-line", label: "Horizontal line", icon: ICONS.horizontalLine, shortcut: "H" },
        { kind: "horizontal-ray", label: "Horizontal ray", icon: ICONS.horizontalRay, shortcut: "J" },
        { kind: "vertical-line", label: "Vertical line", icon: ICONS.verticalLine, shortcut: "V" },
    ],
    [
        { kind: "fib-retracement", label: "Fibonacci retracement", icon: ICONS.fib, shortcut: "F" },
        { kind: "rectangle", label: "Rectangle", icon: <Square className="w-4 h-4" aria-hidden />, shortcut: "R" },
        { kind: "price-range", label: "Price range (measure)", icon: <MoveVertical className="w-4 h-4" aria-hidden /> },
        { kind: "long-position", label: "Long position (risk/reward)", icon: ICONS.long },
    ],
    [
        { kind: "text", label: "Text", icon: <Type className="w-4 h-4" aria-hidden />, shortcut: "N" },
        { kind: "brush", label: "Brush", icon: <Brush className="w-4 h-4" aria-hidden /> },
    ],
];

/** Alt+<key> → tool, derived from the definitions above so tooltips and handlers never disagree. */
export const TOOL_SHORTCUTS: Record<string, DrawingKind> = Object.fromEntries(
    TOOL_GROUPS.flat()
        .filter((t) => t.shortcut)
        .map((t) => [`Key${t.shortcut}`, t.kind])
);

/** One square icon button with a hover tooltip (title) and pressed state. */
function RailButton({
    label,
    active = false,
    disabled = false,
    onClick,
    children,
}: {
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onClick={onClick}
            className={`shrink-0 grid place-items-center w-9 h-9 rounded transition-colors
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pm-gold
                disabled:opacity-35 disabled:pointer-events-none
                ${active ? "bg-pm-gold/15 text-pm-gold" : "text-pm-muted hover:text-pm-text hover:bg-pm-dark"}`}
        >
            {children}
        </button>
    );
}

/** Hairline between groups: horizontal on the desktop rail, vertical on the mobile row. */
const Divider = () => <span className="shrink-0 bg-pm-border w-px h-6 md:w-6 md:h-px my-0 mx-1 md:mx-0 md:my-1" aria-hidden />;

export function DrawingToolbar({
    activeTool,
    onTool,
    magnet,
    onMagnet,
    drawingsVisible,
    onToggleVisible,
    hasSelection,
    onDeleteSelected,
    hasDrawings,
    onClearAll,
    onScreenshot,
}: {
    activeTool: DrawingKind | null;
    /** null = back to the cursor (disarm). */
    onTool: (kind: DrawingKind | null) => void;
    magnet: boolean;
    onMagnet: () => void;
    drawingsVisible: boolean;
    onToggleVisible: () => void;
    hasSelection: boolean;
    onDeleteSelected: () => void;
    hasDrawings: boolean;
    onClearAll: () => void;
    onScreenshot: () => void;
}) {
    return (
        <div
            role="toolbar"
            aria-label="Drawing tools"
            className="shrink-0 flex md:flex-col items-center gap-0.5 p-1 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto
                border-b md:border-b-0 md:border-r border-pm-border bg-pm-charcoal [scrollbar-width:none]"
        >
            <RailButton label="Cursor (Esc)" active={activeTool === null} onClick={() => onTool(null)}>
                <MousePointer2 className="w-4 h-4" aria-hidden />
            </RailButton>
            <Divider />

            {TOOL_GROUPS.map((group, gi) => (
                <div key={gi} className="contents">
                    {group.map((t) => (
                        <RailButton
                            key={t.kind}
                            label={t.shortcut ? `${t.label} (Alt+${t.shortcut})` : t.label}
                            active={activeTool === t.kind}
                            // Clicking the armed tool again disarms it, like TradingView.
                            onClick={() => onTool(activeTool === t.kind ? null : t.kind)}
                        >
                            {t.icon}
                        </RailButton>
                    ))}
                    <Divider />
                </div>
            ))}

            <RailButton label={magnet ? "Magnet on: snaps to OHLC" : "Magnet off"} active={magnet} onClick={onMagnet}>
                <Magnet className="w-4 h-4" aria-hidden />
            </RailButton>
            <RailButton label={drawingsVisible ? "Hide all drawings" : "Show all drawings"} active={!drawingsVisible} onClick={onToggleVisible}>
                {drawingsVisible ? <Eye className="w-4 h-4" aria-hidden /> : <EyeOff className="w-4 h-4" aria-hidden />}
            </RailButton>
            <RailButton label="Delete selected (Del)" disabled={!hasSelection} onClick={onDeleteSelected}>
                <Trash2 className="w-4 h-4" aria-hidden />
            </RailButton>
            <RailButton label="Remove all drawings" disabled={!hasDrawings} onClick={onClearAll}>
                <Eraser className="w-4 h-4" aria-hidden />
            </RailButton>
            <Divider />
            <RailButton label="Save chart as PNG" onClick={onScreenshot}>
                <Camera className="w-4 h-4" aria-hidden />
            </RailButton>
        </div>
    );
}
