import { describe, expect, it } from "vitest";
import { getEventImage } from "./event-images";

describe("getEventImage", () => {
  it("prefers the event's uploaded cover", () => {
    expect(getEventImage({ coverPath: "https://cdn.example.test/event.webp", category: { slug: "jovens" } }))
      .toBe("https://cdn.example.test/event.webp");
  });

  it("uses the category image when no cover exists", () => {
    expect(getEventImage({ coverPath: null, category: { slug: "conferencia" } }))
      .toBe("/culto-images/conferencia.png");
  });

  it("returns null when the event has no category", () => {
    expect(getEventImage({ coverPath: null, category: null })).toBeNull();
  });

  it("returns null for categories without a configured image", () => {
    expect(getEventImage({ coverPath: null, category: { slug: "casais" } })).toBeNull();
  });
});