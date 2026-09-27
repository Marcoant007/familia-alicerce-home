import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { isEditor, getActor } from "@/lib/auth-and-audit";
import { getAlbums } from "@/lib/queries/albums";
import { getUpcomingEvents } from "@/lib/queries/events";
import { Panel } from "@/components/admin/Panel";
import { AlbumDialog } from "@/components/admin/AlbumDialog";

export const metadata: Metadata = { title: "Galeria" };

export default async function GaleriaAdminPage() {
  const actor = await getActor();
  const editor = isEditor(actor);
  const [albums, events] = await Promise.all([getAlbums(), getUpcomingEvents(50)]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Galeria</h1>
        {editor ? <AlbumDialog events={events} /> : null}
      </div>

      {albums.length === 0 ? (
        <Panel>
          <p className="text-soft">Nenhum álbum criado ainda.</p>
        </Panel>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {albums.map((album) => (
            <Link key={album.id} href={`/backstage/galeria/${album.id}`} className="flex flex-col gap-2">
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-sand">
                {album.coverPath ? (
                  <Image src={album.coverPath} alt="" fill sizes="240px" className="object-cover" />
                ) : null}
              </div>
              <p className="font-bold">{album.title}</p>
              <p className="text-sm text-soft">{album._count.photos} fotos</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
