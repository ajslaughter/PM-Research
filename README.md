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

### Pages
1. **Landing**: Hero section, features, and CTAs
2. **Portfolio (The Ledger)**: Data table with blur/reveal for guests
3. **Research (The Feed)**: Note cards with premium modal
4. **Pricing**: Observer ($25/mo) and Operator ($150/mo) tiers

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `pm-black` | `#0a0a0a` | Primary background |
| `pm-green` | `#00ff9d` | Positive alpha, CTAs |
| `pm-purple` | `#9d4edd` | Predictive elements |
| `pm-red` | `#ff4757` | Negative returns |
