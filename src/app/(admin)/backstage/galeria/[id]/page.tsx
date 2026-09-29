import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getActor, isEditor } from "@/lib/auth-and-audit";
import { getAlbumByIdAdmin } from "@/lib/queries/albums";
import { getUpcomingEvents } from "@/lib/queries/events";
import { deleteAlbum } from "@/lib/actions/albums";
import { driveEmbedUrl, listDriveFolderImages } from "@/lib/google-drive";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AlbumDialog } from "@/components/admin/AlbumDialog";
import { SaveSuccessDialog } from "@/components/admin/SaveSuccessDialog";
import { DriveGallery } from "@/components/site/DriveGallery";

export const metadata: Metadata = { title: "Álbum" };

export default async function AlbumAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActor();
  const editor = isEditor(actor);

  const [album, events] = await Promise.all([getAlbumByIdAdmin(id), getUpcomingEvents(50)]);
  if (!album) notFound();

  const embedUrl = album.driveUrl ? driveEmbedUrl(album.driveUrl) : null;
  const images = album.driveUrl ? await listDriveFolderImages(album.driveUrl) : [];

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <SaveSuccessDialog messages={{ update: "Álbum atualizado!" }} />
      </Suspense>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">{album.title}</h1>
          {album.event ? <p className="text-soft">Evento: {album.event.title}</p> : null}
        </div>
        {editor ? (
          <div className="flex items-center gap-3">
            <AlbumDialog
              album={album}
              events={events}
              trigger="Editar"
              triggerClassName="rounded-full border-2 border-ink px-6 py-3 text-[15px] font-extrabold"
            />
            <DeleteButton
              itemId={album.id}
              itemTitle={album.title}
              itemLabel="álbum"
              listHref="/backstage/galeria"
              deleteAction={deleteAlbum}
            />
          </div>
        ) : null}
      </div>

      {embedUrl ? (
        <div className="flex flex-col gap-3">
          <a
            href={album.driveUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 text-sm font-bold text-soft hover:text-ink"
          >
            Abrir no Google Drive <ExternalLink size={14} strokeWidth={2} aria-hidden="true" />
          </a>
          {images.length > 0 ? (
            <DriveGallery images={images} />
          ) : (
            <iframe
              src={embedUrl}
              title={`Fotos de ${album.title}`}
              className="h-[70vh] w-full rounded-2xl border-2 border-line"
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[#D6D3CB] bg-paper px-6 py-16 text-center">
          <p className="font-bold text-ink">Esse álbum ainda não tem um link do Google Drive.</p>
          {editor ? (
            <AlbumDialog
              album={album}
              events={events}
              trigger="Adicionar link"
              triggerClassName="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper"
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
