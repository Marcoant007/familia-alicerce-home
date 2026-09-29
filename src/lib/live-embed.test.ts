import { describe, expect, it } from "vitest";
import { toYoutubeEmbedUrl, toSpotifyEmbedUrl } from "./live-embed";

describe("toYoutubeEmbedUrl", () => {
  it("converts a watch URL", () => {
    expect(toYoutubeEmbedUrl("https://www.youtube.com/watch?v=abc123")).toBe(
      "https://www.youtube.com/embed/abc123"
    );
  });

  it("converts a youtu.be short URL", () => {
    expect(toYoutubeEmbedUrl("https://youtu.be/abc123")).toBe("https://www.youtube.com/embed/abc123");
  });

  it("converts a /live/ URL", () => {
    expect(toYoutubeEmbedUrl("https://www.youtube.com/live/abc123")).toBe(
      "https://www.youtube.com/embed/abc123"
    );
  });

  it("converts a /shorts/ URL", () => {
    expect(toYoutubeEmbedUrl("https://www.youtube.com/shorts/abc123")).toBe(
      "https://www.youtube.com/embed/abc123"
    );
  });

  it("keeps an already-embed URL working", () => {
    expect(toYoutubeEmbedUrl("https://www.youtube.com/embed/abc123")).toBe(
      "https://www.youtube.com/embed/abc123"
    );
  });

  it("returns null for a non-YouTube URL", () => {
    expect(toYoutubeEmbedUrl("https://example.com/watch?v=abc123")).toBeNull();
  });

  it("returns null for an invalid URL", () => {
    expect(toYoutubeEmbedUrl("not a url")).toBeNull();
  });
});

describe("toSpotifyEmbedUrl", () => {
  it("converts an episode link", () => {
    expect(toSpotifyEmbedUrl("https://open.spotify.com/episode/abc123")).toBe(
      "https://open.spotify.com/embed/episode/abc123"
    );
  });

  it("keeps an already-embed URL working", () => {
    expect(toSpotifyEmbedUrl("https://open.spotify.com/embed/episode/abc123")).toBe(
      "https://open.spotify.com/embed/episode/abc123"
    );
  });

  it("returns null for a non-Spotify URL", () => {
    expect(toSpotifyEmbedUrl("https://example.com/episode/abc123")).toBeNull();
  });

  it("returns null for an invalid URL", () => {
    expect(toSpotifyEmbedUrl("not a url")).toBeNull();
  });
});
