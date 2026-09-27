import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActor, isEditor } from "@/lib/auth-and-audit";
import { getAlbumByIdAdmin } from "@/lib/queries/albums";
import { deleteAlbum } from "@/lib/actions/albums";
import { PhotoGrid } from "@/components/admin/PhotoGrid";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Álbum" };

export default async function AlbumAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActor();
  const editor = isEditor(actor);

  const album = await getAlbumByIdAdmin(id);
  if (!album) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">{album.title}</h1>
          {album.event ? <p className="text-soft">Evento: {album.event.title}</p> : null}
        </div>
        {editor ? (
          <DeleteButton
            itemId={album.id}
            itemTitle={album.title}
            itemLabel="álbum"
            listHref="/backstage/galeria"
            deleteAction={deleteAlbum}
          />
        ) : null}
      </div>

      <PhotoGrid
        albumId={album.id}
        photos={album.photos}
        coverPath={album.coverPath}
        canManage={editor}
        actorId={actor.id}
      />
    </div>
  );
}
