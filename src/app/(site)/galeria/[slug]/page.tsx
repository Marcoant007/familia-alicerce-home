import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getAlbumBySlug } from "@/lib/queries/albums";
import { driveEmbedUrl, listDriveFolderImages } from "@/lib/google-drive";
import { DriveGallery } from "@/components/site/DriveGallery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  return { title: album?.title };
}

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  const embedUrl = album.driveUrl ? driveEmbedUrl(album.driveUrl) : null;
  if (!embedUrl) notFound();
  const images = await listDriveFolderImages(album.driveUrl!);

  return (
    <section className="container-site flex flex-col gap-9 py-12 md:py-20">
      <div className="flex flex-col gap-2">
        <h1 className="h-section">{album.title}</h1>
        {album.takenOn ? (
          <p className="text-soft">
            {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "America/Sao_Paulo" }).format(
              album.takenOn
            )}
          </p>
        ) : null}
        <a
          href={album.driveUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-2 text-sm font-bold text-soft hover:text-ink"
        >
          Abrir no Google Drive <ExternalLink size={14} strokeWidth={2} aria-hidden="true" />
        </a>
      </div>

      {images.length > 0 ? (
        <DriveGallery images={images} />
      ) : (
        <iframe
          src={embedUrl}
          title={`Fotos de ${album.title}`}
          className="h-[75vh] w-full rounded-3xl border border-line"
        />
      )}
    </section>
  );
}
