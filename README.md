# PM Research

**Predictive Modeling Research** - A premium stock analysis platform with institutional-grade aesthetics.

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
│   ├── portfolio/page.tsx  # The Ledger (portfolio)
│   ├── research/page.tsx   # The Feed (research hub)
│   └── pricing/page.tsx    # Subscription tiers
├── components/
│   ├── Navbar.tsx          # Navigation with toggle
│   ├── PortfolioTable.tsx  # Data table with live prices
│   ├── ResearchFeed.tsx    # Research cards grid
│   ├── SectorBadge.tsx     # Sector badge component
│   ├── ErrorBoundary.tsx   # Error handling wrapper
│   └── AdminPanel.tsx      # Admin controls
├── context/
│   ├── AdminContext.tsx    # Composed provider
│   ├── PortfolioContext.tsx    # Portfolio CRUD
│   ├── ResearchContext.tsx     # Research management
│   ├── StockDatabaseContext.tsx # Stock metadata
│   └── SubscriptionContext.tsx # Global auth state
├── hooks/
│   ├── usePrices.ts        # Price polling hook
│   ├── usePortfolio.ts     # Portfolio utilities
│   └── useResearch.ts      # Research utilities
├── services/
│   └── stockService.ts     # YTD calculations
├── data/
│   └── stockDatabase.ts    # Stock metadata registry
└── lib/
    ├── dateUtils.ts        # YTD baseline utilities
    └── portfolios.ts       # Default portfolios & research
```

## Features

### Subscription Toggle
Use the navbar button to toggle between **Guest** and **Subscriber** views.

### Live Market Data
- **Real-Time Prices**: Integrated Yahoo Finance API to fetch live data for portfolio assets (30s polling when market open, 5min when closed).
- **Dynamic Returns**: Automatically calculates YTD return based on the last trading day of the previous year (TradingView standard).

### Pages
1. **Landing**: Hero section, features, and CTAs
2. **Portfolio (PM Research Portfolio)**: 
   - **Assets**: Magnificent 7 (NVDA, MSFT, AAPL, GOOGL, AMZN, META, TSLA) + Bitcoin.
   - **Metrics**: Track YTD Performance, Quarterly breakdowns, and PM Sentiment Scores.
   - **Security**: Blurred view for non-subscribers.
3. **Research (The Feed)**: 
   - **Deep Dive UI**: Premium modal with clean typography, "Key Takeaways", and "Related Assets".
   - **Content**: Institutional-grade analysis with Bull/Bear cases.
4. **Pricing**: Observer ($25/mo) and Operator ($150/mo) tiers

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `pm-black` | `#0a0a0a` | Primary background |
| `pm-green` | `#00ff9d` | Positive alpha, CTAs |
| `pm-purple` | `#9d4edd` | Predictive elements |
| `pm-red` | `#ff4757` | Negative returns |
