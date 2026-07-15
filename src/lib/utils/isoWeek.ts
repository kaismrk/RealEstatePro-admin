/**
 * ISO-8601 calendar-week helpers for the ad campaign week-range picker
 * (Phase ads-b-admin).
 *
 * Backend derives the authoritative starts_at/ends_at (Africa/Tunis) from the
 * booked (year, week) range; these helpers only power the admin UI: the live
 * date-range preview in the form and the "2026 W30–W33" labels in the table.
 *
 * Dates are constructed in the browser's local timezone — good enough for a
 * date-only preview (we never send timestamps, only year/week integers).
 */

/** Number of ISO weeks in a year: 52 or 53. */
export function isoWeeksInYear(year: number): number {
  // 53-week years: Jan 1 falls on Thursday, or on Wednesday in a leap year.
  const jan1Dow = new Date(year, 0, 1).getDay(); // 0 = Sunday
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return jan1Dow === 4 || (isLeap && jan1Dow === 3) ? 53 : 52;
}

/** Monday 00:00 (local) of the given ISO week. Jan 4 is always in week 1. */
export function isoWeekStart(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4);
  const dow = jan4.getDay() || 7; // ISO day-of-week 1..7, Monday = 1
  const week1Monday = new Date(year, 0, 4 - (dow - 1));
  const d = new Date(week1Monday);
  d.setDate(week1Monday.getDate() + (week - 1) * 7);
  return d;
}

/** Sunday (local) of the given ISO week. */
export function isoWeekEnd(year: number, week: number): Date {
  const d = isoWeekStart(year, week);
  d.setDate(d.getDate() + 6);
  return d;
}

/**
 * Validate a booked (year, week) range the same way the backend does:
 * weeks within 1..isoWeeksInYear(year), and end not before start.
 * Returns an error message, or null when valid.
 */
export function validateWeekRange(
  startYear: number,
  startWeek: number,
  endYear: number,
  endWeek: number
): string | null {
  for (const [year, week, label] of [
    [startYear, startWeek, "Start"],
    [endYear, endWeek, "End"],
  ] as const) {
    if (!Number.isInteger(week) || week < 1 || week > isoWeeksInYear(year)) {
      return `${label} week must be between 1 and ${isoWeeksInYear(year)} for ${year}`;
    }
  }
  if (endYear < startYear || (endYear === startYear && endWeek < startWeek)) {
    return "End week must not be before start week";
  }
  return null;
}

/** "2026 W30", "2026 W30–W33", or "2026 W52 – 2027 W2" across a year boundary. */
export function formatWeekRange(
  startYear: number,
  startWeek: number,
  endYear: number,
  endWeek: number
): string {
  if (startYear === endYear) {
    if (startWeek === endWeek) return `${startYear} W${startWeek}`;
    return `${startYear} W${startWeek}–W${endWeek}`;
  }
  return `${startYear} W${startWeek} – ${endYear} W${endWeek}`;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDay(d: Date): string {
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Live preview for the week-range picker, e.g.
 * "Mon 20 Jul 2026 00:00 → Sun 16 Aug 2026 23:59".
 * Returns null when the range is invalid.
 */
export function formatWeekRangePreview(
  startYear: number,
  startWeek: number,
  endYear: number,
  endWeek: number
): string | null {
  if (validateWeekRange(startYear, startWeek, endYear, endWeek) !== null) return null;
  const start = isoWeekStart(startYear, startWeek);
  const end = isoWeekEnd(endYear, endWeek);
  return `${formatDay(start)} 00:00 → ${formatDay(end)} 23:59`;
}
