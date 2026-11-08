# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PM Research is a stock research platform with watchlists, AI-powered analysis, and real-time market data. Next.js 14 App Router, TypeScript strict mode, Tailwind CSS, Supabase (auth + PostgreSQL), deployed on Vercel.

## Commands

- `npm run dev` — Start development server (localhost:3000)
- `npm run build` — Production build (primary validation — no test suite)
- `npm run lint` — ESLint with next/core-web-vitals config

There are no automated tests. `npm run build` and `npm run lint` are the only checks before deploy.

## Architecture

### Provider Hierarchy

The root layout (`src/app/layout.tsx`) wraps the entire app in three providers in this order:
```
AuthProvider > SubscriptionProvider > AdminProvider
```
All state management uses React Context (7 providers in `src/context/`) — no Redux or Zustand. Page-level contexts (WatchlistContext, ResearchContext, etc.) are mounted by individual pages, not the root layout.

### Data Flow for Market Prices

1. `usePrices` hook polls `/api/prices` (30s market open, 5min closed)
2. `/api/prices` route fetches from Alpaca (stocks) + CoinGecko (crypto) with in-memory cache
3. YTD returns are calculated client-side against hardcoded baselines in `src/data/baselines.ts`
4. Stock metadata (name, sector, pmScore) comes from `src/data/stockDatabase.ts`

### YTD Baseline System (Critical)

All YTD calculations use hardcoded Dec 31, 2025 closing prices. Formula: `((current - baseline) / baseline) * 100`.

- `src/data/baselines.ts` — Single source of truth for baseline prices (DO NOT modify mid-year)
- `src/services/stockService.ts` — `calculateYTDFromBaseline()` and `calculateWeightedYTD()`
- **When adding new tickers**: you must add baseline prices to `baselines.ts` AND metadata to `stockDatabase.ts`
- **Stock splits**: current prices are post-split, so divide the stored baseline and quarter-end closes by the split ratio (see the CRWD note)
- `quarterEndCloses` in `baselines.ts` holds 2026 quarter-end closes; `calculateQuarterlyReturns()` compounds them to the YTD figure and computes the current quarter live
- `npm run audit:prices` checks every stored value against Yahoo Finance and flags splits. Run it at each quarter end and before the year rollover

### Market hours

`src/lib/marketHours.ts` is the single NYSE calendar (holidays and 1 PM early closes for 2026–2027). Use it instead of ad-hoc weekday checks, and add the next year's dates each December.

### Day change and chart returns

- Day % = price vs the prior session's official close (Alpaca `prevDailyBar`, or Yahoo `range=1d` `chartPreviousClose`)
- `/api/historical` measures each range from the close before the window; YTD starts on the Dec 31 bar
- PM Live merges chart series by timestamp, not array index

### Auth & Admin

- Supabase auth with JWT. Session cookies synced via `/api/auth/session`.
- Admin routes protected by `src/middleware.ts` (checks `sb-access-token` cookie, redirects to `/login`)
- Admin API endpoints use `verifyAdminAuth()` from `src/lib/security.ts` (checks `ADMIN_EMAILS` env var)
- `ADMIN_EMAILS` is required in production; if it's unset there, nobody is an admin (local dev still allows any signed-in user)
- Article generation routes are admin-only. The research and IPO agent routes run local Python scripts and stay off unless `RESEARCH_AGENT_*` / `IPO_AGENT_*` env vars are set

### AI Endpoints

Two article generators (Claude primary, Gemini fallback):
- All AI inputs are sanitized via `sanitizeTopic()` in `src/lib/security.ts`
- Prompt injection detection via regex deny-list (acknowledged as brittle in the code)
- Agent system: 4 specialized agents (research, flow, ipo, macro) with UI in `src/components/agents/`

## Key Conventions

- Path alias: `@/*` maps to `./src/*`
- App Router: server components by default, `"use client"` only when needed
- API routes at `src/app/api/[endpoint]/route.ts` (19 total endpoints)
- Rate limiting is in-memory (`src/lib/security.ts`) — unreliable on Vercel serverless
- In-memory price cache has the same serverless caveat
- External API responses (Alpaca, CoinGecko, Yahoo Finance) are not schema-validated

## Design System

Tokens live in `tailwind.config.ts`; shared component classes in `src/app/globals.css`.

- Color is meaning: `pm-up` / `pm-down` (aliased `pm-green` / `pm-red`) only mean price direction. Never use them for buttons or brand accents.
- `pm-gold` (#E9B949) is PM's own voice: PM Scores, primary buttons, the active page, focus rings.
- Surfaces: `pm-black` (page, #0E1216), `pm-charcoal` (panels), `pm-dark` (raised rows, inputs), `pm-border` (hairlines). Text: `pm-text`, `pm-muted`, `pm-subtle`.
- One typeface, Archivo (variable, via `next/font`). Width utilities: `type-display` (condensed headlines), `type-condensed` (section titles, tickers), `type-data` (tabular numbers), `type-text` (reset to normal width).
- Page header grammar: `page-title` + `page-lede`, left-aligned. Section headings use `section-title`.
- Number formatting: `formatPct`, `directionClass`, `formatPrice` in `src/lib/format.ts` (true minus sign, neutral color for flat or missing values).
- No decorative glows, grid backgrounds or entrance animations; motion only where data changes.

## Database

Two Supabase tables (schemas in `sql/`):
- `research_notes` — Public read, authenticated write. Articles with title, content, category, ticker, pmScore.
- `user_portfolios` — RLS per-user. JSONB `positions` array. Used by `/my-watchlists`.
- `profiles` — User profile data linked to auth.

## Environment Variables

See `.env.example`. Key vars: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ALPACA_API_KEY_ID`, `ALPACA_API_SECRET_KEY`, `COINGECKO_API_KEY` (optional), `GEMINI_API_KEY`, `ADMIN_EMAILS` (comma-separated).
