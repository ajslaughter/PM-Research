# PM Research

**Predictive Modeling Research** — An institutional-grade stock research platform delivering model portfolios, AI-powered analysis, and real-time market data. Built with Next.js 14 and deployed on Vercel.

## Live Demo

Visit the deployed site at [pmresearch.vercel.app](https://pmresearch.vercel.app)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3.4 |
| **Animation** | Framer Motion 11 |
| **Icons** | Lucide React |
| **Database & Auth** | Supabase (PostgreSQL + Row-Level Security) |
| **AI** | Anthropic Claude (PM Bot & article generation), Google Gemini (fallback) |
| **Market Data** | Yahoo Finance, CoinGecko, Polygon.io, Alpaca Markets |
| **Deployment** | Vercel (auto-deploy on push) |

## Getting Started

### Prerequisites

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

See `.env.example` for the full list of required and optional keys (Anthropic, Supabase, Alpaca, CoinGecko, Gemini).

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

### Model Portfolios
Four curated model portfolios with hypothetical positions:
- **9 MAGS**: Mag 7 (NVDA, MSFT, AAPL, GOOGL, AMZN, META, TSLA) + Bitcoin + AVGO
- **Robotics Portfolio**: Automation & robotics (ISRG, FANUY, PATH)
- **AI Infrastructure Portfolio**: Data centers & compute (IREN, CORZ, CRWV, APLD, NBIS)
- **Energy Renaissance Portfolio**: Nuclear & power infrastructure (CEG, OKLO, VRT, BWXT)

### PM Score System
Proprietary ranking system (0-100) combining momentum, fundamentals, and predictive signals. Higher scores indicate stronger conviction.

### Live Market Data
- **Real-Time Prices**: Yahoo Finance API for stocks, CoinGecko for crypto (30s polling when market open, 5min when closed)
- **YTD Returns**: Calculated from previous year's last trading day (TradingView standard)

### Research Hub ("The Feed")
Institutional-grade research notes categorized as:
- **Sector Analysis**: Deep industry and sector coverage
- **Risk Assessment**: Risk evaluation and structural analysis
- **Deep Dive**: Comprehensive thesis reports and in-depth research

### PM Research Bot
AI-powered conversational research assistant built on Claude Haiku 3.5. Ask questions about stocks, sectors, and market trends and get on-demand analysis.

### Admin Panel
Protected admin interface for managing research articles, generating AI content, and running compliance cleanup. Secured behind Supabase auth with email-based admin verification.

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, stats, features, and CTAs |
| Model Portfolios | `/portfolio` | Portfolio selector with position tables and live prices |
| Research | `/research` | The Feed — research hub with filterable articles |
| PM Bot | `/pmbot` | Conversational AI research assistant |
| Pricing | `/pricing` | Subscription tiers and FAQ |
| Login | `/login` | Supabase authentication |
| Admin | `/admin` | Protected admin panel (requires auth) |

## API Routes

| Endpoint | Description |
|----------|-------------|
| `/api/prices` | Live price fetching (Yahoo Finance + CoinGecko) |
| `/api/stock-info` | Stock metadata lookup |
| `/api/polygon` | Polygon.io market data integration |
| `/api/pmbot` | Claude Haiku conversational AI |
| `/api/generate-article` | Claude-powered article generation |
| `/api/generate-article-gemini` | Gemini fallback article generation |
| `/api/auth/session` | Session validation |
| `/api/compliance-cleanup` | Compliance data sanitization (admin) |
| `/api/cleanup-articles` | Article content normalization (admin) |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/session/          # Session validation endpoint
│   │   ├── prices/                # Live price fetching (Yahoo + CoinGecko)
│   │   ├── polygon/               # Polygon.io API integration
│   │   ├── stock-info/            # Stock metadata endpoint
│   │   ├── pmbot/                 # Claude Haiku conversational AI
│   │   ├── generate-article/      # Claude article generation
│   │   ├── generate-article-gemini/ # Gemini fallback generation
│   │   ├── compliance-cleanup/    # Compliance data sanitization
│   │   └── cleanup-articles/      # Article content normalization
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Landing page
│   ├── middleware.ts              # Auth middleware for protected routes
│   ├── portfolio/page.tsx         # Model portfolios
│   ├── research/page.tsx          # The Feed (research hub)
│   ├── pmbot/page.tsx             # PM Bot conversational AI
│   ├── pricing/page.tsx           # Subscription tiers
│   ├── login/page.tsx             # Authentication
│   └── admin/page.tsx             # Admin panel (protected)
├── components/
│   ├── Navbar.tsx                 # Navigation with demo toggle
│   ├── PortfolioTable.tsx         # Data table with live prices
│   ├── ResearchFeed.tsx           # Research cards grid with filters
│   ├── AdminPanel.tsx             # Admin controls for articles
│   ├── PremiumModal.tsx           # Article detail modal
│   ├── PricingCard.tsx            # Pricing tier card
│   ├── SectorBadge.tsx            # Sector badge component
│   └── ErrorBoundary.tsx          # Error handling wrapper
├── context/
│   ├── AdminContext.tsx           # Admin state (articles, generation)
│   ├── PortfolioContext.tsx       # Portfolio selection & data state
│   ├── ResearchContext.tsx        # Research articles & filtering state
│   ├── StockDatabaseContext.tsx   # Stock metadata registry
│   └── SubscriptionContext.tsx    # Subscription mode toggle
├── hooks/
│   ├── usePrices.ts              # Real-time price polling
│   ├── usePortfolio.ts           # Portfolio utilities
│   ├── useResearch.ts            # Research filtering utilities
│   └── index.ts                  # Barrel export
├── lib/
│   ├── portfolios.ts             # Portfolio data & research notes
│   ├── security.ts               # Auth verification, rate limiting
│   ├── supabase.ts               # Supabase client initialization
│   ├── dateUtils.ts              # YTD baseline utilities
│   └── middleware.ts             # Edge middleware helpers
├── services/
│   └── stockService.ts           # YTD return calculations
└── data/
    ├── stockDatabase.ts          # Stock metadata registry
    └── baselines.ts              # YTD baseline prices

sql/
└── fix-rls-policies.sql          # Supabase RLS security policies

docs/
└── ytd-baseline-audit-2026-01-28.md  # YTD calculation audit trail
```

## Security

- **Authentication**: Supabase auth with JWT tokens; admin email verification
- **Row-Level Security**: Supabase RLS policies restrict write access to authenticated users
- **Security Headers**: CSP, HSTS, X-Frame-Options (DENY), X-Content-Type-Options, X-XSS-Protection, Permissions-Policy
- **Rate Limiting**: Per-IP rate limiting on API endpoints
- **Protected Routes**: Auth middleware guards `/admin` routes

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `pm-black` | `#0a0a0a` | Primary background |
| `pm-green` | `#00ff9d` | Positive alpha, CTAs |
| `pm-purple` | `#9d4edd` | Predictive elements |
| `pm-red` | `#ff4757` | Negative returns |

## Deployment

Deployed on Vercel with auto-deploy on push. See [DEPLOYMENT.md](DEPLOYMENT.md) for the full setup guide including environment variables, custom domains, and alternative hosting options.

## Disclaimer

Model portfolio performance is hypothetical. Past performance does not guarantee future results. PM Research provides research content and model portfolios—not personalized investment advice. PM Scores reflect research depth and thesis development, not return predictions. Always conduct your own research before making investment decisions.
