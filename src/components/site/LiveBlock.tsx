import { Button } from "@/components/site/Button";
import { formatEventMoment } from "@/lib/format";
import { toYoutubeEmbedUrl, toSpotifyEmbedUrl } from "@/lib/live-embed";

export function LiveBlock({
  videoUrl,
  audioUrl,
  liveAt,
}: {
  videoUrl: string | null;
  audioUrl: string | null;
  liveAt: Date | null;
}) {
  if (!videoUrl) return null;

  const embedUrl = toYoutubeEmbedUrl(videoUrl);
  const audioEmbedUrl = audioUrl ? toSpotifyEmbedUrl(audioUrl) : null;

  return (
    <div className="container-site flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="h-section">Culto ao vivo</h2>
        {liveAt ? <p className="text-[15px] text-soft">{formatEventMoment(liveAt)}</p> : null}
      </div>

      {embedUrl ? (
        <div className="aspect-video w-full overflow-hidden rounded-[28px] bg-ink">
          <iframe
            src={embedUrl}
            title="Culto ao vivo"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <Button variant="accent" className="self-start" render={<a href={videoUrl} target="_blank" rel="noopener noreferrer" />}>
          Assistir no YouTube
        </Button>
      )}

      {audioEmbedUrl ? (
        <iframe
          src={audioEmbedUrl}
          title="Culto no Spotify"
          className="h-[152px] w-full rounded-2xl"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      ) : audioUrl ? (
        <Button
          variant="outline"
          className="self-start"
          render={<a href={audioUrl} target="_blank" rel="noopener noreferrer" />}
        >
          Ouvir no Spotify
        </Button>
      ) : null}
    </div>
  );
}
