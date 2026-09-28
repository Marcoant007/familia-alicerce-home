import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatDateBadge,
  formatEventMoment,
  formatEventRange,
  formatRelative,
  formatServiceLabel,
  formatServiceTime,
  getNextService,
} from "./format";

describe("event date formatting", () => {
  it("formats an event on one day in Sao Paulo time", () => {
    expect(formatEventRange(new Date("2026-10-04T01:00:00Z"), new Date("2026-10-04T02:30:00Z")))
      .toBe("Sáb 03/10, 22h → 23h30");
  });

  it("shows the next day when an event crosses midnight in Sao Paulo", () => {
    expect(formatEventRange(new Date("2026-10-04T01:00:00Z"), new Date("2026-10-04T03:00:00Z")))
      .toBe("Sáb 03/10, 22h → Dom 04/10, 0h");
  });

  it("formats a single moment and its date badge in Sao Paulo time", () => {
    const date = new Date("2026-10-04T01:00:00Z");

    expect(formatEventMoment(date)).toBe("sáb 03/10, 22h");
    expect(formatDateBadge(date)).toEqual({ day: "03", month: "OUT" });
  });
});

describe("service formatting and selection", () => {
  afterEach(() => vi.useRealTimers());

  it("formats a wall-clock time without converting its timezone", () => {
    const service = { weekday: 3, startsAt: new Date("1970-01-01T19:30:00Z") };

    expect(formatServiceTime(service.startsAt)).toBe("19h30");
    expect(formatServiceLabel(service)).toBe("Quarta-feira, 19h30");
  });

  it("chooses the closest service later today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-27T12:00:00Z"));
    const sundayService = { id: "sunday", weekday: 0, startsAt: new Date("1970-01-01T18:00:00Z") };
    const mondayService = { id: "monday", weekday: 1, startsAt: new Date("1970-01-01T10:00:00Z") };

    expect(getNextService([mondayService, sundayService])).toBe(sundayService);
  });

  it("wraps to next week's service when today's service has passed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-28T02:00:00Z"));
    const sundayService = { id: "sunday", weekday: 0, startsAt: new Date("1970-01-01T18:00:00Z") };
    const tuesdayService = { id: "tuesday", weekday: 2, startsAt: new Date("1970-01-01T10:00:00Z") };

    expect(getNextService([sundayService, tuesdayService])).toBe(tuesdayService);
  });

  it("returns null when there are no services", () => {
    expect(getNextService([])).toBeNull();
  });

  it("formats recent relative times", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-27T12:00:00Z"));

    expect(formatRelative(new Date("2026-09-27T11:53:00Z"))).toBe("há 7 min");
  });
});