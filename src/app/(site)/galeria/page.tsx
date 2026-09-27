import type { Metadata } from "next";
import { Eyebrow } from "@/components/site/Eyebrow";
import { AlbumCard } from "@/components/site/AlbumCard";
import { getAlbums } from "@/lib/queries/albums";

export const metadata: Metadata = { title: "Galeria" };

export default async function GaleriaPage() {
  const albums = await getAlbums();

  return (
    <section className="container-site flex flex-col gap-9 py-12 md:py-20">
      <div className="flex flex-col gap-4">
        <Eyebrow>Galeria</Eyebrow>
        <h1 className="h-section">Álbuns</h1>
      </div>

      {albums.length > 0 ? (
        <div className="grid grid-cols-2 gap-7 md:grid-cols-4">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              slug={album.slug}
              title={album.title}
              takenOn={album.takenOn}
              photoCount={album._count.photos}
            />
          ))}
        </div>
      ) : (
        <p className="text-soft">Nenhum álbum publicado por enquanto.</p>
      )}
    </section>
  );
}
