# PM Research Codebase Audit

**Generated:** February 4, 2026
**Repository:** PM-Research
**Audit Type:** Deep Technical Audit

---

## Phase 1: Structure

### 1.1 Directory Tree

```
/home/user/PM-Research/
├── .env.example                    # Environment variable template
├── .eslintrc.json                  # ESLint configuration
├── .gitignore                      # Git ignore rules
├── DEPLOYMENT.md                   # Vercel deployment guide
├── README.md                       # Project documentation
├── next.config.js                  # Next.js configuration
├── package-lock.json               # Dependency lock file
├── package.json                    # Project manifest
├── postcss.config.js               # PostCSS configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── vercel.json                     # Vercel deployment settings
├── docs/
│   └── ytd-baseline-audit-2026-01-28.md  # YTD baseline documentation
└── src/
    ├── app/
    │   ├── admin/
    │   │   └── page.tsx            # Admin research generator page
    │   ├── api/
    │   │   ├── generate-article/
    │   │   │   └── route.ts        # Claude AI article generation
    │   │   ├── polygon/
    │   │   │   └── route.ts        # Polygon.io market data proxy
    │   │   ├── prices/
    │   │   │   └── route.ts        # Real-time price fetching (Alpaca/Yahoo/CoinGecko)
    │   │   └── stock-info/
    │   │       └── route.ts        # Stock metadata lookup
    │   ├── portfolio/
    │   │   └── page.tsx            # Portfolio view page
    │   ├── pricing/
    │   │   └── page.tsx            # Pricing/subscription page
    │   ├── research/
    │   │   └── page.tsx            # Research feed page
    │   ├── globals.css             # Global styles and Tailwind imports
    │   ├── layout.tsx              # Root layout with providers
    │   └── page.tsx                # Landing page
    ├── components/
    │   ├── AdminPanel.tsx          # Floating admin controls panel
    │   ├── ErrorBoundary.tsx       # Error boundary wrapper
    │   ├── Navbar.tsx              # Navigation bar
    │   ├── PortfolioTable.tsx      # Portfolio data table with live prices
    │   ├── PremiumModal.tsx        # Subscription upsell modal
    │   ├── PricingCard.tsx         # Pricing tier card component
    │   ├── ResearchFeed.tsx        # Research notes grid with modal
    │   └── SectorBadge.tsx         # Asset class/sector badge
    ├── context/
    │   ├── AdminContext.tsx        # Composed admin provider (wraps all contexts)
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

### 1.2 File Inventory

| File | Purpose |
|------|---------|
| `.env.example` | Template for environment variables (Anthropic, Supabase keys) |
| `.eslintrc.json` | Extends `next/core-web-vitals` ESLint config |
| `.gitignore` | Excludes node_modules, .next, .env*.local, etc. |
| `DEPLOYMENT.md` | Vercel deployment instructions |
| `README.md` | Project overview, features, structure, design system |
| `next.config.js` | Next.js config with React strict mode enabled |
| `package.json` | Project dependencies and npm scripts |
| `postcss.config.js` | PostCSS with Tailwind and Autoprefixer |
| `tailwind.config.ts` | Custom colors, fonts, animations for PM Research brand |
| `tsconfig.json` | TypeScript strict mode, path aliases (@/*) |
| `vercel.json` | Vercel settings: region iad1, no-cache API headers |
| `docs/ytd-baseline-audit-2026-01-28.md` | Documentation of YTD baseline methodology change |
| `src/app/admin/page.tsx` | AI research generator UI with Claude integration |
| `src/app/api/generate-article/route.ts` | POST endpoint for Claude article generation |
| `src/app/api/polygon/route.ts` | GET endpoint proxying Polygon.io API |
| `src/app/api/prices/route.ts` | GET endpoint for batched price fetching |
| `src/app/api/stock-info/route.ts` | GET endpoint for stock metadata lookup |
| `src/app/globals.css` | Global CSS, Tailwind utilities, custom components |
| `src/app/layout.tsx` | Root layout with SubscriptionProvider, AdminProvider |
| `src/app/page.tsx` | Landing page with hero, stats, features, CTAs |
| `src/app/portfolio/page.tsx` | Portfolio selector and table view |
| `src/app/pricing/page.tsx` | Pricing tiers with demo toggle |
| `src/app/research/page.tsx` | Research feed page with category filters |
| `src/components/AdminPanel.tsx` | Floating admin panel for portfolio/research management |
| `src/components/ErrorBoundary.tsx` | Error boundary with retry functionality |
| `src/components/Navbar.tsx` | Navigation with subscription toggle |
| `src/components/PortfolioTable.tsx` | Live portfolio table with KPIs and price polling |
| `src/components/PremiumModal.tsx` | Modal prompting subscription for gated content |
| `src/components/PricingCard.tsx` | Pricing tier display card |
| `src/components/ResearchFeed.tsx` | Research notes grid with full content modal |
| `src/components/SectorBadge.tsx` | Color-coded sector/asset class badge |
| `src/context/AdminContext.tsx` | Composed provider wrapping all state contexts |
| `src/context/PortfolioContext.tsx` | Portfolio CRUD with localStorage persistence |
| `src/context/ResearchContext.tsx` | Research CRUD with Supabase + localStorage sync |
| `src/context/StockDatabaseContext.tsx` | Stock metadata with localStorage persistence |
| `src/context/SubscriptionContext.tsx` | Demo subscription toggle state |
| `src/data/baselines.ts` | Static YTD baseline prices (Dec 31, 2025) |
| `src/data/stockDatabase.ts` | Stock metadata derived from baselines |
| `src/hooks/index.ts` | Re-exports usePrices, useResearch, usePortfolio |
| `src/hooks/usePortfolio.ts` | Enhanced portfolio hook with utilities |
| `src/hooks/usePrices.ts` | Price polling hook with AbortController |
| `src/hooks/useResearch.ts` | Research filtering utilities |
| `src/lib/dateUtils.ts` | YTD baseline date calculations |
| `src/lib/portfolios.ts` | Default portfolios, research notes, types |
| `src/lib/supabase.ts` | Supabase client, CRUD operations for research |
| `src/services/stockService.ts` | YTD calculation functions |

### 1.3 Framework, Language, and Runtime Versions

| Technology | Version | Source |
|------------|---------|--------|
| Next.js | ^14.2.0 | package.json |
| React | ^18.2.0 | package.json |
| React DOM | ^18.2.0 | package.json |
| TypeScript | ^5.0.0 | package.json |
| Node.js | 20.x (implied) | Next.js 14 requirement |
| Tailwind CSS | ^3.4.0 | package.json |
| Framer Motion | ^11.0.0 | package.json |
| Supabase JS | ^2.39.0 | package.json |
| Lucide React | ^0.400.0 | package.json |
| ESLint | ^8.0.0 | package.json |
| PostCSS | ^8.4.0 | package.json |
| Autoprefixer | ^10.4.0 | package.json |

---

## Phase 2: Architecture

### 2.1 Routing Structure

**Router Type:** Next.js 14 App Router

| Route | File | Type | Description |
|-------|------|------|-------------|
| `/` | `src/app/page.tsx` | Page | Landing page |
| `/admin` | `src/app/admin/page.tsx` | Page | Research generator (hidden) |
| `/portfolio` | `src/app/portfolio/page.tsx` | Page | Portfolio viewer |
| `/pricing` | `src/app/pricing/page.tsx` | Page | Subscription pricing |
| `/research` | `src/app/research/page.tsx` | Page | Research feed |
| `/api/generate-article` | `src/app/api/generate-article/route.ts` | API Route | Claude article generation |
| `/api/polygon` | `src/app/api/polygon/route.ts` | API Route | Polygon.io proxy |
| `/api/prices` | `src/app/api/prices/route.ts` | API Route | Price fetching |
| `/api/stock-info` | `src/app/api/stock-info/route.ts` | API Route | Stock metadata |

### 2.2 Data Flow

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

### 2.3 External Service Integrations

| Service | Purpose | Auth Method | Files |
|---------|---------|-------------|-------|
| **Supabase** | Research notes database | Anon Key (public) | `src/lib/supabase.ts` |
| **Anthropic (Claude)** | AI article generation | API Key (server-only) | `src/app/api/generate-article/route.ts` |
| **Polygon.io** | Historical stock data, YTD baselines | API Key (server-only) | `src/app/api/polygon/route.ts`, `src/app/api/stock-info/route.ts` |
| **Alpaca Markets** | Real-time stock quotes (IEX feed) | API Key + Secret (server-only) | `src/app/api/prices/route.ts` |
| **Yahoo Finance** | Stock quotes fallback | None (public API) | `src/app/api/prices/route.ts`, `src/app/api/stock-info/route.ts` |
| **CoinGecko** | Crypto prices (BTC) | Optional API Key | `src/app/api/prices/route.ts` |
| **Coinbase** | Crypto prices fallback | None (public API) | `src/app/api/prices/route.ts` |
| **Vercel** | Deployment hosting | N/A | `vercel.json` |

### 2.4 Environment Variables

| Variable | Where Used | Required | Purpose |
|----------|------------|----------|---------|
| `ANTHROPIC_API_KEY` | `src/app/api/generate-article/route.ts:4` | Yes (for AI gen) | Claude API authentication |
| `NEXT_PUBLIC_SUPABASE_URL` | `src/lib/supabase.ts:5` | Yes (for DB) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `src/lib/supabase.ts:6` | Yes (for DB) | Supabase anonymous key |
| `POLYGON_API_KEY` | `src/app/api/polygon/route.ts:7`, `src/app/api/stock-info/route.ts:7` | Yes (for prices) | Polygon.io API key |
| `ALPACA_API_KEY_ID` | `src/app/api/prices/route.ts:52` | Optional | Alpaca API key ID |
| `ALPACA_API_SECRET_KEY` | `src/app/api/prices/route.ts:53` | Optional | Alpaca API secret |
| `COINGECKO_API_KEY` | `src/app/api/prices/route.ts:179` | Optional | CoinGecko API key |

### 2.5 Authentication Flow

**No user authentication is implemented.** The application uses:

1. **Demo Mode Toggle**: Client-side subscription state via `SubscriptionContext`
   - Toggle between "guest" and "subscriber" views
   - Persisted only in React state (not localStorage)
   - Controlled via navbar button or pricing page demo toggle

2. **Admin Mode**: Activated via `Ctrl+Shift+A` keyboard shortcut
   - Enables AdminPanel floating controls
   - No authentication - purely client-side toggle
   - Managed by `AdminContext`

3. **API Key Protection**: Server-side API routes protect external service keys
   - Keys sanitized to remove newlines/whitespace
   - Never exposed to client

### 2.6 State Management

| State Type | Implementation | Scope | Persistence |
|------------|----------------|-------|-------------|
| **Subscription State** | `SubscriptionContext` | Global | None (session only) |
| **Admin Mode** | `AdminContext` (AdminModeProvider) | Global | None (session only) |
| **Portfolios** | `PortfolioContext` | Global | localStorage (`pm-portfolios-v4`) |
| **Research Notes** | `ResearchContext` | Global | localStorage (`pm-research`) + Supabase |
| **Stock Database** | `StockDatabaseContext` | Global | localStorage (`pm-stock-db-v2`) |
| **Prices** | Component state / `usePrices` hook | Component | None (polling) |

**Context Provider Hierarchy:**
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

## Phase 3: Data Layer

### 3.1 Database Schema

**Platform:** Supabase (PostgreSQL)

#### Table: `research_notes`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | uuid | NO | Primary key (auto-generated) |
| `title` | text | NO | Article title |
| `summary` | text | NO | Short description |
| `full_content` | text | NO | Full article content (markdown) |
| `date` | text | NO | Publication date (YYYY-MM-DD) |
| `pm_score` | integer | NO | PM conviction score (0-100) |
| `category` | text | NO | Alpha Signal, Sector Analysis, Risk Alert, Deep Dive |
| `related_tickers` | text[] | YES | Array of related ticker symbols |
| `author` | text | YES | Author name |
| `created_at` | timestamptz | NO | Creation timestamp (auto) |

### 3.2 Database Queries

| Operation | Function | File | Raw SQL/ORM |
|-----------|----------|------|-------------|
| Fetch all research notes | `fetchResearchNotes()` | `src/lib/supabase.ts:76-93` | Supabase ORM |
| Save research note | `saveResearchNote()` | `src/lib/supabase.ts:96-124` | Supabase ORM |
| Delete research note | `deleteResearchNote()` | `src/lib/supabase.ts:127-144` | Supabase ORM |

**Query Details:**

```typescript
// Fetch all - src/lib/supabase.ts:82-86
const { data, error } = await supabase
    .from('research_notes')
    .select('*')
    .order('date', { ascending: false });

// Insert - src/lib/supabase.ts:112-116
const { data, error } = await supabase
    .from('research_notes')
    .insert(dbNote)
    .select()
    .single();

// Delete - src/lib/supabase.ts:133-136
const { error } = await supabase
    .from('research_notes')
    .delete()
    .eq('id', id);
```

### 3.3 RLS Policies

**Not visible from codebase.** Supabase RLS policies must be configured in the Supabase dashboard. Based on the code using `supabaseAnonKey`:
- Read operations likely allow anonymous access
- Write operations should be protected (currently using anon key, potential security concern)

---

## Phase 4: Component & Module Inventory

### 4.1 React Components

| Component | File | Props | Used By |
|-----------|------|-------|---------|
| `AdminPanel` | `src/components/AdminPanel.tsx` | None | `src/app/layout.tsx` |
| `ErrorBoundary` | `src/components/ErrorBoundary.tsx` | `children: ReactNode`, `fallback?: ReactNode`, `onError?: (error, errorInfo) => void`, `componentName?: string` | `src/components/ErrorBoundary.tsx` (PortfolioErrorBoundary) |
| `PortfolioErrorBoundary` | `src/components/ErrorBoundary.tsx` | `children: ReactNode` | `src/app/portfolio/page.tsx` |
| `Navbar` | `src/components/Navbar.tsx` | None | `src/app/layout.tsx` |
| `PortfolioTable` | `src/components/PortfolioTable.tsx` | `portfolioId: string`, `portfolioName: string`, `category?: PortfolioCategory`, `onCategoryChange?: (category) => void`, `showCategoryFilter?: boolean` | `src/app/portfolio/page.tsx` |
| `PremiumModal` | `src/components/PremiumModal.tsx` | `isOpen: boolean`, `onClose: () => void` | `src/components/ResearchFeed.tsx` |
| `PricingCard` | `src/components/PricingCard.tsx` | `name: string`, `price: number`, `description: string`, `features: {text, included}[]`, `highlighted?: boolean`, `icon: ReactNode` | `src/app/pricing/page.tsx` |
| `ResearchFeed` | `src/components/ResearchFeed.tsx` | None | `src/app/research/page.tsx` |
| `SectorBadge` | `src/components/SectorBadge.tsx` | `sector?: string`, `ticker?: string`, `size?: 'sm' \| 'md' \| 'lg'`, `interactive?: boolean`, `className?: string` | `src/components/PortfolioTable.tsx` |

### 4.2 Shared vs Page-Specific Components

**Shared/Reusable Components:**
- `Navbar` - Used in root layout
- `ErrorBoundary` / `PortfolioErrorBoundary` - Generic error handling
- `SectorBadge` - Reusable badge component
- `PremiumModal` - Reusable subscription prompt
- `PricingCard` - Reusable pricing display

**Page-Specific Components:**
- `AdminPanel` - Admin functionality only
- `PortfolioTable` - Portfolio page specific
- `ResearchFeed` - Research page specific

### 4.3 Custom Hooks

| Hook | File | Signature | Purpose |
|------|------|-----------|---------|
| `usePrices` | `src/hooks/usePrices.ts:40-220` | `(tickers: string[], options?: UsePricesOptions) => UsePricesReturn` | Fetch and poll live prices with auto-refresh |
| `usePortfolio` | `src/hooks/usePortfolio.ts:113` | Re-export from `PortfolioContext` | Base portfolio context access |
| `usePortfolioEnhanced` | `src/hooks/usePortfolio.ts:42-110` | `() => UsePortfolioReturn` | Portfolio context + utility functions |
| `useResearch` | `src/hooks/useResearch.ts:21-56` | `() => UseResearchReturn` | Research CRUD + filtering utilities |
| `useSubscription` | `src/context/SubscriptionContext.tsx:47-55` | `() => SubscriptionContextType` | Subscription state access |
| `useAdmin` | `src/context/AdminContext.tsx:69-109` | `() => AdminContextType` | Combined admin context access |
| `useStockDatabase` | `src/context/StockDatabaseContext.tsx:81-87` | `() => StockDatabaseContextType` | Stock database access |

### 4.4 Utility Functions

| Function | File | Signature | Purpose |
|----------|------|-----------|---------|
| `calculateYTD` | `src/services/stockService.ts:65-72` | `(currentPrice: number, baseline: number) => number` | Calculate YTD return percentage |
| `calculateYTDFromBaseline` | `src/services/stockService.ts:82-89` | `(ticker: string, currentPrice: number) => number` | YTD using baselines.ts |
| `calculateWeightedYTD` | `src/services/stockService.ts:103-135` | `(positions, livePrices, stockDb) => number` | Portfolio weighted YTD |
| `calculateWeightedDayChange` | `src/services/stockService.ts:138-159` | `(positions, livePrices) => number` | Portfolio weighted daily change |
| `calculateAvgPmScore` | `src/services/stockService.ts:162-178` | `(positions, stockDb) => number` | Average PM score |
| `fetchLivePrices` | `src/services/stockService.ts:30-34` | `(tickers: string[]) => Promise<PriceResponse>` | Fetch prices from API |
| `fetchStockMetadata` | `src/services/stockService.ts:37-44` | `(ticker: string) => Promise<Partial<StockData> \| null>` | Fetch stock info |
| `getStock` | `src/services/stockService.ts:47-49` | `(ticker: string) => StockData \| undefined` | Get stock from database |
| `stockExists` | `src/services/stockService.ts:52-54` | `(ticker: string) => boolean` | Check if stock exists |
| `isWeekend` | `src/lib/dateUtils.ts:27-30` | `(date: Date) => boolean` | Check if date is weekend |
| `isUSMarketHoliday` | `src/lib/dateUtils.ts:36-39` | `(date: Date) => boolean` | Check if US market holiday |
| `getLastTradingDayOfYear` | `src/lib/dateUtils.ts:44-55` | `(year: number) => Date` | Get last trading day of year |
| `getYTDBaselineDate` | `src/lib/dateUtils.ts:61-65` | `() => Date` | Get YTD baseline date |
| `getYTDBaselineDateString` | `src/lib/dateUtils.ts:70-73` | `() => string` | Get baseline as YYYY-MM-DD |
| `formatDateISO` | `src/lib/dateUtils.ts:78-83` | `(date: Date) => string` | Format date as ISO string |
| `getYTDBaselineDisplayString` | `src/lib/dateUtils.ts:103-108` | `() => string` | Get display string (e.g., "vs Dec 31, 2025") |
| `getBaseline` | `src/data/baselines.ts:115-117` | `(ticker: string) => BaselinePrice \| undefined` | Get baseline data |
| `getBaselinePrice` | `src/data/baselines.ts:123-125` | `(ticker: string) => number` | Get baseline price |
| `hasBaseline` | `src/data/baselines.ts:130-132` | `(ticker: string) => boolean` | Check if baseline exists |
| `getAllTickers` | `src/data/baselines.ts:137-139` | `() => string[]` | Get all tracked tickers |
| `getStockTickers` | `src/data/baselines.ts:144-146` | `() => string[]` | Get stock tickers only |
| `getCryptoTickers` | `src/data/baselines.ts:151-153` | `() => string[]` | Get crypto tickers only |
| `dbToResearchNote` | `src/lib/supabase.ts:60-73` | `(db: DbResearchNote) => ResearchNote` | Convert DB to app format |
| `fetchResearchNotes` | `src/lib/supabase.ts:76-93` | `() => Promise<ResearchNote[]>` | Fetch all research notes |
| `saveResearchNote` | `src/lib/supabase.ts:96-124` | `(note) => Promise<ResearchNote \| null>` | Save research note |
| `deleteResearchNote` | `src/lib/supabase.ts:127-144` | `(id: string) => Promise<boolean>` | Delete research note |
| `getSectorColors` | `src/components/SectorBadge.tsx:260-262` | `(sector: string) => ColorObject` | Get sector color scheme |
| `getTickerSector` | `src/components/SectorBadge.tsx:127-189` | `(ticker: string) => string` | Map ticker to sector |

### 4.5 TypeScript Types/Interfaces

| Type/Interface | File | Definition |
|---------------|------|------------|
| `PortfolioPosition` | `src/lib/portfolios.ts:5-8` | `{ ticker: string; weight: number }` |
| `PortfolioCategory` | `src/lib/portfolios.ts:11` | `'Magnificent 7' \| 'AI Infrastructure' \| 'Energy Renaissance' \| 'Physical AI'` |
| `Portfolio` | `src/lib/portfolios.ts:14-20` | `{ id, name, description, category, positions }` |
| `ResearchNote` | `src/lib/portfolios.ts:113-124` | `{ id, title, summary, fullContent, date, pmScore, category, readTime, relatedTickers?, author? }` |
| `StockData` | `src/data/stockDatabase.ts:6-14` | `{ ticker, name, assetClass, sector, yearlyClose, pmScore, lastUpdated }` |
| `BaselinePrice` | `src/data/baselines.ts:11-15` | `{ ticker, price, date }` |
| `DbResearchNote` | `src/lib/supabase.ts:46-57` | Database representation of ResearchNote |
| `PriceData` | `src/app/api/prices/route.ts:6-10` | `{ price, change, changePercent }` |
| `CacheEntry` | `src/app/api/prices/route.ts:12-15` | Server-side price cache structure |
| `PriceApiResponse` | `src/components/PortfolioTable.tsx:30-34` | `{ prices, marketOpen, timestamp }` |
| `PortfolioTableProps` | `src/components/PortfolioTable.tsx:45-51` | Component props interface |
| `PricingTierProps` | `src/components/PricingCard.tsx:7-14` | `{ name, price, description, features, highlighted?, icon }` |
| `PremiumModalProps` | `src/components/PremiumModal.tsx:7-10` | `{ isOpen, onClose }` |
| `SectorBadgeProps` | `src/components/SectorBadge.tsx:193-204` | `{ sector?, ticker?, size?, interactive?, className? }` |
| `UsePricesOptions` | `src/hooks/usePrices.ts:18-27` | Price hook configuration options |
| `UsePricesReturn` | `src/hooks/usePrices.ts:29-38` | Price hook return type |
| `UsePortfolioReturn` | `src/hooks/usePortfolio.ts:9-36` | Enhanced portfolio hook return type |
| `UseResearchReturn` | `src/hooks/useResearch.ts:7-15` | Research hook return type |
| `SubscriptionContextType` | `src/context/SubscriptionContext.tsx:6-11` | `{ isSubscribed, toggleSubscription, subscriptionTier, setSubscriptionTier }` |
| `AdminContextType` | `src/context/AdminContext.tsx:117-138` | Combined admin context interface |
| `PortfolioContextType` | `src/context/PortfolioContext.tsx:6-21` | Portfolio context interface |
| `ResearchContextType` | `src/context/ResearchContext.tsx:7-14` | Research context interface |
| `StockDatabaseContextType` | `src/context/StockDatabaseContext.tsx:6-10` | Stock database context interface |
| `PolygonEndpoint` | `src/app/api/polygon/route.ts:11` | `'aggs' \| 'ticker' \| 'quote'` |
| `AggregateBar` | `src/app/api/polygon/route.ts:13-22` | Polygon aggregate data structure |
| `PolygonAggsResponse` | `src/app/api/polygon/route.ts:24-32` | Polygon API response |
| `PolygonTickerResponse` | `src/app/api/polygon/route.ts:34-45` | Polygon ticker details response |
| `LivePrice` | `src/services/stockService.ts:15-20` | Live price data structure |
| `PriceResponse` | `src/services/stockService.ts:23-27` | Price API response structure |

---

## Phase 5: API Surface

### 5.1 Internal API Routes

#### POST `/api/generate-article`

| Property | Value |
|----------|-------|
| **File** | `src/app/api/generate-article/route.ts` |
| **Method** | POST |
| **Auth** | None (server-side API key) |
| **Request Body** | `{ topic: string, category?: string }` |
| **Response (Success)** | `{ article: ResearchNote }` |
| **Response (Error)** | `{ error: string }` |
| **External Call** | Anthropic Claude API (`claude-sonnet-4-20250514`) |

#### GET `/api/polygon`

| Property | Value |
|----------|-------|
| **File** | `src/app/api/polygon/route.ts` |
| **Method** | GET |
| **Auth** | None (server-side API key) |
| **Query Params** | `endpoint: 'aggs' \| 'ticker' \| 'quote'`, `ticker: string`, `from?`, `to?`, `multiplier?`, `timespan?` |
| **Response (aggs)** | Polygon aggregate bars |
| **Response (ticker)** | Ticker details |
| **Response (quote)** | `{ ticker, baselineClose, baselineDate }` |
| **External Call** | Polygon.io API |

#### GET `/api/prices`

| Property | Value |
|----------|-------|
| **File** | `src/app/api/prices/route.ts` |
| **Method** | GET |
| **Auth** | None (server-side API key) |
| **Query Params** | `tickers: string` (comma-separated) |
| **Response** | `{ prices: Record<string, PriceData>, marketOpen: boolean, timestamp: string, cached: boolean }` |
| **External Calls** | Alpaca Markets (primary), Yahoo Finance (fallback), CoinGecko/Coinbase (crypto) |
| **Caching** | Server-side 30s TTL |

#### GET `/api/stock-info`

| Property | Value |
|----------|-------|
| **File** | `src/app/api/stock-info/route.ts` |
| **Method** | GET |
| **Auth** | None (server-side API key) |
| **Query Params** | `ticker: string` |
| **Response** | `{ ticker, name, assetClass, sector, yearlyClose, currentPrice, pmScore, lastUpdated }` |
| **External Calls** | Yahoo Finance (metadata), Polygon.io (YTD baseline) |

### 5.2 External API Calls

| Service | Endpoint | Auth Method | Rate Limits | File |
|---------|----------|-------------|-------------|------|
| **Anthropic** | `https://api.anthropic.com/v1/messages` | `x-api-key` header | Not specified | `src/app/api/generate-article/route.ts:59-77` |
| **Polygon.io** | `https://api.polygon.io/v2/aggs/ticker/...` | Query param `apiKey` | 5 calls/min (free) | `src/app/api/polygon/route.ts:55`, `src/app/api/stock-info/route.ts:18` |
| **Polygon.io** | `https://api.polygon.io/v3/reference/tickers/...` | Query param `apiKey` | 5 calls/min (free) | `src/app/api/polygon/route.ts:86` |
| **Alpaca** | `https://data.alpaca.markets/v2/stocks/quotes/latest` | `APCA-API-KEY-ID`, `APCA-API-SECRET-KEY` headers | 200 calls/min | `src/app/api/prices/route.ts:64` |
| **Alpaca** | `https://data.alpaca.markets/v2/stocks/bars/latest` | Same as above | Same | `src/app/api/prices/route.ts:84` |
| **Yahoo Finance** | `https://query1.finance.yahoo.com/v8/finance/chart/...` | None (User-Agent spoofing) | Unofficial, rate limited | `src/app/api/prices/route.ts:138`, `src/app/api/stock-info/route.ts:44` |
| **CoinGecko** | `https://api.coingecko.com/api/v3/simple/price` | Optional `x-cg-demo-api-key` header | 30 calls/min (free) | `src/app/api/prices/route.ts:188` |
| **Coinbase** | `https://api.coinbase.com/v2/prices/BTC-USD/spot` | None | 10,000 calls/hr | `src/app/api/prices/route.ts:209` |
| **Supabase** | Project URL from env | Anon key | 100,000 requests/day (free) | `src/lib/supabase.ts` |

### 5.3 Client-Side Fetch Calls

| Trigger | URL | File | Line |
|---------|-----|------|------|
| Component mount + polling | `/api/prices?tickers={tickers}&ts={timestamp}` | `src/components/PortfolioTable.tsx` | 153 |
| Component mount + polling | `/api/prices?tickers={tickers}&ts={timestamp}` | `src/hooks/usePrices.ts` | 88 |
| Add position (admin) | `/api/stock-info?ticker={ticker}` | `src/components/AdminPanel.tsx` | 187 |
| Generate article button | `/api/generate-article` (POST) | `src/app/admin/page.tsx` | 41 |
| Service utility | `/api/prices?tickers={tickers}` | `src/services/stockService.ts` | 31 |
| Service utility | `/api/stock-info?ticker={ticker}` | `src/services/stockService.ts` | 39 |

---

## Phase 6: Config & Deployment

### 6.1 Configuration Files

#### `next.config.js`

```javascript
const nextConfig = {
    reactStrictMode: true,
};
```

#### `tailwind.config.ts`

| Property | Value |
|----------|-------|
| Content paths | `./src/pages/**/*`, `./src/components/**/*`, `./src/app/**/*` |
| Custom colors | `pm-black`, `pm-charcoal`, `pm-dark`, `pm-border`, `pm-green`, `pm-purple`, `pm-red`, `pm-text`, `pm-muted`, `pm-subtle` |
| Custom fonts | JetBrains Mono (mono), Inter (sans) |
| Custom animations | `pulse-slow`, `glow`, `scan` |
| Custom shadows | `neon-green`, `neon-purple` |

#### `tsconfig.json`

| Property | Value |
|----------|-------|
| strict | true |
| moduleResolution | bundler |
| paths | `@/*` → `./src/*` |
| target | ESNext |
| lib | DOM, DOM.Iterable, ESNext |

#### `vercel.json`

```json
{
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

#### `.env.example`

```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 6.2 Build Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Development server |
| `build` | `next build` | Production build |
| `start` | `next start` | Production server |
| `lint` | `next lint` | ESLint check |

### 6.3 CI/CD Setup

**No CI/CD configuration files detected.** Deployment relies on:
- Vercel auto-detection of Next.js
- Automatic deployment on git push (Vercel integration)
- Preview deployments for branches/PRs

### 6.4 NPM Dependencies

#### Framework & Core

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^14.2.0 | React framework |
| `react` | ^18.2.0 | UI library |
| `react-dom` | ^18.2.0 | React DOM renderer |

#### UI & Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^3.4.0 | Utility CSS framework |
| `postcss` | ^8.4.0 | CSS post-processor |
| `autoprefixer` | ^10.4.0 | CSS vendor prefixes |
| `lucide-react` | ^0.400.0 | Icon library |
| `framer-motion` | ^11.0.0 | Animation library |

#### Data & Auth

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | ^2.39.0 | Supabase client |

#### Dev Tooling

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.0.0 | TypeScript compiler |
| `@types/node` | ^20.0.0 | Node.js types |
| `@types/react` | ^18.2.0 | React types |
| `@types/react-dom` | ^18.2.0 | React DOM types |
| `eslint` | ^8.0.0 | Linter |
| `eslint-config-next` | ^14.2.0 | Next.js ESLint config |

---

## Phase 7: Issues & Debt

### 7.1 Hardcoded Values

| Location | Value | Risk |
|----------|-------|------|
| `src/app/api/generate-article/route.ts:67` | `model: 'claude-sonnet-4-20250514'` | Model version hardcoded |
| `src/app/api/prices/route.ts:18` | `CACHE_TTL_MS = 30 * 1000` | Cache TTL hardcoded |
| `src/components/PortfolioTable.tsx:20` | `API_TIMEOUT = 10000` | Timeout hardcoded |
| `src/app/layout.tsx:44` | `v2.1.0` | Version hardcoded in footer |
| `src/app/page.tsx:42-46` | Stats hardcoded (`147%`, `89`, `2.4x`, `12`) | Marketing stats hardcoded |
| `src/components/PortfolioTable.tsx:291-296` | Quarterly performance hardcoded | Historical data hardcoded |
| `src/app/api/stock-info/route.ts:97` | `pmScore: 75` | Default PM score hardcoded |
| `src/lib/supabase.ts:37-38` | Placeholder URL/key | Fallback values hardcoded |

### 7.2 No Hardcoded Secrets Found

Environment variables are properly used for all API keys. Keys are sanitized with `.trim().replace(/[\r\n]/g, '')` to prevent header injection issues.

### 7.3 Dead Code & Unused Exports

| Item | Location | Issue |
|------|----------|-------|
| `PortfolioPosition` import | `src/context/PortfolioContext.tsx:4` | Imported but type only used inline |
| `_stockDb` parameter | `src/services/stockService.ts:106` | Parameter prefixed with `_` indicating unused |
| `AI_Infrastructure_Portfolio` | `src/lib/portfolios.ts:23` | Exported array, not used anywhere |
| `Energy_Renaissance_Portfolio` | `src/lib/portfolios.ts:26` | Exported array, not used anywhere |
| `Physical_AI_Portfolio` | `src/lib/portfolios.ts:29` | Exported array, not used anywhere |

### 7.4 Duplicate Logic & Inconsistencies

| Issue | Locations | Description |
|-------|-----------|-------------|
| YTD calculation duplication | `stockService.ts:65-72`, `stockService.ts:82-89` | Two separate YTD functions |
| Price API timeout | `PortfolioTable.tsx:20`, `usePrices.ts:22` | Different default values (10000 vs configurable) |
| Supabase config check | `supabase.ts:26-29` | Validation logic repeated |
| Polygon API key access | `polygon/route.ts:7`, `stock-info/route.ts:7` | Same variable declaration in two files |

### 7.5 TODO/FIXME/HACK Comments

**No TODO, FIXME, or HACK comments found in the codebase.**

### 7.6 Missing Error Handling

| Location | Issue |
|----------|-------|
| `src/app/api/prices/route.ts:163-168` | Empty catch for Yahoo fallback - silently fails |
| `src/components/AdminPanel.tsx:206-208` | Generic `catch (error)` without specific handling |
| `src/context/PortfolioContext.tsx:55-57` | Generic error logging, no recovery |
| `src/context/ResearchContext.tsx:33-35` | Supabase errors logged but not propagated |
| `src/context/StockDatabaseContext.tsx:32-34` | localStorage errors logged but not propagated |

### 7.7 Unhandled Promise Rejections

| Location | Issue |
|----------|-------|
| `src/hooks/usePrices.ts:159` | `fetchPrices()` called without await in useEffect |
| `src/components/PortfolioTable.tsx:222` | `fetchPrices()` called without await in useEffect |
| `src/context/ResearchContext.tsx:57` | `refreshFromSupabase()` called in init without proper error boundary |

### 7.8 Type Safety Issues

**No `any` types found in source code.** TypeScript strict mode is enabled.

Potential type improvements:
| Location | Issue |
|----------|-------|
| `src/lib/supabase.ts:68` | Type assertion: `db.category as ResearchNote['category']` |
| `src/components/AdminPanel.tsx:567` | Type assertion: `e.target.value as ResearchCategory` |

### 7.9 Security Considerations

| Issue | Location | Risk Level |
|-------|----------|------------|
| Supabase anon key in client | `src/lib/supabase.ts` | Medium - RLS required |
| Yahoo Finance User-Agent spoofing | `src/app/api/prices/route.ts:141`, `src/app/api/stock-info/route.ts:48` | Low - TOS violation |
| No rate limiting on API routes | All `/api/*` routes | Medium - DoS risk |
| No CSRF protection | All API routes | Low - Next.js handles |
| Admin mode has no authentication | `AdminContext.tsx` | Low - demo feature |

### 7.10 Performance Considerations

| Issue | Location | Impact |
|-------|----------|--------|
| Multiple concurrent API calls | `PortfolioTable.tsx:296-299` | Could hit rate limits |
| No request deduplication | `usePrices.ts`, `PortfolioTable.tsx` | Same data fetched multiple times |
| Large research note list in memory | `portfolios.ts:126-738` | ~600 lines of static data |
| No pagination for research notes | `ResearchContext.tsx` | All notes loaded at once |

### 7.11 Accessibility Issues

| Issue | Location |
|-------|----------|
| Missing ARIA labels on interactive elements | `AdminPanel.tsx`, various buttons |
| Color contrast may be insufficient | PM brand colors on dark backgrounds |
| No skip navigation link | `layout.tsx` |
| Tables lack scope attributes | `PortfolioTable.tsx` |

### 7.12 Browser Compatibility

- Uses modern JavaScript features (ES2020+)
- Framer Motion requires modern browsers
- CSS Grid and Flexbox used extensively
- No polyfills configured

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Files | 43 |
| Total Directories | 17 |
| TypeScript Files | 28 |
| React Components | 8 |
| API Routes | 4 |
| Pages | 5 |
| Custom Hooks | 6 |
| Context Providers | 5 |
| External Integrations | 7 |
| Environment Variables | 7 |
| NPM Dependencies | 17 |
| Lines of Code (estimated) | ~6,500 |

---

*Audit completed: February 4, 2026*
