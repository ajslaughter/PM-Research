# PM Score Methodology

## Overview

The PM Score is a proprietary ranking system that rates stocks and research notes on a **0-100 scale**. Higher scores indicate stronger conviction based on the platform's analytical models. It serves as the primary quality and conviction indicator across PM Research.

> "The PM Score is our proprietary ranking system that combines momentum, fundamental, and predictive signals into a single 0-100 score. Higher scores indicate stronger conviction based on our models."
> — PM Research Pricing FAQ

## Scoring Components

The PM Score combines three signal categories:

| Component | Description |
|-----------|-------------|
| **Momentum Signals** | Recent price trends and technical momentum indicators |
| **Fundamental Analysis** | Core company metrics such as earnings, growth, and valuation |
| **Predictive Signals** | Forward-looking, AI-powered indicators of opportunity |

The exact weighting formula for combining these components is proprietary.

## Score Interpretation

| Range | Conviction Level | Description |
|-------|-----------------|-------------|
| 90-100 | Strong Conviction | Highest-confidence positions backed by deep research |
| 85-89 | High Conviction | Well-supported thesis with strong signals |
| 75-84 | Moderate Conviction | Solid thesis with some uncertainty or risk factors |
| Below 75 | Speculative | Higher-risk positions with developing thesis |

In the UI, scores >= 90 are highlighted in green to denote strong conviction. Scores below 90 use the default text color.

## Where PM Scores Are Applied

### 1. Stock Holdings

Every stock in the database (`src/data/stockDatabase.ts`) carries a `pmScore` field. These scores are manually assigned and updated, with a `lastUpdated` timestamp indicating when the score was last reviewed.

Example entries:

| Ticker | Name | PM Score |
|--------|------|----------|
| NVDA | NVIDIA Corporation | 98 |
| MSFT | Microsoft Corp | 94 |
| AVGO | Broadcom Inc. | 93 |
| GOOGL | Alphabet Inc. | 92 |
| META | Meta Platforms Inc. | 91 |
| TSLA | Tesla Inc. | 85 |
| PATH | UiPath Inc. | 75 |

### 2. Research Notes

Each research article (`src/lib/portfolios.ts`) also receives a PM Score reflecting the depth and conviction of the analysis:

| Category | Typical Score Range | Example |
|----------|-------------------|---------|
| Deep Dive | 91-96 | "AI Infrastructure: The Next Wave of CAPEX" (96) |
| Sector Analysis | 82-94 | "CoWoS Crunch: The Packaging Bottleneck" (91) |
| Risk Assessment | 72-80 | "Risk Assessment: Automation Sector Headwinds" (72) |

### 3. Portfolio Aggregation

Portfolios display an **Average PM Score** as a KPI metric. This is calculated in `src/services/stockService.ts` using the `calculateAvgPmScore()` function:

```typescript
export function calculateAvgPmScore(
  positions: Array<{ ticker: string; weight: number }>,
  stockDb: Record<string, StockData>
): number {
  let totalScore = 0;
  let count = 0;

  for (const position of positions) {
    const stock = stockDb[position.ticker.toUpperCase()];
    if (stock) {
      totalScore += stock.pmScore;
      count++;
    }
  }

  return count > 0 ? totalScore / count : 0;
}
```

**Key detail:** The portfolio average is a **simple (unweighted) mean** across all holdings. Position sizes do not influence the average PM Score — a 5% position and a 30% position contribute equally.

## What PM Scores Are Not

Per the platform disclaimer:

> "PM Scores reflect research depth and thesis development, not return predictions."

Specifically, PM Scores:

- **Do not predict returns** or future price movements
- **Are not weighted** by portfolio position size in the aggregate calculation
- **Are not automatically calculated** — they are manually assessed and assigned
- **Are not adjusted in real-time** — they are static values updated periodically

## Implementation Reference

| File | Role |
|------|------|
| `src/data/stockDatabase.ts` | Central registry; defines `pmScore` per stock |
| `src/services/stockService.ts` | `calculateAvgPmScore()` for portfolio aggregation |
| `src/lib/portfolios.ts` | Research notes with `pmScore` fields |
| `src/components/PortfolioTable.tsx` | Displays average PM Score as a KPI card |
| `src/components/ResearchFeed.tsx` | Shows PM Score on research cards and in detail modals |
| `src/app/pricing/page.tsx` | Public-facing PM Score definition in FAQ |
