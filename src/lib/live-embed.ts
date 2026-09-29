/** Converte um link de vídeo do YouTube (watch, youtu.be, live, shorts) num link de embed. */
export function toYoutubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      const match = u.pathname.match(/^\/(embed|live|shorts)\/([^/]+)/);
      if (match) return `https://www.youtube.com/embed/${match[2]}`;
    }

    return null;
  } catch {
    return null;
  }
}

/** Converte um link do Spotify (episódio, show, playlist...) num link de embed. */
export function toSpotifyEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.replace(/^www\./, "").endsWith("open.spotify.com")) return null;
    if (u.pathname.startsWith("/embed/")) return url;
    return `https://open.spotify.com/embed${u.pathname}`;
  } catch {
    return null;
  }
}
