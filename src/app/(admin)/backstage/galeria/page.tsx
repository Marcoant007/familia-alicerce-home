import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { FolderOpen } from "lucide-react";
import { isEditor, getActor } from "@/lib/auth-and-audit";
import { getAlbums } from "@/lib/queries/albums";
import { getUpcomingEvents } from "@/lib/queries/events";
import { Panel } from "@/components/admin/Panel";
import { AlbumDialog } from "@/components/admin/AlbumDialog";
import { SaveSuccessDialog } from "@/components/admin/SaveSuccessDialog";

export const metadata: Metadata = { title: "Galeria" };

export default async function GaleriaAdminPage() {
  const actor = await getActor();
  const editor = isEditor(actor);
  const [albums, events] = await Promise.all([getAlbums(), getUpcomingEvents(50)]);

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <SaveSuccessDialog messages={{ update: "Álbum atualizado!" }} />
      </Suspense>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Galeria</h1>
        {editor ? <AlbumDialog events={events} triggerClassName="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper" /> : null}
      </div>

      {albums.length === 0 ? (
        <Panel>
          <p className="text-soft">Nenhum álbum criado ainda.</p>
        </Panel>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {albums.map((album) => (
            <Link key={album.id} href={`/backstage/galeria/${album.id}`} className="flex flex-col gap-3">
              <div
                className={
                  "relative flex aspect-4/3 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl text-soft " +
                  (album.coverPath ? "bg-sand" : "border-2 border-dashed border-[#D6D3CB] bg-paper")
                }
              >
                {album.coverPath ? (
                  <Image src={album.coverPath} alt="" fill sizes="240px" quality={90} className="object-cover" />
                ) : (
                  <>
                    <FolderOpen size={26} strokeWidth={1.5} aria-hidden="true" />
                    <span className="text-xs font-bold">{album.driveUrl ? "Ver no Drive" : "Sem link ainda"}</span>
                  </>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="font-bold">{album.title}</p>
                {!album.driveUrl ? <p className="text-sm font-bold text-danger">Falta o link do Drive</p> : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
