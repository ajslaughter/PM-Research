# PM Research

**Predictive Modeling Research** - An institutional-grade stock research platform delivering model portfolios and AI-powered analysis.

## Live Demo

Visit the deployed site at your Vercel URL.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Language**: TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

### Model Portfolios
Six curated model portfolios with hypothetical positions:
- **PM Research Portfolio**: Mag 7 (NVDA, MSFT, AAPL, GOOGL, AMZN, META, TSLA) + Bitcoin
- **Innovation Portfolio**: High-growth tech & space (RKLB, SMCI, VRT, AVGO, IONQ)
- **Robotics Portfolio**: Automation & robotics (ISRG, FANUY, PATH)
- **AI Infrastructure Portfolio**: Data centers & compute (IREN, CORZ, CRWV, APLD, NBIS)
- **Energy Renaissance Portfolio**: Nuclear & power infrastructure (CEG, OKLO, VRT, BWXT)
- **Physical AI Portfolio**: Robotics & embodied AI (ISRG, TER, RKLB, TSLA)

### PM Score System
Proprietary ranking system (0-100) combining momentum, fundamentals, and predictive signals. Higher scores indicate stronger conviction.

### Live Market Data
- **Real-Time Prices**: Yahoo Finance API for stocks, CoinGecko for crypto (30s polling when market open, 5min when closed)
- **YTD Returns**: Calculated from previous year's last trading day (TradingView standard)

### Research Hub ("The Feed")
Institutional-grade research notes categorized as:
- **Alpha Signal**: High-conviction opportunity alerts
- **Sector Analysis**: Deep industry coverage
- **Risk Alert**: Position warnings and risk management
- **Deep Dive**: Comprehensive thesis reports

### PM Research Bot
AI-powered research reports and analysis on demand (Operator tier feature).

### Subscription Tiers
- **Observer** ($25/mo): Research hub access, weekly analysis, PM Score methodology
- **Operator** ($150/mo): Full model portfolio access, PM Research Bot, automated reports

### Demo Mode
Use the navbar toggle to switch between **Guest** and **Subscriber** views and preview the full experience.

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, stats, features, and CTAs |
| Model Portfolios | `/portfolio` | Portfolio selector with position tables and live prices |
| Research | `/research` | The Feed - research hub with filterable articles |
| Pricing | `/pricing` | Subscription tiers with FAQ and demo toggle |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── prices/         # Live price fetching (Yahoo + CoinGecko)
│   │   ├── polygon/        # Polygon.io API integration
│   │   └── stock-info/     # Stock metadata endpoint
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Landing page
│   ├── portfolio/page.tsx  # Model portfolios
│   ├── research/page.tsx   # The Feed (research hub)
│   └── pricing/page.tsx    # Subscription tiers
├── components/
│   ├── Navbar.tsx          # Navigation with subscription toggle
│   ├── PortfolioTable.tsx  # Data table with live prices
│   ├── ResearchFeed.tsx    # Research cards grid
│   ├── PremiumModal.tsx    # Deep dive article modal
│   ├── PricingCard.tsx     # Pricing tier card
│   ├── SectorBadge.tsx     # Sector badge component
│   ├── ErrorBoundary.tsx   # Error handling wrapper
│   └── AdminPanel.tsx      # Admin controls
├── context/
│   ├── AdminContext.tsx    # Composed provider
│   ├── PortfolioContext.tsx    # Portfolio state management
│   ├── ResearchContext.tsx     # Research state management
│   ├── StockDatabaseContext.tsx # Stock metadata
│   └── SubscriptionContext.tsx # Subscription state
├── hooks/
│   ├── usePrices.ts        # Price polling hook
│   ├── usePortfolio.ts     # Portfolio utilities
│   └── useResearch.ts      # Research utilities
├── services/
│   └── stockService.ts     # YTD calculations
├── data/
│   ├── stockDatabase.ts    # Stock metadata registry
│   └── baselines.ts        # YTD baseline prices
└── lib/
    ├── dateUtils.ts        # YTD baseline utilities
    └── portfolios.ts       # Default portfolios & research notes
```

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `pm-black` | `#0a0a0a` | Primary background |
| `pm-green` | `#00ff9d` | Positive alpha, CTAs |
| `pm-purple` | `#9d4edd` | Predictive elements |
| `pm-red` | `#ff4757` | Negative returns |

## Disclaimer

Model portfolio performance is hypothetical. Past performance does not guarantee future results. PM Research provides research content and model portfolios—not personalized investment advice.
