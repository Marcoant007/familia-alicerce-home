import Link from "next/link";
import Image from "next/image";
import { FolderOpen } from "lucide-react";

export function AlbumCard({
  slug,
  title,
  takenOn,
  coverPath,
}: {
  slug: string;
  title: string;
  takenOn: Date | null;
  coverPath: string | null;
}) {
  return (
    <Link href={`/galeria/${slug}`} className="flex flex-col gap-3">
      <div className="relative flex aspect-4/3 flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl bg-sand text-soft">
        {coverPath ? (
          <Image src={coverPath} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" quality={90} className="object-cover" />
        ) : (
          <FolderOpen size={28} strokeWidth={1.5} aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-lg font-extrabold">{title}</h3>
        {takenOn ? (
          <p className="text-sm text-soft">
            {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "America/Sao_Paulo" }).format(takenOn)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
