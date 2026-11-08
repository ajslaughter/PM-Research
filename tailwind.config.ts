import type { Config } from "tailwindcss";

/**
 * PM Research design tokens
 *
 * Color is meaning, not decoration:
 *   - pm-up / pm-down (aliased as pm-green / pm-red) only ever mean price direction
 *   - pm-gold is PM's own voice: PM Scores, primary actions, the active page
 *   - everything else is graphite and paper
 */
const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/lib/**/*.{js,ts,jsx,tsx}",
        "./src/hooks/**/*.{js,ts,jsx,tsx}",
        "./src/services/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Surfaces
                "pm-black": "#0E1216", // page
                "pm-charcoal": "#151A20", // panels
                "pm-dark": "#1C222A", // raised rows, inputs
                "pm-border": "#262D36", // hairlines
                // Text
                "pm-text": "#ECEFF3",
                "pm-muted": "#9AA4AF",
                "pm-subtle": "#6C7581",
                // PM accent
                "pm-gold": "#E9B949",
                "pm-gold-muted": "#B8902F",
                // Market direction
                "pm-up": "#3BCF8E",
                "pm-down": "#F0616D",
                "pm-green": "#3BCF8E",
                "pm-green-muted": "#2FA672",
                "pm-red": "#F0616D",
                // Legacy accent: PM Score and analyst notes now share the gold accent
                "pm-purple": "#E9B949",
                "pm-purple-muted": "#B8902F",
            },
            fontFamily: {
                sans: ["var(--font-archivo)", "system-ui", "sans-serif"],
                mono: ["var(--font-archivo)", "system-ui", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "6px",
            },
            animation: {
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
        },
    },
    plugins: [],
};

export default config;
