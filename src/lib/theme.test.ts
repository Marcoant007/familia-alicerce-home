import { describe, expect, it } from "vitest";
import { accentVars, DEFAULT_ACCENT, isVeryLight, luminance, onAccent } from "./theme";

describe("accent theme helpers", () => {
  it("calculates luminance for black and white", () => {
    expect(luminance("#000000")).toBe(0);
    expect(luminance("#FFFFFF")).toBe(1);
  });

  it("uses the default accent when luminance receives invalid hex", () => {
    expect(luminance("gold")).toBe(luminance(DEFAULT_ACCENT));
  });

  it("chooses a readable foreground for light and dark accents", () => {
    expect(onAccent("#FFFFFF")).toBe("#141414");
    expect(onAccent("#000000")).toBe("#FFFFFF");
  });

  it("flags very light colors", () => {
    expect(isVeryLight("#FFFFFF")).toBe(true);
    expect(isVeryLight("#000000")).toBe(false);
  });

  it("returns CSS variables for a valid accent", () => {
    expect(accentVars("#3B6FE0")).toEqual({ "--accent": "#3B6FE0", "--on-accent": "#FFFFFF" });
  });

  it("falls back to the default accent for invalid CSS values", () => {
    expect(accentVars("red")).toEqual({ "--accent": DEFAULT_ACCENT, "--on-accent": onAccent(DEFAULT_ACCENT) });
  });
});