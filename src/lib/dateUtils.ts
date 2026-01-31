/**
 * Date utilities for YTD baseline calculations
 *
 * TradingView Standard: YTD calculations use December 31 of the previous year
 * as the baseline (displayed as "2026 Open" in their UI terminology).
 */

/**
 * US Market holidays (NYSE/NASDAQ) - static list for common holidays
 * Note: Some holidays like Thanksgiving vary by year
 */
const FIXED_HOLIDAYS: Record<string, string[]> = {
  // MM-DD format for fixed-date holidays
  '01-01': ['New Year\'s Day'],
  '07-04': ['Independence Day'],
  '12-25': ['Christmas Day'],
};

/**
 * Check if a date falls on a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Check if a date is a known US market holiday
 * Note: This is a simplified check for common fixed holidays
 */
export function isUSMarketHoliday(date: Date): boolean {
  const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return monthDay in FIXED_HOLIDAYS;
}

/**
 * Get the last trading day of December for a given year
 * This accounts for weekends and known holidays
 */
export function getLastTradingDayOfYear(year: number): Date {
  // Start from December 31
  const date = new Date(year, 11, 31); // Month is 0-indexed

  // Walk backwards until we find a trading day
  while (isWeekend(date) || isUSMarketHoliday(date)) {
    date.setDate(date.getDate() - 1);
  }

  return date;
}

/**
 * Get the YTD baseline date for the current year
 * Returns December 31 (or last trading day) of the previous year
 */
export function getYTDBaselineDate(): Date {
  const now = new Date();
  const previousYear = now.getFullYear() - 1;
  return getLastTradingDayOfYear(previousYear);
}

/**
 * Get the YTD baseline date as a string in YYYY-MM-DD format
 */
export function getYTDBaselineDateString(): string {
  const date = getYTDBaselineDate();
  return formatDateISO(date);
}

/**
 * Format a date as YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the year label for the YTD baseline (e.g., "2025" for Dec 31, 2025)
 */
export function getYTDBaselineYear(): number {
  return getYTDBaselineDate().getFullYear();
}

/**
 * Get the "Open" year label for display (e.g., "2026 Open" when baseline is Dec 31, 2025)
 */
export function getYTDOpenYear(): number {
  return getYTDBaselineDate().getFullYear() + 1;
}

/**
 * Format a display string for the baseline date (e.g., "vs Dec 31, 2025")
 */
export function getYTDBaselineDisplayString(): string {
  const date = getYTDBaselineDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `vs ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Export a computed constant for the current YTD baseline
// This will be evaluated at module load time and cached
export const YTD_BASELINE_DATE = getYTDBaselineDateString();
export const YTD_BASELINE_YEAR = getYTDBaselineYear();
export const YTD_OPEN_YEAR = getYTDOpenYear();
