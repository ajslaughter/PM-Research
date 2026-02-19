# CLAUDE.md

This file provides context for Claude Code when working on the PM Research codebase.

## Project Overview

PM Research is an institutional-grade stock research platform with research-driven watchlists, AI-powered analysis, and real-time market data. Deployed at [pmresearch.vercel.app](https://pmresearch.vercel.app).

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 3.4
- **Animation**: Framer Motion 11
- **Database & Auth**: Supabase (PostgreSQL + Row-Level Security)
- **AI**: Anthropic Claude (PM Bot & article generation), Google Gemini (fallback)
- **Market Data**: Yahoo Finance, CoinGecko, Polygon.io, Alpaca Markets
- **Deployment**: Vercel (auto-deploy on push)

## Commands

- `npm run dev` — Start development server (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — Run ESLint (next/core-web-vitals config)
- `npm start` — Start production server

## Project Structure

All source code lives under `src/`:

- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — React components (Navbar, WatchlistTable, ResearchFeed, AdminPanel, etc.)
- `src/context/` — React context providers (Admin, Watchlist, Research, StockDatabase, Subscription)
- `src/hooks/` — Custom hooks (usePrices, useWatchlist, useResearch)
- `src/lib/` — Utilities (watchlists data, security, supabase client, dateUtils, middleware)
- `src/services/` — Business logic (stockService for YTD calculations)
- `src/data/` — Static data (stockDatabase, baselines)
- `sql/` — Supabase RLS policy scripts
- `docs/` — Audit trails and documentation

## Path Aliases

`@/*` maps to `./src/*` — use `@/components/Navbar` not `../components/Navbar`.

## Design System

Dark theme with brand colors defined in `tailwind.config.ts`:
- `pm-black` (#0a0a0a) — Primary background
- `pm-green` (#00ff9d) — Positive alpha, CTAs
- `pm-purple` (#9d4edd) — Predictive elements
- `pm-red` (#ff4757) — Negative returns
- `pm-muted` (#6b7280) — Secondary text

Fonts: Plus Jakarta Sans (body), JetBrains Mono (code/data).

## Key Conventions

- Use App Router patterns (server components by default, `"use client"` only when needed)
- State management via React Context — no Redux or Zustand
- API routes live at `src/app/api/[endpoint]/route.ts`
- Admin routes are protected via Supabase auth + email verification
- Security headers are configured in `next.config.js`
- Rate limiting is applied per-IP on API endpoints (see `src/lib/security.ts`)

## Environment Variables

See `.env.example` for required keys. Never commit `.env` or `.env.local` files. Key services:
- `ANTHROPIC_API_KEY` — Claude API for PM Bot and article generation
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase
- `ALPACA_API_KEY_ID` / `ALPACA_API_SECRET_KEY` — Stock price data
- `COINGECKO_API_KEY` — Crypto price data (optional)
- `GEMINI_API_KEY` — Gemini fallback for article generation
- `ADMIN_EMAILS` — Comma-separated admin emails
