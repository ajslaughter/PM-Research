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

### Auth & Admin

- Supabase auth with JWT. Session cookies synced via `/api/auth/session`.
- Admin routes protected by `src/middleware.ts` (checks `sb-access-token` cookie, redirects to `/login`)
- Admin API endpoints use `verifyAdminAuth()` from `src/lib/security.ts` (checks `ADMIN_EMAILS` env var)
- If `ADMIN_EMAILS` is unset, any authenticated user gets admin access (dev fallback)

### AI Endpoints

Two article generators (Claude primary, Gemini fallback) and a chatbot:
- All AI inputs are sanitized via `sanitizeTopic()` / `sanitizeMessage()` in `src/lib/security.ts`
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

Dark theme defined in `tailwind.config.ts`:
- `pm-black` (#0a0a0a) — background
- `pm-green` (#00ff9d) — positive/CTAs
- `pm-purple` (#9d4edd) — predictive elements
- `pm-red` (#ff4757) — negative returns
- `pm-muted` (#6b7280) — secondary text

Fonts: Plus Jakarta Sans (body), JetBrains Mono (data/code). Custom animations: `pulse-slow`, `glow`, `scan`.

## Database

Two Supabase tables (schemas in `sql/`):
- `research_notes` — Public read, authenticated write. Articles with title, content, category, ticker, pmScore.
- `user_portfolios` — RLS per-user. JSONB `positions` array. Used by `/my-watchlists`.
- `profiles` — User profile data linked to auth. Created on signup.

## Environment Variables

See `.env.example`. Key vars: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ALPACA_API_KEY_ID`, `ALPACA_API_SECRET_KEY`, `COINGECKO_API_KEY` (optional), `GEMINI_API_KEY`, `ADMIN_EMAILS` (comma-separated).
