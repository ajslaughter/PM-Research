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
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Landing page
│   ├── portfolio/page.tsx  # The Ledger (portfolio)
│   ├── research/page.tsx   # The Feed (research hub)
│   └── pricing/page.tsx    # Subscription tiers
├── components/
│   ├── Navbar.tsx          # Navigation with toggle
│   ├── PortfolioTable.tsx  # Data table component
│   └── ResearchFeed.tsx    # Research cards
├── context/
│   └── SubscriptionContext.tsx  # Global auth state
└── lib/
    └── mockData.ts         # Mock portfolio/research data
```

## Features

### Subscription Toggle
Use the navbar button to toggle between **Guest** and **Subscriber** views.

### Live Market Data
- **Real-Time Prices**: Integrated `yahoo-finance2` to fetch live data for portfolio assets every 60 seconds.
- **Dynamic Returns**: Automatically calculates YTD return based on a fixed "2026 Open" entry price strategy.

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
