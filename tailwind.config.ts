import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // PM Research Brand Colors
                "pm-black": "#0a0a0a",
                "pm-charcoal": "#141414",
                "pm-dark": "#1a1a1a",
                "pm-border": "#1f1f1f",
                "pm-green": "#00ff9d",
                "pm-green-muted": "#00cc7d",
                "pm-purple": "#9d4edd",
                "pm-purple-muted": "#7b2cbf",
                "pm-red": "#ff4757",
                "pm-text": "#ffffff",
                "pm-muted": "#6b7280",
                "pm-subtle": "#3f3f46",
            },
            fontFamily: {
                mono: ["JetBrains Mono", "Fira Code", "monospace"],
                sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "grid-pattern":
                    "linear-gradient(to right, #1f1f1f 1px, transparent 1px), linear-gradient(to bottom, #1f1f1f 1px, transparent 1px)",
                "glow-green": "radial-gradient(ellipse at center, rgba(0, 255, 157, 0.15) 0%, transparent 70%)",
                "glow-purple": "radial-gradient(ellipse at center, rgba(157, 78, 221, 0.15) 0%, transparent 70%)",
            },
            backgroundSize: {
                "grid": "40px 40px",
            },
            animation: {
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "glow": "glow 2s ease-in-out infinite alternate",
                "scan": "scan 4s ease-in-out infinite",
            },
            keyframes: {
                glow: {
                    "0%": { boxShadow: "0 0 5px rgba(0, 255, 157, 0.5)" },
                    "100%": { boxShadow: "0 0 20px rgba(0, 255, 157, 0.8)" },
                },
                scan: {
                    "0%, 100%": { opacity: "0.3" },
                    "50%": { opacity: "1" },
                },
            },
            boxShadow: {
                "neon-green": "0 0 20px rgba(0, 255, 157, 0.3)",
                "neon-purple": "0 0 20px rgba(157, 78, 221, 0.3)",
            },
        },
    },
    plugins: [],
};

export default config;
