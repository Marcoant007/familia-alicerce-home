import { afterEach, describe, expect, it, vi } from "vitest";
import { buildIcs } from "./ics";

const createEvent = (overrides: Record<string, unknown> = {}) => ({
  id: "event-123",
  title: "Culto, família; noite\\final\nextra",
  startsAt: new Date("2026-10-04T01:00:00Z"),
  endsAt: new Date("2026-10-04T03:00:00Z"),
  location: "Templo, sede; centro",
  description: "Celebração\\comunitária\nEntrada franca",
  ...overrides,
}) as unknown as Parameters<typeof buildIcs>[0];

describe("buildIcs", () => {
  afterEach(() => vi.useRealTimers());

  it("builds a calendar event with UTC dates and escaped text", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-27T12:00:00Z"));

    const calendar = buildIcs(createEvent());

    expect(calendar).toContain("BEGIN:VCALENDAR\r\n");
    expect(calendar).toContain("UID:event-123@familiaalicerce");
    expect(calendar).toContain("DTSTAMP:20260927T120000Z");
    expect(calendar).toContain("DTSTART:20261004T010000Z");
    expect(calendar).toContain("DTEND:20261004T030000Z");
    expect(calendar).toContain("SUMMARY:Culto\\, família\\; noite\\\\final\\nextra");
    expect(calendar).toContain("LOCATION:Templo\\, sede\\; centro");
    expect(calendar).toContain("DESCRIPTION:Celebração\\\\comunitária\\nEntrada franca");
    expect(calendar).toContain("END:VCALENDAR");
  });

  it("omits empty optional location and description", () => {
    const calendar = buildIcs(createEvent({ location: null, description: null }));

    expect(calendar).not.toContain("LOCATION:");
    expect(calendar).not.toContain("DESCRIPTION:");
  });
});