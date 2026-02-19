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
- **Market Data**: Alpaca Markets (stocks), CoinGecko (crypto), Yahoo Finance (fallback/metadata), Polygon.io (extended data)
- **Charts**: Recharts (data visualization)
- **Icons**: Lucide React
- **Deployment**: Vercel (auto-deploy on push)

## Commands

- `npm run dev` — Start development server (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — Run ESLint (next/core-web-vitals config)
- `npm start` — Start production server

Note: There is no automated test suite. `npm run build` and `npm run lint` are the primary validation steps.

## Project Structure

All source code lives under `src/`:

```
src/
├── app/                  # Next.js App Router pages and API routes
│   ├── api/              # 19 API endpoints (see API Routes below)
│   ├── watchlist/        # Watchlist pages (view + create)
│   ├── research/         # Research hub
│   ├── pmbot/            # AI chatbot
│   ├── pm-live/          # Real-time market data
│   ├── my-watchlists/    # User portfolio pages
│   ├── pricing/          # Subscription tiers
│   ├── login/ & signup/  # Auth pages
│   ├── admin/            # Protected admin panel
│   └── legal/            # Terms & privacy
├── components/           # React components
│   ├── agents/           # Multi-agent UI (AgentTabs, ResearchAgent, FlowAgent, IPOAgent, MacroAgent)
│   ├── flow/             # Flow visualization (BubbleChart, SummaryCards, TradesTable)
│   ├── Navbar.tsx        # Navigation with demo/auth toggle
│   ├── WatchlistTable.tsx # Data table with live prices, YTD, PM scores
│   ├── ResearchFeed.tsx  # Article grid with category filters
│   ├── AdminPanel.tsx    # Article management (generate, edit, delete)
│   ├── SectorBadge.tsx   # Sector visualization
│   ├── TickerTape.tsx    # Horizontal ticker scroll
│   ├── PricingCard.tsx   # Subscription tier card
│   ├── PremiumModal.tsx  # Article detail modal
│   └── ErrorBoundary.tsx # Error handling wrapper
├── context/              # React context providers (7 total)
│   ├── AuthContext.tsx         # Supabase session, sign-in/sign-up/sign-out
│   ├── WatchlistContext.tsx    # Selected watchlist, positions, live prices
│   ├── UserWatchlistContext.tsx # User-created watchlist CRUD
│   ├── ResearchContext.tsx     # Articles list, category filters, search
│   ├── AdminContext.tsx        # Article generation, cleanup operations
│   ├── StockDatabaseContext.tsx # Ticker lookup, sector data, PM scores
│   └── SubscriptionContext.tsx  # Demo vs. premium mode toggle
├── hooks/                # Custom hooks
│   ├── usePrices.ts           # Live price polling with market-aware intervals
│   ├── useWatchlist.ts        # Watchlist selection state
│   ├── useWatchlistEnhanced.ts # YTD calculations, weighted returns, PM score aggregation
│   └── useResearch.ts         # Research article fetching and filtering
├── lib/                  # Utilities
│   ├── supabase.ts       # Supabase client, fetchResearchNotes, saveResearchNote, deleteResearchNote
│   ├── security.ts       # Auth verification, rate limiting, sanitization, prompt injection detection
│   ├── watchlists.ts     # Default watchlist definitions, types (WatchlistPosition, Watchlist, ResearchNote)
│   └── dateUtils.ts      # YTD baseline dates, formatting helpers
├── services/
│   └── stockService.ts   # YTD calculations, live price fetching, PM score classification
├── data/
│   ├── baselines.ts      # Dec 31, 2025 closing prices for YTD calculations (100+ tickers)
│   └── stockDatabase.ts  # Ticker metadata: name, sector, assetClass, pmScore, yearlyClose
└── middleware.ts          # Admin route protection (Supabase JWT verification)
```

Additional directories:
- `sql/` — Supabase table schemas and RLS policy scripts
- `docs/` — Audit trails and production readiness documentation

## Pages & Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page — hero, stats, CTAs |
| `/watchlist` | Default watchlist selector + data table |
| `/watchlist/create` | Custom watchlist builder |
| `/research` | Research article grid with filters |
| `/pmbot` | Conversational AI research assistant |
| `/pm-live` | Real-time market data feed |
| `/my-watchlists` | User portfolio list |
| `/my-watchlists/create` | Create custom portfolio |
| `/pricing` | Subscription tier selection |
| `/login` | Supabase authentication |
| `/signup` | User registration |
| `/admin` | Protected admin panel (middleware-guarded) |
| `/legal/terms` | Terms of service |
| `/legal/privacy` | Privacy policy |

## API Routes

All endpoints live at `src/app/api/[endpoint]/route.ts`.

**Market Data:**
| Endpoint | Purpose | Auth |
|----------|---------|------|
| `/api/prices` | Live stock/crypto pricing (Alpaca + CoinGecko) | None |
| `/api/stock-info` | Stock metadata lookup (Yahoo Finance) | None |
| `/api/polygon` | Extended market data (Polygon.io) | None |
| `/api/historical` | Historical price time-series | None |
| `/api/market-map` | Sector performance heatmap data | None |
| `/api/live-feed` | Real-time market ticker stream | None |
| `/api/ticker-tape` | Market summary for ticker tape | None |

**AI & Agents:**
| Endpoint | Purpose | Auth |
|----------|---------|------|
| `/api/pmbot` | Claude Haiku chatbot with watchlist context | Optional |
| `/api/generate-article` | Claude-powered article generation | Admin |
| `/api/generate-article-gemini` | Gemini fallback for article generation | Admin |
| `/api/agents/research` | Multi-agent research analysis | Optional |
| `/api/agents/flow` | Trading flow analysis agent | Optional |
| `/api/agents/ipo` | IPO analysis agent | Optional |
| `/api/agents/macro` | Macroeconomic analysis agent | Optional |

**User & Admin:**
| Endpoint | Purpose | Auth |
|----------|---------|------|
| `/api/auth/session` | Session validation / cookie sync | Supabase |
| `/api/user-watchlists` | User portfolio CRUD | Authenticated |
| `/api/alerts/subscribe` | Email alert subscription | None |
| `/api/compliance-cleanup` | Data sanitization | Admin |
| `/api/cleanup-articles` | Financial advice term removal | Admin |

## Path Aliases

`@/*` maps to `./src/*` — use `@/components/Navbar` not `../components/Navbar`.

## Design System

Dark theme with brand colors defined in `tailwind.config.ts`:
- `pm-black` (#0a0a0a) — Primary background
- `pm-charcoal` / `pm-dark` / `pm-border` — Surface layers
- `pm-green` (#00ff9d) — Positive alpha, CTAs
- `pm-purple` (#9d4edd) — Predictive elements
- `pm-red` (#ff4757) — Negative returns
- `pm-muted` (#6b7280) — Secondary text

Custom animations: `pulse-slow`, `glow`, `scan`. Glow effects for green/purple accents.

Fonts: Plus Jakarta Sans (body), JetBrains Mono (code/data).

## Key Conventions

- Use App Router patterns (server components by default, `"use client"` only when needed)
- State management via React Context (7 providers) — no Redux or Zustand
- API routes live at `src/app/api/[endpoint]/route.ts`
- Admin routes protected by `src/middleware.ts` (Supabase JWT verification, redirects to `/login`)
- Security headers configured in `next.config.js` (CSP, HSTS with preload, X-Frame-Options: DENY)
- Rate limiting applied per-IP on API endpoints (see `src/lib/security.ts`) — currently in-memory (not distributed)
- Prompt injection detection on AI endpoints (`security.ts`)
- Input sanitization via `sanitizeTopic()` and `sanitizeMessage()` before passing to LLMs

## YTD Baseline System

YTD returns are calculated against hardcoded Dec 31, 2025 closing prices in `src/data/baselines.ts`. This follows the TradingView convention of using the last trading day's close as the baseline.

- `baselines.ts` contains closing prices for 100+ tickers across 8 watchlists
- `dateUtils.ts` provides `getYTDBaselineDate()` and `getYTDBaselineYear()` helpers
- `stockService.ts` implements `calculateYTDFromBaseline()` (single stock) and `calculateWeightedYTD()` (portfolio)
- When adding new tickers, you must also add their baseline price to `baselines.ts`

## Market Data Polling

Live prices are fetched via `usePrices` hook with market-aware polling intervals:
- **Market open**: 30-second polling interval
- **Market closed**: 5-minute polling interval
- Prices are cached in-memory on the API route with matching TTLs

## Database Schema

Two main Supabase tables (see `sql/` for full DDL):

**`research_notes`** — Published research articles
- Public read access, authenticated users can insert/update/delete
- Fields: title, content, category, ticker, pmScore, etc.

**`user_portfolios`** — User-created custom watchlists
- RLS: users can only read/write their own portfolios
- JSONB `positions` array for flexible ticker lists
- Auto-updated timestamps

## Agent System

The platform includes a multi-agent architecture for specialized analysis:
- **Research Agent** (`/api/agents/research`) — Deep research analysis
- **Flow Agent** (`/api/agents/flow`) — Trading flow visualization with bubble charts, summary cards, and trade tables
- **IPO Agent** (`/api/agents/ipo`) — IPO pipeline analysis
- **Macro Agent** (`/api/agents/macro`) — Macroeconomic trend analysis

Agent UI components live in `src/components/agents/` with `AgentTabs.tsx` as the coordinator. Flow-specific visualizations are in `src/components/flow/`.

## Known Limitations

Documented in `docs/production-readiness-checklist.md`:
- **Rate limiting is in-memory** — not reliable for Vercel serverless (should migrate to Upstash Redis / Vercel KV)
- **Price cache is in-memory** — same serverless caveat
- **No automated test suite** — `npm run build` + `npm run lint` are the only checks
- **Admin auth fallback** — in development, may default to authenticated user when Supabase is unavailable
- **No observability** — no centralized error tracking or request correlation IDs
- **External API payloads are not schema-validated** — Yahoo Finance, Alpaca, CoinGecko responses are trusted

## Environment Variables

See `.env.example` for required keys. Never commit `.env` or `.env.local` files. Key services:
- `ANTHROPIC_API_KEY` — Claude API for PM Bot and article generation
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase
- `ALPACA_API_KEY_ID` / `ALPACA_API_SECRET_KEY` — Stock price data
- `COINGECKO_API_KEY` — Crypto price data (optional)
- `GEMINI_API_KEY` — Gemini fallback for article generation
- `ADMIN_EMAILS` — Comma-separated admin emails
