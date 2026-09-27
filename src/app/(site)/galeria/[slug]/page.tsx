import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lightbox } from "@/components/site/Lightbox";
import { getAlbumBySlug } from "@/lib/queries/albums";

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
      </div>

      <Lightbox photos={album.photos} />
    </section>
  );
}
