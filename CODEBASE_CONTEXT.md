# PM Research - Complete Codebase Context

**Generated:** February 4, 2026
**Repository:** PM-Research
**Purpose:** Exhaustive technical documentation for AI agents and developers

---

## 1. STRUCTURE

### 1.1 Directory Tree

```
/home/user/PM-Research/
├── .env.example                    # Environment variable template
├── .eslintrc.json                  # ESLint configuration (extends next/core-web-vitals)
├── .gitignore                      # Git ignore rules
├── CODEBASE_AUDIT.md               # Previous audit document
├── DEPLOYMENT.md                   # Vercel deployment guide
├── README.md                       # Project documentation
├── next.config.js                  # Next.js configuration
├── package-lock.json               # Dependency lock file
├── package.json                    # Project manifest and dependencies
├── postcss.config.js               # PostCSS with Tailwind and Autoprefixer
├── tailwind.config.ts              # Tailwind CSS custom configuration
├── tsconfig.json                   # TypeScript strict configuration
├── vercel.json                     # Vercel deployment settings
├── docs/
│   └── ytd-baseline-audit-2026-01-28.md  # YTD baseline methodology documentation
└── src/
    ├── app/
    │   ├── globals.css             # Global CSS with Tailwind utilities
    │   ├── layout.tsx              # Root layout with context providers
    │   ├── page.tsx                # Landing page with hero, stats, features
    │   ├── admin/
    │   │   └── page.tsx            # AI research generator interface
    │   ├── api/
    │   │   ├── generate-article/
    │   │   │   └── route.ts        # Claude AI article generation endpoint
    │   │   ├── polygon/
    │   │   │   └── route.ts        # Polygon.io market data proxy
    │   │   ├── prices/
    │   │   │   └── route.ts        # Real-time price fetching (Alpaca/Yahoo/CoinGecko)
    │   │   └── stock-info/
    │   │       └── route.ts        # Stock metadata lookup endpoint
    │   ├── portfolio/
    │   │   └── page.tsx            # Portfolio view with live prices
    │   ├── pricing/
    │   │   └── page.tsx            # Subscription pricing page
    │   └── research/
    │       └── page.tsx            # Research feed page
    ├── components/
    │   ├── AdminPanel.tsx          # Floating admin controls panel
    │   ├── ErrorBoundary.tsx       # Error boundary with retry
    │   ├── Navbar.tsx              # Navigation with subscription toggle
    │   ├── PortfolioTable.tsx      # Portfolio data table with live prices
    │   ├── PremiumModal.tsx        # Subscription upsell modal
    │   ├── PricingCard.tsx         # Pricing tier card component
    │   ├── ResearchFeed.tsx        # Research notes grid with modal
    │   └── SectorBadge.tsx         # Asset class/sector badge
    ├── context/
    │   ├── AdminContext.tsx        # Composed admin provider
    │   ├── PortfolioContext.tsx    # Portfolio state management
    │   ├── ResearchContext.tsx     # Research notes state + Supabase sync
    │   ├── StockDatabaseContext.tsx # Stock metadata state
    │   └── SubscriptionContext.tsx # Subscription/demo state
    ├── data/
    │   ├── baselines.ts            # YTD baseline prices (Dec 31, 2025)
    │   └── stockDatabase.ts        # Stock metadata registry
    ├── hooks/
    │   ├── index.ts                # Hook re-exports
    │   ├── usePortfolio.ts         # Enhanced portfolio hook
    │   ├── usePrices.ts            # Price polling hook
    │   └── useResearch.ts          # Research utilities hook
    ├── lib/
    │   ├── dateUtils.ts            # YTD date calculation utilities
    │   ├── portfolios.ts           # Default portfolios and research notes
    │   └── supabase.ts             # Supabase client and operations
    └── services/
        └── stockService.ts         # YTD calculation service functions
```

### 1.2 File Purpose Index

| File | Lines | Purpose |
|------|-------|---------|
| `src/app/api/generate-article/route.ts` | 136 | POST endpoint for Claude AI article generation with system prompt |
| `src/app/api/polygon/route.ts` | 194 | GET endpoint proxying Polygon.io for aggregates, ticker details, YTD quotes |
| `src/app/api/prices/route.ts` | 338 | GET endpoint for batched price fetching with 30s server-side cache |
| `src/app/api/stock-info/route.ts` | 105 | GET endpoint for stock metadata lookup from Yahoo + Polygon |
| `src/app/layout.tsx` | ~50 | Root layout with SubscriptionProvider > AdminProvider hierarchy |
| `src/app/page.tsx` | ~200 | Landing page with hero section, stats grid, feature cards, CTAs |
| `src/app/admin/page.tsx` | ~150 | Admin interface for AI research generation with Claude |
| `src/app/portfolio/page.tsx` | ~80 | Portfolio selector with dropdown and PortfolioTable |
| `src/app/pricing/page.tsx` | ~150 | Pricing tiers with demo toggle and FAQ |
| `src/app/research/page.tsx` | ~50 | Research feed page with category filters |
| `src/components/AdminPanel.tsx` | ~700 | Floating admin panel with portfolio/research CRUD |
| `src/components/ErrorBoundary.tsx` | ~100 | Error boundary with retry and fallback UI |
| `src/components/Navbar.tsx` | ~150 | Navigation with links and subscription toggle |
| `src/components/PortfolioTable.tsx` | ~400 | Data table with live prices, KPIs, quarterly performance |
| `src/components/PremiumModal.tsx` | 70 | Modal for subscription upsell |
| `src/components/PricingCard.tsx` | 92 | Pricing tier display card |
| `src/components/ResearchFeed.tsx` | 368 | Research cards grid with full content modal |
| `src/components/SectorBadge.tsx` | 263 | Color-coded sector badge with ticker mapping |
| `src/context/AdminContext.tsx` | 139 | Composed provider + useAdmin hook |
| `src/context/PortfolioContext.tsx` | 174 | Portfolio CRUD with localStorage persistence |
| `src/context/ResearchContext.tsx` | 157 | Research CRUD with Supabase + localStorage |
| `src/context/StockDatabaseContext.tsx` | 88 | Stock database with localStorage persistence |
| `src/context/SubscriptionContext.tsx` | 56 | Demo subscription toggle state |
| `src/data/baselines.ts` | 154 | Static YTD baseline prices (Dec 31, 2025) |
| `src/data/stockDatabase.ts` | 103 | Stock metadata derived from baselines |
| `src/hooks/index.ts` | 5 | Hook re-exports |
| `src/hooks/usePortfolio.ts` | 114 | Enhanced portfolio hook with utilities |
| `src/hooks/usePrices.ts` | 221 | Price polling hook with AbortController |
| `src/hooks/useResearch.ts` | 57 | Research filtering utilities |
| `src/lib/dateUtils.ts` | 117 | YTD baseline date calculations |
| `src/lib/portfolios.ts` | 739 | Default portfolios, types, and 10 research notes |
| `src/lib/supabase.ts` | 145 | Supabase client, CRUD operations |
| `src/services/stockService.ts` | 179 | YTD calculation functions |

---

## 2. STACK

### 2.1 Framework & Runtime

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | ^14.2.0 | React framework with App Router |
| React | ^18.2.0 | UI library |
| React DOM | ^18.2.0 | React DOM renderer |
| TypeScript | ^5.0.0 | Type-safe JavaScript |
| Node.js | 20.x | Runtime (implied by Next.js 14) |

### 2.2 Dependencies

| Package | Version | Role |
|---------|---------|------|
| `next` | ^14.2.0 | **Framework** - React framework with App Router, API routes |
| `react` | ^18.2.0 | **Framework** - UI component library |
| `react-dom` | ^18.2.0 | **Framework** - React DOM rendering |
| `tailwindcss` | ^3.4.0 | **UI** - Utility-first CSS framework |
| `postcss` | ^8.4.0 | **UI** - CSS post-processor |
| `autoprefixer` | ^10.4.0 | **UI** - CSS vendor prefixing |
| `lucide-react` | ^0.400.0 | **UI** - Icon library (SVG icons) |
| `framer-motion` | ^11.0.0 | **UI** - Animation library |
| `@supabase/supabase-js` | ^2.39.0 | **Data** - Supabase PostgreSQL client |
| `typescript` | ^5.0.0 | **Dev Tooling** - TypeScript compiler |
| `@types/node` | ^20.0.0 | **Dev Tooling** - Node.js type definitions |
| `@types/react` | ^18.2.0 | **Dev Tooling** - React type definitions |
| `@types/react-dom` | ^18.2.0 | **Dev Tooling** - React DOM type definitions |
| `eslint` | ^8.0.0 | **Dev Tooling** - JavaScript linter |
| `eslint-config-next` | ^14.2.0 | **Dev Tooling** - Next.js ESLint config |

---

## 3. ARCHITECTURE

### 3.1 Routing Structure

**Router Type:** Next.js 14 App Router

| Route | File | Type | Auth | Description |
|-------|------|------|------|-------------|
| `/` | `src/app/page.tsx` | Page | None | Landing page with hero, stats, features |
| `/admin` | `src/app/admin/page.tsx` | Page | None | AI research generator (hidden) |
| `/portfolio` | `src/app/portfolio/page.tsx` | Page | None | Portfolio viewer with live prices |
| `/pricing` | `src/app/pricing/page.tsx` | Page | None | Subscription pricing tiers |
| `/research` | `src/app/research/page.tsx` | Page | None | Research feed with filters |
| `/api/generate-article` | `src/app/api/generate-article/route.ts` | API | None | Claude article generation |
| `/api/polygon` | `src/app/api/polygon/route.ts` | API | None | Polygon.io proxy |
| `/api/prices` | `src/app/api/prices/route.ts` | API | None | Price fetching with cache |
| `/api/stock-info` | `src/app/api/stock-info/route.ts` | API | None | Stock metadata lookup |

### 3.2 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │   React Pages    │───▶│   React Contexts │───▶│   localStorage   │       │
│  │  (App Router)    │    │   (State Mgmt)   │    │   (Persistence)  │       │
│  └────────┬─────────┘    └────────┬─────────┘    └──────────────────┘       │
│           │                       │                                          │
│           │  fetch()              │  Context Updates                         │
│           ▼                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                         API Routes (Next.js)                      │       │
│  │  /api/prices    /api/polygon    /api/stock-info    /api/generate  │       │
│  └────────┬────────────┬───────────────┬───────────────┬────────────┘       │
│           │            │               │               │                     │
└───────────┼────────────┼───────────────┼───────────────┼─────────────────────┘
            │            │               │               │
            ▼            ▼               ▼               ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                    │
├───────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Alpaca    │  │  Polygon.io │  │   Supabase  │  │  Anthropic  │           │
│  │  Markets    │  │  (Aggs/     │  │  (Research  │  │  (Claude    │           │
│  │  (Stocks)   │  │   Quotes)   │  │   Notes DB) │  │   API)      │           │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                                │
│  ┌─────────────┐  ┌─────────────┐                                             │
│  │  CoinGecko  │  │   Yahoo     │  (Fallbacks)                                │
│  │  (Crypto)   │  │  Finance    │                                             │
│  └─────────────┘  └─────────────┘                                             │
└───────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Authentication Flow

**No user authentication is implemented.** The application uses demo/subscription toggles:

1. **Demo Mode Toggle** (`src/context/SubscriptionContext.tsx:26-30`)
   - Toggle between "guest" and "subscriber" views
   - Controlled via navbar button or pricing page toggle
   - State: `isSubscribed: boolean`, `subscriptionTier: "guest" | "observer" | "operator"`

2. **Admin Mode** (`src/context/AdminContext.tsx:34-44`)
   - Keyboard shortcut: `Ctrl+Shift+A`
   - Enables AdminPanel floating controls
   - State: `isAdmin: boolean`

### 3.4 State Management

| State Type | Context | File | Storage Key | Persistence |
|------------|---------|------|-------------|-------------|
| Subscription | `SubscriptionContext` | `src/context/SubscriptionContext.tsx` | None | Session only |
| Admin Mode | `AdminModeContext` | `src/context/AdminContext.tsx` | None | Session only |
| Portfolios | `PortfolioContext` | `src/context/PortfolioContext.tsx` | `pm-portfolios-v4` | localStorage |
| Active Portfolio | `PortfolioContext` | `src/context/PortfolioContext.tsx` | `pm-active-portfolio` | localStorage |
| Research Notes | `ResearchContext` | `src/context/ResearchContext.tsx` | `pm-research` | localStorage + Supabase |
| Stock Database | `StockDatabaseContext` | `src/context/StockDatabaseContext.tsx` | `pm-stock-db-v2` | localStorage |
| Live Prices | Component state | `src/hooks/usePrices.ts` | None | Polling (30s cache) |

**Provider Hierarchy** (`src/app/layout.tsx`):
```tsx
<SubscriptionProvider>
  <AdminProvider>  {/* Wraps: AdminModeProvider > StockDatabaseProvider > PortfolioProvider > ResearchProvider */}
    <Navbar />
    <main>{children}</main>
    <AdminPanel />
  </AdminProvider>
</SubscriptionProvider>
```

---

## 4. DATABASE

### 4.1 Schema

**Platform:** Supabase (PostgreSQL)

#### Table: `research_notes`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | `gen_random_uuid()` | Primary key |
| `title` | text | NO | - | Article title |
| `summary` | text | NO | - | Short description |
| `full_content` | text | NO | - | Full article content (markdown) |
| `date` | text | NO | - | Publication date (YYYY-MM-DD) |
| `pm_score` | integer | NO | - | PM conviction score (0-100) |
| `category` | text | NO | - | Category enum value |
| `related_tickers` | text[] | YES | NULL | Array of ticker symbols |
| `author` | text | YES | NULL | Author name |
| `created_at` | timestamptz | NO | `now()` | Creation timestamp |

**Category Enum Values:** `Alpha Signal`, `Sector Analysis`, `Risk Alert`, `Deep Dive`

### 4.2 Queries

| Operation | Function | File | Line | Query |
|-----------|----------|------|------|-------|
| Fetch All | `fetchResearchNotes()` | `src/lib/supabase.ts` | 82-86 | `supabase.from('research_notes').select('*').order('date', { ascending: false })` |
| Insert | `saveResearchNote()` | `src/lib/supabase.ts` | 112-116 | `supabase.from('research_notes').insert(dbNote).select().single()` |
| Delete | `deleteResearchNote()` | `src/lib/supabase.ts` | 133-136 | `supabase.from('research_notes').delete().eq('id', id)` |

**All queries use Supabase ORM** - No raw SQL in codebase.

### 4.3 RLS Policies

**Not visible from codebase.** Based on anon key usage:
- Read: Likely allows anonymous access
- Write: Should require authentication (security concern - uses anon key)

---

## 5. COMPONENTS

### 5.1 Component Inventory

| Component | File | Props | Lines |
|-----------|------|-------|-------|
| `AdminPanel` | `src/components/AdminPanel.tsx` | None | ~700 |
| `ErrorBoundary` | `src/components/ErrorBoundary.tsx` | `children: ReactNode`, `fallback?: ReactNode`, `onError?: (error, errorInfo) => void`, `componentName?: string` | ~100 |
| `PortfolioErrorBoundary` | `src/components/ErrorBoundary.tsx` | `children: ReactNode` | ~20 |
| `Navbar` | `src/components/Navbar.tsx` | None | ~150 |
| `PortfolioTable` | `src/components/PortfolioTable.tsx` | `portfolioId: string`, `portfolioName: string`, `category?: PortfolioCategory`, `onCategoryChange?: (cat) => void`, `showCategoryFilter?: boolean` | ~400 |
| `PremiumModal` | `src/components/PremiumModal.tsx` | `isOpen: boolean`, `onClose: () => void` | 70 |
| `PricingCard` | `src/components/PricingCard.tsx` | `name: string`, `price: number`, `description: string`, `features: {text, included}[]`, `highlighted?: boolean`, `icon: ReactNode` | 92 |
| `ResearchFeed` | `src/components/ResearchFeed.tsx` | None | 368 |
| `SectorBadge` | `src/components/SectorBadge.tsx` | `sector?: string`, `ticker?: string`, `size?: 'sm' | 'md' | 'lg'`, `interactive?: boolean`, `className?: string` | 263 |
| `ResearchCard` | `src/components/ResearchFeed.tsx` | `note: ResearchNote`, `onReadClick: () => void`, `isSubscribed: boolean` | ~50 (internal) |
| `FullContentModal` | `src/components/ResearchFeed.tsx` | `note: ResearchNote | null`, `onClose: () => void` | ~130 (internal) |
| `ResearchCardSkeleton` | `src/components/ResearchFeed.tsx` | None | ~30 (internal) |

### 5.2 Component Usage Map

| Component | Used By |
|-----------|---------|
| `AdminPanel` | `src/app/layout.tsx` |
| `ErrorBoundary` | (internal wrapper) |
| `PortfolioErrorBoundary` | `src/app/portfolio/page.tsx` |
| `Navbar` | `src/app/layout.tsx` |
| `PortfolioTable` | `src/app/portfolio/page.tsx` |
| `PremiumModal` | `src/components/ResearchFeed.tsx` |
| `PricingCard` | `src/app/pricing/page.tsx` |
| `ResearchFeed` | `src/app/research/page.tsx` |
| `SectorBadge` | `src/components/PortfolioTable.tsx` |

### 5.3 Component Hierarchy

```
layout.tsx
├── Navbar
├── main
│   ├── page.tsx (Landing)
│   ├── portfolio/page.tsx
│   │   └── PortfolioErrorBoundary
│   │       └── PortfolioTable
│   │           └── SectorBadge
│   ├── research/page.tsx
│   │   └── ResearchFeed
│   │       ├── ResearchCard (x N)
│   │       ├── ResearchCardSkeleton (loading)
│   │       ├── FullContentModal
│   │       └── PremiumModal
│   ├── pricing/page.tsx
│   │   └── PricingCard (x 3)
│   └── admin/page.tsx
└── AdminPanel
```

---

## 6. HOOKS & UTILS

### 6.1 Custom Hooks

| Hook | File | Line | Signature | Purpose |
|------|------|------|-----------|---------|
| `usePrices` | `src/hooks/usePrices.ts` | 40-220 | `(tickers: string[], options?: UsePricesOptions) => UsePricesReturn` | Fetch and poll live prices with auto-refresh, abort handling |
| `usePortfolioEnhanced` | `src/hooks/usePortfolio.ts` | 42-110 | `() => UsePortfolioReturn` | Portfolio context + utility functions |
| `usePortfolio` | `src/hooks/usePortfolio.ts` | 113 | Re-export from `PortfolioContext` | Base portfolio context access |
| `useResearch` | `src/hooks/useResearch.ts` | 21-56 | `() => UseResearchReturn` | Research CRUD + filtering utilities |
| `useSubscription` | `src/context/SubscriptionContext.tsx` | 47-55 | `() => SubscriptionContextType` | Subscription state access |
| `useAdmin` | `src/context/AdminContext.tsx` | 69-109 | `() => AdminContextType` | Combined admin context access |
| `useStockDatabase` | `src/context/StockDatabaseContext.tsx` | 81-87 | `() => StockDatabaseContextType` | Stock database access |

### 6.2 Utility Functions

#### `src/services/stockService.ts`

| Function | Line | Signature | Purpose |
|----------|------|-----------|---------|
| `fetchLivePrices` | 30-34 | `(tickers: string[]) => Promise<PriceResponse>` | Fetch prices from API |
| `fetchStockMetadata` | 37-44 | `(ticker: string) => Promise<Partial<StockData> | null>` | Fetch stock info |
| `getStock` | 47-49 | `(ticker: string) => StockData | undefined` | Get stock from database |
| `stockExists` | 52-54 | `(ticker: string) => boolean` | Check if stock exists |
| `calculateYTD` | 65-72 | `(currentPrice: number, baseline: number) => number` | Calculate YTD return |
| `calculateYTDFromBaseline` | 82-89 | `(ticker: string, currentPrice: number) => number` | YTD using baselines.ts |
| `calculateWeightedYTD` | 103-135 | `(positions, livePrices, stockDb) => number` | Portfolio weighted YTD |
| `calculateWeightedDayChange` | 138-159 | `(positions, livePrices) => number` | Portfolio weighted daily change |
| `calculateAvgPmScore` | 162-178 | `(positions, stockDb) => number` | Average PM score |

#### `src/lib/dateUtils.ts`

| Function | Line | Signature | Purpose |
|----------|------|-----------|---------|
| `isWeekend` | 27-30 | `(date: Date) => boolean` | Check if date is weekend |
| `isUSMarketHoliday` | 36-39 | `(date: Date) => boolean` | Check if US market holiday |
| `getLastTradingDayOfYear` | 44-55 | `(year: number) => Date` | Get last trading day of year |
| `getYTDBaselineDate` | 61-65 | `() => Date` | Get YTD baseline date |
| `getYTDBaselineDateString` | 70-73 | `() => string` | Get baseline as YYYY-MM-DD |
| `formatDateISO` | 78-83 | `(date: Date) => string` | Format date as ISO string |
| `getYTDBaselineYear` | 88-90 | `() => number` | Get baseline year |
| `getYTDOpenYear` | 95-97 | `() => number` | Get tracking year |
| `getYTDBaselineDisplayString` | 103-108 | `() => string` | Get display string |

#### `src/data/baselines.ts`

| Function | Line | Signature | Purpose |
|----------|------|-----------|---------|
| `getBaseline` | 115-117 | `(ticker: string) => BaselinePrice | undefined` | Get baseline data |
| `getBaselinePrice` | 123-125 | `(ticker: string) => number` | Get baseline price |
| `hasBaseline` | 130-132 | `(ticker: string) => boolean` | Check if baseline exists |
| `getAllTickers` | 137-139 | `() => string[]` | Get all tracked tickers |
| `getStockTickers` | 144-146 | `() => string[]` | Get stock tickers only |
| `getCryptoTickers` | 151-153 | `() => string[]` | Get crypto tickers only |

#### `src/lib/supabase.ts`

| Function | Line | Signature | Purpose |
|----------|------|-----------|---------|
| `isValidUrl` | 13-20 | `(url: string) => boolean` | Validate URL format |
| `dbToResearchNote` | 60-73 | `(db: DbResearchNote) => ResearchNote` | Convert DB to app format |
| `fetchResearchNotes` | 76-93 | `() => Promise<ResearchNote[]>` | Fetch all research notes |
| `saveResearchNote` | 96-124 | `(note) => Promise<ResearchNote | null>` | Save research note |
| `deleteResearchNote` | 127-144 | `(id: string) => Promise<boolean>` | Delete research note |

#### `src/components/SectorBadge.tsx`

| Function | Line | Signature | Purpose |
|----------|------|-----------|---------|
| `getTickerSector` | 127-189 | `(ticker: string) => string` | Map ticker to sector |
| `getSectorColors` | 260-262 | `(sector: string) => ColorObject` | Get sector color scheme |

---

## 7. API SURFACE

### 7.1 Internal API Routes

#### POST `/api/generate-article`

| Property | Value |
|----------|-------|
| **File** | `src/app/api/generate-article/route.ts` |
| **Method** | POST |
| **Auth** | None (server-side API key) |
| **Request Body** | `{ topic: string, category?: string }` |
| **Response (200)** | `{ article: { title, summary, fullContent, pmScore, category, relatedTickers, author, date } }` |
| **Response (400)** | `{ error: "Topic is required" }` |
| **Response (500)** | `{ error: string }` |
| **External Call** | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| **Rate Limits** | Anthropic API limits apply |

#### GET `/api/polygon`

| Property | Value |
|----------|-------|
| **File** | `src/app/api/polygon/route.ts` |
| **Method** | GET |
| **Auth** | None (server-side API key) |
| **Query Params** | `endpoint: 'aggs' | 'ticker' | 'quote'`, `ticker: string`, `from?`, `to?`, `multiplier?`, `timespan?` |
| **Response (aggs)** | `{ ticker, queryCount, resultsCount, adjusted, results: AggregateBar[], status, request_id }` |
| **Response (ticker)** | `{ ticker, name, market, locale, primary_exchange, type, currency_name }` |
| **Response (quote)** | `{ ticker, baselineClose, baselineDate }` |
| **Response (400)** | `{ error: "No ticker provided" }` or `{ error: "Invalid endpoint" }` |
| **Response (404)** | `{ error: "Ticker not found" }` |
| **Response (500)** | `{ error: string }` |
| **External Call** | Polygon.io API |

#### GET `/api/prices`

| Property | Value |
|----------|-------|
| **File** | `src/app/api/prices/route.ts` |
| **Method** | GET |
| **Auth** | None (server-side API key) |
| **Query Params** | `tickers: string` (comma-separated) |
| **Response (200)** | `{ prices: Record<string, { price, change, changePercent, isLive }>, marketOpen: boolean, timestamp: string, cached: boolean }` |
| **Response (400)** | `{ error: "No tickers provided" }` |
| **External Calls** | Alpaca Markets (primary), Yahoo Finance (fallback), CoinGecko/Coinbase (crypto) |
| **Caching** | Server-side 30s TTL (`CACHE_TTL_MS = 30000`) |
| **Headers** | `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` |

#### GET `/api/stock-info`

| Property | Value |
|----------|-------|
| **File** | `src/app/api/stock-info/route.ts` |
| **Method** | GET |
| **Auth** | None (server-side API key) |
| **Query Params** | `ticker: string` |
| **Response (200)** | `{ ticker, name, assetClass, sector, yearlyClose, currentPrice, pmScore, lastUpdated }` |
| **Response (400)** | `{ error: "No ticker provided" }` |
| **Response (404)** | `{ error: "Ticker not found" }` |
| **Response (500)** | `{ error: string }` |
| **External Calls** | Yahoo Finance (metadata), Polygon.io (YTD baseline) |

### 7.2 External API Calls

| Service | Endpoint | Auth Method | File | Line |
|---------|----------|-------------|------|------|
| **Anthropic** | `https://api.anthropic.com/v1/messages` | `x-api-key` header | `src/app/api/generate-article/route.ts` | 59-77 |
| **Polygon.io** | `https://api.polygon.io/v2/aggs/ticker/{ticker}/range/...` | Query param `apiKey` | `src/app/api/polygon/route.ts` | 55 |
| **Polygon.io** | `https://api.polygon.io/v3/reference/tickers/{ticker}` | Query param `apiKey` | `src/app/api/polygon/route.ts` | 86 |
| **Polygon.io** | `https://api.polygon.io/v2/aggs/ticker/{ticker}/range/...` | Query param `apiKey` | `src/app/api/stock-info/route.ts` | 18 |
| **Alpaca** | `https://data.alpaca.markets/v2/stocks/quotes/latest` | `APCA-API-KEY-ID`, `APCA-API-SECRET-KEY` headers | `src/app/api/prices/route.ts` | 64 |
| **Alpaca** | `https://data.alpaca.markets/v2/stocks/bars/latest` | Same headers | `src/app/api/prices/route.ts` | 84 |
| **Yahoo Finance** | `https://query1.finance.yahoo.com/v8/finance/chart/{ticker}` | None (User-Agent spoofing) | `src/app/api/prices/route.ts` | 138 |
| **Yahoo Finance** | `https://query1.finance.yahoo.com/v8/finance/chart/{ticker}` | None (User-Agent spoofing) | `src/app/api/stock-info/route.ts` | 44 |
| **CoinGecko** | `https://api.coingecko.com/api/v3/simple/price` | Optional `x-cg-demo-api-key` header | `src/app/api/prices/route.ts` | 188 |
| **Coinbase** | `https://api.coinbase.com/v2/prices/BTC-USD/spot` | None | `src/app/api/prices/route.ts` | 209 |
| **Supabase** | `https://{project}.supabase.co` | Anon key | `src/lib/supabase.ts` | 40-43 |

### 7.3 Client-Side Fetch Calls

| Location | URL | Trigger | Method |
|----------|-----|---------|--------|
| `src/components/PortfolioTable.tsx:153` | `/api/prices?tickers={tickers}&ts={timestamp}` | Component mount + 30s polling | GET |
| `src/hooks/usePrices.ts:88` | `/api/prices?tickers={tickers}&ts={timestamp}` | Hook usage + configurable polling | GET |
| `src/components/AdminPanel.tsx:187` | `/api/stock-info?ticker={ticker}` | Add position action | GET |
| `src/app/admin/page.tsx:41` | `/api/generate-article` | Generate article button | POST |
| `src/services/stockService.ts:31` | `/api/prices?tickers={tickers}` | Service utility | GET |
| `src/services/stockService.ts:39` | `/api/stock-info?ticker={ticker}` | Service utility | GET |

---

## 8. TYPES

### 8.1 Type Definitions

#### `src/lib/portfolios.ts`

```typescript
// Line 5-8
export interface PortfolioPosition {
    ticker: string;
    weight: number; // Percentage (0-100)
}

// Line 11
export type PortfolioCategory = 'Magnificent 7' | 'AI Infrastructure' | 'Energy Renaissance' | 'Physical AI';

// Line 14-20
export interface Portfolio {
    id: string;
    name: string;
    description: string;
    category: PortfolioCategory;
    positions: PortfolioPosition[];
}

// Line 113-124
export interface ResearchNote {
    id: string;
    title: string;
    summary: string;
    fullContent: string;
    date: string;
    pmScore: number;
    category: "Alpha Signal" | "Sector Analysis" | "Risk Alert" | "Deep Dive";
    readTime: string;
    relatedTickers?: string[];
    author?: string;
}
```

#### `src/data/baselines.ts`

```typescript
// Line 11-15
export interface BaselinePrice {
    ticker: string;
    price: number;
    date: string;
}
```

#### `src/data/stockDatabase.ts`

```typescript
// Line 6-14
export interface StockData {
    ticker: string;
    name: string;
    assetClass: string;
    sector: string;
    yearlyClose: number;
    pmScore: number;
    lastUpdated: string;
}
```

#### `src/lib/supabase.ts`

```typescript
// Line 46-57
export interface DbResearchNote {
    id: string;
    title: string;
    summary: string;
    full_content: string;
    date: string;
    pm_score: number;
    category: string;
    related_tickers: string[] | null;
    author: string | null;
    created_at: string;
}
```

#### `src/app/api/prices/route.ts`

```typescript
// Line 6-10
interface PriceResult {
    price: number;
    change: number;
    changePercent: number;
}

// Line 12-15
interface CacheEntry {
    data: Record<string, PriceResult | null>;
    timestamp: number;
}
```

#### `src/app/api/polygon/route.ts`

```typescript
// Line 11
type PolygonEndpoint = 'aggs' | 'ticker' | 'quote';

// Line 13-22
interface AggregateBar {
    c: number;  // close
    h: number;  // high
    l: number;  // low
    o: number;  // open
    v: number;  // volume
    t: number;  // timestamp
    n?: number; // number of trades
    vw?: number; // volume weighted average price
}

// Line 24-32
interface PolygonAggsResponse {
    ticker: string;
    queryCount: number;
    resultsCount: number;
    adjusted: boolean;
    results?: AggregateBar[];
    status: string;
    request_id: string;
}

// Line 34-45
interface PolygonTickerResponse {
    ticker: string;
    name: string;
    market: string;
    locale: string;
    primary_exchange: string;
    type: string;
    currency_name: string;
    cik?: string;
    composite_figi?: string;
    share_class_figi?: string;
}
```

#### `src/hooks/usePrices.ts`

```typescript
// Line 5-10
interface PriceData {
    price: number | null;
    change: number;
    changePercent: number;
    isLive: boolean;
}

// Line 12-16
interface PriceApiResponse {
    prices: Record<string, PriceData>;
    marketOpen: boolean;
    timestamp: string;
}

// Line 18-27
interface UsePricesOptions {
    pollIntervalOpen?: number;    // Default: 30000
    pollIntervalClosed?: number;  // Default: 300000
    timeout?: number;             // Default: 10000
    enablePolling?: boolean;      // Default: true
}

// Line 29-38
interface UsePricesReturn {
    prices: Record<string, PriceData>;
    marketOpen: boolean;
    staleTickers: Set<string>;
    isLoading: boolean;
    isRefreshing: boolean;
    lastFetch: Date | null;
    error: string | null;
    refresh: () => Promise<void>;
}
```

#### `src/context/SubscriptionContext.tsx`

```typescript
// Line 6-11
interface SubscriptionContextType {
    isSubscribed: boolean;
    toggleSubscription: () => void;
    subscriptionTier: "guest" | "observer" | "operator";
    setSubscriptionTier: (tier: "guest" | "observer" | "operator") => void;
}
```

#### `src/context/PortfolioContext.tsx`

```typescript
// Line 6-21
interface PortfolioContextType {
    portfolios: Portfolio[];
    activePortfolioId: string;
    setActivePortfolioId: (id: string) => void;
    addPortfolio: (name: string, description: string, category?: PortfolioCategory) => void;
    updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
    deletePortfolio: (id: string) => void;
    addPosition: (portfolioId: string, ticker: string, weight: number) => void;
    updatePosition: (portfolioId: string, ticker: string, weight: number) => void;
    removePosition: (portfolioId: string, ticker: string) => void;
    rebalanceWeights: (portfolioId: string) => void;
}
```

#### `src/context/ResearchContext.tsx`

```typescript
// Line 7-14
interface ResearchContextType {
    researchNotes: ResearchNote[];
    addResearchNote: (note: Omit<ResearchNote, "id">) => void;
    updateResearchNote: (id: string, updates: Partial<ResearchNote>) => void;
    deleteResearchNote: (id: string) => void;
    refreshFromSupabase: () => Promise<void>;
    isLoading: boolean;
}
```

#### `src/context/StockDatabaseContext.tsx`

```typescript
// Line 6-10
interface StockDatabaseContextType {
    stockDb: Record<string, StockData>;
    addStock: (stock: StockData) => void;
    updateStock: (ticker: string, updates: Partial<StockData>) => void;
}
```

#### `src/context/AdminContext.tsx`

```typescript
// Line 11-15
interface AdminModeContextType {
    isAdmin: boolean;
    toggleAdmin: () => void;
    lastUpdated: Date | null;
}

// Line 117-138
export interface AdminContextType {
    isAdmin: boolean;
    toggleAdmin: () => void;
    researchNotes: ResearchNote[];
    addResearchNote: (note: Omit<ResearchNote, "id">) => void;
    updateResearchNote: (id: string, updates: Partial<ResearchNote>) => void;
    deleteResearchNote: (id: string) => void;
    portfolios: Portfolio[];
    activePortfolioId: string;
    setActivePortfolioId: (id: string) => void;
    addPortfolio: (name: string, description: string) => void;
    updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
    deletePortfolio: (id: string) => void;
    addPosition: (portfolioId: string, ticker: string, weight: number) => void;
    updatePosition: (portfolioId: string, ticker: string, weight: number) => void;
    removePosition: (portfolioId: string, ticker: string) => void;
    rebalanceWeights: (portfolioId: string) => void;
    stockDb: Record<string, StockData>;
    addStock: (stock: StockData) => void;
    updateStock: (ticker: string, updates: Partial<StockData>) => void;
    lastUpdated: Date | null;
}
```

#### `src/components/SectorBadge.tsx`

```typescript
// Line 191
type SectorBadgeSize = "sm" | "md" | "lg";

// Line 193-204
interface SectorBadgeProps {
    sector?: string;
    ticker?: string;
    size?: SectorBadgeSize;
    interactive?: boolean;
    className?: string;
}
```

#### `src/components/PortfolioTable.tsx`

```typescript
// Line 30-34
interface PriceApiResponse {
    prices: Record<string, { price: number | null; change: number; changePercent: number }>;
    marketOpen: boolean;
    timestamp: string;
}

// Line 45-51
interface PortfolioTableProps {
    portfolioId: string;
    portfolioName: string;
    category?: PortfolioCategory;
    onCategoryChange?: (category: PortfolioCategory) => void;
    showCategoryFilter?: boolean;
}
```

#### `src/components/PricingCard.tsx`

```typescript
// Line 7-14
export interface PricingTierProps {
    name: string;
    price: number;
    description: string;
    features: { text: string; included: boolean }[];
    highlighted?: boolean;
    icon: React.ReactNode;
}
```

#### `src/components/PremiumModal.tsx`

```typescript
// Line 7-10
interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}
```

#### `src/components/ResearchFeed.tsx`

```typescript
// Line 59-62
interface FullContentModalProps {
    note: ResearchNote | null;
    onClose: () => void;
}

// Line 64-68
interface ResearchCardProps {
    note: ResearchNote;
    onReadClick: () => void;
    isSubscribed: boolean;
}
```

#### `src/services/stockService.ts`

```typescript
// Line 15-20
export interface LivePrice {
    price: number;
    change: number;
    changePercent: number;
    isLive: boolean;
}

// Line 23-27
export interface PriceResponse {
    prices: Record<string, { price: number | null; changePercent: number }>;
    marketOpen: boolean;
    timestamp: string;
}
```

---

## 9. ENV VARS

| Variable | Files Using It | Required | Purpose |
|----------|----------------|----------|---------|
| `ANTHROPIC_API_KEY` | `src/app/api/generate-article/route.ts:4` | Yes (for AI gen) | Claude API authentication |
| `NEXT_PUBLIC_SUPABASE_URL` | `src/lib/supabase.ts:5` | Yes (for DB) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `src/lib/supabase.ts:6` | Yes (for DB) | Supabase anonymous key |
| `POLYGON_API_KEY` | `src/app/api/polygon/route.ts:7`, `src/app/api/stock-info/route.ts:7` | Yes (for prices) | Polygon.io API key |
| `ALPACA_API_KEY_ID` | `src/app/api/prices/route.ts:52` | Optional | Alpaca API key ID |
| `ALPACA_API_SECRET_KEY` | `src/app/api/prices/route.ts:53` | Optional | Alpaca API secret |
| `COINGECKO_API_KEY` | `src/app/api/prices/route.ts:179` | Optional | CoinGecko API key (rate limits) |

### `.env.example` Contents

```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 10. CONFIG

### 10.1 `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
};

module.exports = nextConfig;
```

### 10.2 `tailwind.config.ts`

```typescript
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
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "grid-pattern": "linear-gradient(...)",
                "glow-green": "radial-gradient(...)",
                "glow-purple": "radial-gradient(...)",
            },
            animation: {
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "glow": "glow 2s ease-in-out infinite alternate",
                "scan": "scan 4s ease-in-out infinite",
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
```

### 10.3 `tsconfig.json`

```json
{
    "compilerOptions": {
        "lib": ["dom", "dom.iterable", "esnext"],
        "allowJs": true,
        "skipLibCheck": true,
        "strict": true,
        "noEmit": true,
        "esModuleInterop": true,
        "module": "esnext",
        "moduleResolution": "bundler",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "jsx": "preserve",
        "incremental": true,
        "plugins": [{ "name": "next" }],
        "paths": { "@/*": ["./src/*"] }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules"]
}
```

### 10.4 `vercel.json`

```json
{
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "framework": "nextjs",
    "buildCommand": "npm run build",
    "devCommand": "npm run dev",
    "installCommand": "npm install",
    "regions": ["iad1"],
    "headers": [
        {
            "source": "/api/(.*)",
            "headers": [
                { "key": "Cache-Control", "value": "no-store, max-age=0" }
            ]
        }
    ]
}
```

### 10.5 `postcss.config.js`

```javascript
module.exports = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};
```

### 10.6 `.eslintrc.json`

```json
{
    "extends": "next/core-web-vitals"
}
```

### 10.7 Build Scripts (`package.json`)

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Development server |
| `build` | `next build` | Production build |
| `start` | `next start` | Production server |
| `lint` | `next lint` | ESLint check |

---

## 11. ISSUES

### 11.1 Hardcoded Values

| Location | Value | Risk |
|----------|-------|------|
| `src/app/api/generate-article/route.ts:67` | `model: 'claude-sonnet-4-20250514'` | Model version hardcoded |
| `src/app/api/prices/route.ts:18` | `CACHE_TTL_MS = 30 * 1000` | Cache TTL hardcoded |
| `src/components/PortfolioTable.tsx:20` | `API_TIMEOUT = 10000` | Timeout hardcoded |
| `src/app/layout.tsx:44` | `v2.1.0` | Version hardcoded in footer |
| `src/app/page.tsx:42-46` | Stats: `147%`, `89`, `2.4x`, `12` | Marketing stats hardcoded |
| `src/components/PortfolioTable.tsx:291-296` | Quarterly performance data | Historical data hardcoded |
| `src/app/api/stock-info/route.ts:97` | `pmScore: 75` | Default PM score hardcoded |
| `src/lib/supabase.ts:37-38` | Placeholder URL/key | Fallback values hardcoded |
| `src/data/baselines.ts:18-20` | `BASELINE_DATE = '2025-12-31'` | YTD baseline hardcoded |

### 11.2 Dead Code / Unused Exports

| Item | Location | Issue |
|------|----------|-------|
| `AI_Infrastructure_Portfolio` | `src/lib/portfolios.ts:23` | Exported but never imported |
| `Energy_Renaissance_Portfolio` | `src/lib/portfolios.ts:26` | Exported but never imported |
| `Physical_AI_Portfolio` | `src/lib/portfolios.ts:29` | Exported but never imported |
| `_stockDb` parameter | `src/services/stockService.ts:106` | Parameter prefixed with `_` |

### 11.3 TODO/FIXME/HACK Comments

**None found in codebase.**

### 11.4 Type Safety Issues

**No `any` types found.** TypeScript strict mode is enabled.

Type assertions present:
| Location | Assertion | Risk |
|----------|-----------|------|
| `src/lib/supabase.ts:68` | `db.category as ResearchNote['category']` | Low - string to union |
| `src/components/AdminPanel.tsx:567` | `e.target.value as ResearchCategory` | Low - select element |
| `src/context/PortfolioContext.tsx:45` | `p.category \|\| 'Magnificent 7' as PortfolioCategory` | Low - fallback |

### 11.5 Missing Error Handling

| Location | Issue |
|----------|-------|
| `src/app/api/prices/route.ts:163-168` | Empty catch for Yahoo fallback - silently fails |
| `src/components/AdminPanel.tsx:206-208` | Generic `catch (error)` without specific handling |
| `src/context/PortfolioContext.tsx:55-57` | Generic error logging, no recovery |
| `src/context/ResearchContext.tsx:33-35` | Supabase errors logged but not propagated |
| `src/context/StockDatabaseContext.tsx:32-34` | localStorage errors logged but not propagated |

### 11.6 Unhandled Promise Rejections

| Location | Issue |
|----------|-------|
| `src/hooks/usePrices.ts:159` | `fetchPrices()` called without await in useEffect |
| `src/components/PortfolioTable.tsx:222` | `fetchPrices()` called without await in useEffect |
| `src/context/ResearchContext.tsx:57` | `refreshFromSupabase()` called in init without proper error boundary |

### 11.7 Duplicated Logic

| Issue | Locations |
|-------|-----------|
| YTD calculation | `src/services/stockService.ts:65-72` and `src/services/stockService.ts:82-89` |
| API key sanitization | Repeated in multiple API routes |
| Polygon API key access | `src/app/api/polygon/route.ts:7` and `src/app/api/stock-info/route.ts:7` |

### 11.8 Security Concerns

| Issue | Location | Risk |
|-------|----------|------|
| Supabase anon key in client | `src/lib/supabase.ts` | Medium - RLS required |
| Yahoo Finance User-Agent spoofing | `src/app/api/prices/route.ts:141`, `src/app/api/stock-info/route.ts:48` | Low - TOS violation |
| No rate limiting on API routes | All `/api/*` routes | Medium - DoS risk |
| Admin mode has no authentication | `src/context/AdminContext.tsx` | Low - demo feature |
| Write operations use anon key | `src/lib/supabase.ts:112-116` | Medium - needs RLS |

### 11.9 Exposed Secrets

**No secrets found in source code.** All API keys accessed via `process.env`.

---

## 12. DEPENDENCIES

### 12.1 Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^14.2.0 | React framework with App Router, API routes, SSR |
| `react` | ^18.2.0 | UI component library with hooks |
| `react-dom` | ^18.2.0 | React DOM rendering |

### 12.2 UI

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^3.4.0 | Utility-first CSS framework |
| `postcss` | ^8.4.0 | CSS post-processor for Tailwind |
| `autoprefixer` | ^10.4.0 | CSS vendor prefixing |
| `lucide-react` | ^0.400.0 | SVG icon library (400+ icons) |
| `framer-motion` | ^11.0.0 | Animation library for React |

### 12.3 Data

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | ^2.39.0 | Supabase PostgreSQL client |

### 12.4 Auth

**No auth packages.** Demo mode only.

### 12.5 Dev Tooling

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.0.0 | TypeScript compiler |
| `@types/node` | ^20.0.0 | Node.js type definitions |
| `@types/react` | ^18.2.0 | React type definitions |
| `@types/react-dom` | ^18.2.0 | React DOM type definitions |
| `eslint` | ^8.0.0 | JavaScript/TypeScript linter |
| `eslint-config-next` | ^14.2.0 | Next.js ESLint configuration |

---

## Summary

| Metric | Value |
|--------|-------|
| Total Files | ~45 |
| Total Directories | ~17 |
| TypeScript Files | 28 |
| React Components | 8 (+ 3 internal) |
| API Routes | 4 |
| Pages | 5 |
| Custom Hooks | 7 |
| Context Providers | 5 |
| External Integrations | 7 |
| Environment Variables | 7 |
| NPM Dependencies | 17 |
| Lines of Code | ~6,500 |
| Dead Code Items | 3 |
| Security Concerns | 5 |
| Missing Error Handlers | 5 |

---

*Generated: February 4, 2026*
