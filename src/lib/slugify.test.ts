import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("converts accented Portuguese text to a lowercase slug", () => {
    expect(slugify("  Reunião de Oração  ")).toBe("reuniao-de-oracao");
  });

  it("collapses punctuation and whitespace into one hyphen", () => {
    expect(slugify("Louvor & Mídia / Kids")).toBe("louvor-midia-kids");
  });

  it("removes leading and trailing separators", () => {
    expect(slugify("---Grupo de Jovens---")).toBe("grupo-de-jovens");
  });

  it("returns an empty slug when the input has no letters or numbers", () => {
    expect(slugify("!!! ...")).toBe("");
  });
});