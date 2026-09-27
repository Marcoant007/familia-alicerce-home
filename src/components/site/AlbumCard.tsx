import Link from "next/link";

export function AlbumCard({
  slug,
  title,
  takenOn,
  photoCount,
}: {
  slug: string;
  title: string;
  takenOn: Date | null;
  photoCount: number;
}) {
  return (
    <Link href={`/galeria/${slug}`} className="flex flex-col gap-3">
      <div className="aspect-4/3 rounded-3xl bg-sand" />
      <div className="flex flex-col gap-0.5">
        <h3 className="text-lg font-extrabold">{title}</h3>
        <p className="text-sm text-soft">
          {takenOn
            ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "America/Sao_Paulo" }).format(
                takenOn
              )
            : null}
          {takenOn && photoCount ? " · " : null}
          {photoCount > 0 ? `${photoCount} ${photoCount === 1 ? "foto" : "fotos"}` : null}
        </p>
      </div>
    </Link>
  );
}
