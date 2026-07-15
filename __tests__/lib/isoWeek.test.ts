import { describe, it, expect } from "vitest";
import {
  isoWeeksInYear,
  isoWeekStart,
  isoWeekEnd,
  validateWeekRange,
  formatWeekRange,
  formatWeekRangePreview,
} from "@/lib/utils/isoWeek";

function ymd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

describe("isoWeeksInYear", () => {
  it("returns 53 for years where Jan 1 is a Thursday (2026)", () => {
    expect(isoWeeksInYear(2026)).toBe(53);
  });

  it("returns 53 for leap years where Jan 1 is a Wednesday (2020)", () => {
    expect(isoWeeksInYear(2020)).toBe(53);
  });

  it("returns 52 for ordinary years (2025, 2027)", () => {
    expect(isoWeeksInYear(2025)).toBe(52);
    expect(isoWeeksInYear(2027)).toBe(52);
  });
});

describe("isoWeekStart / isoWeekEnd", () => {
  it("computes Monday of 2026 W30 as 20 July 2026 (plan's canonical example)", () => {
    expect(ymd(isoWeekStart(2026, 30))).toBe("2026-07-20");
  });

  it("computes Sunday of 2026 W33 as 16 August 2026", () => {
    expect(ymd(isoWeekEnd(2026, 33))).toBe("2026-08-16");
  });

  it("handles W1 starting in the previous calendar year (2026 W1 → Mon 29 Dec 2025)", () => {
    expect(ymd(isoWeekStart(2026, 1))).toBe("2025-12-29");
  });

  it("handles the last week of a 53-week year (2026 W53 → Mon 28 Dec 2026)", () => {
    expect(ymd(isoWeekStart(2026, 53))).toBe("2026-12-28");
    expect(ymd(isoWeekEnd(2026, 53))).toBe("2027-01-03");
  });

  it("always returns a Monday / Sunday pair", () => {
    for (const [y, w] of [
      [2026, 1],
      [2026, 30],
      [2026, 53],
      [2027, 10],
    ] as const) {
      expect(isoWeekStart(y, w).getDay()).toBe(1); // Monday
      expect(isoWeekEnd(y, w).getDay()).toBe(0); // Sunday
    }
  });
});

describe("validateWeekRange", () => {
  it("accepts a valid same-year range", () => {
    expect(validateWeekRange(2026, 30, 2026, 33)).toBeNull();
  });

  it("accepts a single-week range", () => {
    expect(validateWeekRange(2026, 30, 2026, 30)).toBeNull();
  });

  it("accepts a year-boundary range (2026 W52 → 2027 W2)", () => {
    expect(validateWeekRange(2026, 52, 2027, 2)).toBeNull();
  });

  it("rejects an inverted range", () => {
    expect(validateWeekRange(2026, 33, 2026, 30)).toMatch(/before start/);
    expect(validateWeekRange(2027, 1, 2026, 52)).toMatch(/before start/);
  });

  it("rejects week 53 in a 52-week year (2027)", () => {
    expect(validateWeekRange(2027, 53, 2027, 53)).toMatch(/between 1 and 52/);
  });

  it("accepts week 53 in a 53-week year (2026)", () => {
    expect(validateWeekRange(2026, 53, 2026, 53)).toBeNull();
  });

  it("rejects week 0 and non-integer weeks", () => {
    expect(validateWeekRange(2026, 0, 2026, 2)).not.toBeNull();
    expect(validateWeekRange(2026, 1.5, 2026, 2)).not.toBeNull();
  });
});

describe("formatWeekRange", () => {
  it("formats a same-year range as '2026 W30–W33'", () => {
    expect(formatWeekRange(2026, 30, 2026, 33)).toBe("2026 W30–W33");
  });

  it("collapses a single week to '2026 W30'", () => {
    expect(formatWeekRange(2026, 30, 2026, 30)).toBe("2026 W30");
  });

  it("formats a year-boundary range with both years", () => {
    expect(formatWeekRange(2026, 52, 2027, 2)).toBe("2026 W52 – 2027 W2");
  });
});

describe("formatWeekRangePreview", () => {
  it("renders the live date-range preview for 2026 W30–W33", () => {
    expect(formatWeekRangePreview(2026, 30, 2026, 33)).toBe(
      "Mon 20 Jul 2026 00:00 → Sun 16 Aug 2026 23:59"
    );
  });

  it("returns null for an invalid range", () => {
    expect(formatWeekRangePreview(2026, 33, 2026, 30)).toBeNull();
    expect(formatWeekRangePreview(2027, 53, 2027, 53)).toBeNull();
  });
});
