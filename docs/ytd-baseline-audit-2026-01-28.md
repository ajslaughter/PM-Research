# YTD Baseline Audit Log

**Date:** January 29, 2026
**Change:** Reverted YTD baseline from January 2, 2026 to December 31, 2025 (TradingView standard)

## Summary

All YTD calculations now use the **December 31, 2025 close price** as the anchor to align with TradingView's YTD calculation methodology.

Formula: `YTD Return = (current / dec_31_close - 1) * 100`, rounded to 2 decimals

## Baseline Prices by Symbol (Dec 31, 2025)

| Symbol   | Dec 31, 2025 Close |
|----------|-------------------|
| NVDA     | 189.84            |
| MSFT     | 484.39            |
| AAPL     | 272.26            |
| GOOGL    | 316.90            |
| AMZN     | 231.34            |
| META     | 662.72            |
| TSLA     | 457.80            |
| BTC-USD  | 88742.00          |
| RKLB     | 70.63             |
| SMCI     | 29.96             |
| VRT      | 169.47            |
| AVGO     | 352.78            |
| IONQ     | 46.01             |
| ISRG     | 566.78            |
| ABB      | 73.51             |
| FANUY    | 19.65             |
| PATH     | 16.50             |

## Files Modified

1. **src/data/stockDatabase.ts**
   - Changed `YTD_START` constant from `'2026-01-02'` to `'2025-12-31'`
   - Reverted all `yearlyClose` values to Dec 31, 2025 close prices
   - Updated comments to reflect TradingView standard baseline date

2. **src/services/stockService.ts**
   - Updated comments to reflect Dec 31, 2025 baseline
   - No functional changes (calculations remain the same)

3. **src/components/PortfolioTable.tsx**
   - Changed table header from "2025 Close" to "2026 Open"
   - Removed "PM Score" column from the table

## Rationale

TradingView and most financial platforms calculate YTD returns using the **last trading day of the previous year** (December 31, 2025) as the baseline, rather than the first trading day of the current year. This change aligns PM Research with industry-standard YTD calculations.

## Impact Analysis

### Portfolio YTD Calculations

With the Dec 31, 2025 baseline, YTD returns will now match TradingView and other financial platforms. This provides consistency for users comparing PM Research performance against external sources.

### Example Calculation

For NVDA with Dec 31, 2025 close = $189.84:
- If current price = $188.52
- YTD Return = (188.52 / 189.84 - 1) * 100 = **-0.70%**

---

*Updated by YTD Baseline Audit - January 29, 2026*
