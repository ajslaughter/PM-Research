/**
 * NYSE / Nasdaq trading calendar.
 *
 * Regular session: 9:30 AM – 4:00 PM ET, Monday–Friday, closed on exchange
 * holidays, 1:00 PM close on early-close days.
 * Source: https://www.nyse.com/markets/hours-calendars (checked 2026-11-08).
 * Add the next year's dates each December.
 */

const HOLIDAYS = new Set<string>([
    // 2026
    "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25",
    "2026-06-19", "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
    // 2027
    "2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26", "2027-05-31",
    "2027-06-18", "2027-07-05", "2027-09-06", "2027-11-25", "2027-12-24",
]);

const EARLY_CLOSES = new Set<string>([
    "2026-11-27", "2026-12-24",
    "2027-11-26",
]);

const OPEN_MINUTES = 9 * 60 + 30;
const CLOSE_MINUTES = 16 * 60;
const EARLY_CLOSE_MINUTES = 13 * 60;

interface EasternParts {
    date: string; // YYYY-MM-DD in New York
    weekday: number; // 0 = Sunday
    minutes: number; // minutes since midnight in New York
}

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function easternParts(at: Date): EasternParts {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(at);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    return {
        date: `${get("year")}-${get("month")}-${get("day")}`,
        weekday: WEEKDAYS[get("weekday")] ?? 0,
        minutes: Number(get("hour")) * 60 + Number(get("minute")),
    };
}

/** True when the exchange has a regular session on this New York calendar date. */
export function isTradingDay(date: string, weekday: number): boolean {
    return weekday !== 0 && weekday !== 6 && !HOLIDAYS.has(date);
}

function closeMinutesFor(date: string): number {
    return EARLY_CLOSES.has(date) ? EARLY_CLOSE_MINUTES : CLOSE_MINUTES;
}

/** Is the regular session open right now? */
export function isMarketOpen(at: Date = new Date()): boolean {
    const et = easternParts(at);
    if (!isTradingDay(et.date, et.weekday)) return false;
    return et.minutes >= OPEN_MINUTES && et.minutes < closeMinutesFor(et.date);
}

/** Today's holiday or early-close note, if any (for status labels). */
export function getSessionNote(at: Date = new Date()): string | null {
    const et = easternParts(at);
    if (HOLIDAYS.has(et.date)) return "Exchange holiday";
    if (EARLY_CLOSES.has(et.date)) return "Closes early at 1:00 PM ET";
    return null;
}

/**
 * The next regular-session open as an absolute Date, or null if the market
 * is open right now.
 */
export function getNextMarketOpen(at: Date = new Date()): Date | null {
    if (isMarketOpen(at)) return null;

    // Step forward a day at a time until we reach a trading day.
    const now = easternParts(at);
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
        const candidateDay = new Date(at.getTime() + dayOffset * 86_400_000);
        const et = easternParts(candidateDay);
        if (!isTradingDay(et.date, et.weekday)) continue;
        if (dayOffset === 0 && now.minutes >= OPEN_MINUTES) continue;

        // 9:30 AM New York on that date. Find the UTC instant by trying both
        // possible offsets (EST = UTC-5, EDT = UTC-4).
        const [y, m, d] = et.date.split("-").map(Number);
        for (const offsetHours of [4, 5]) {
            const candidate = new Date(Date.UTC(y, m - 1, d, 9 + offsetHours, 30));
            const check = easternParts(candidate);
            if (check.date === et.date && check.minutes === OPEN_MINUTES) return candidate;
        }
    }
    return null;
}
