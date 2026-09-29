import Image from "next/image";
import { cn } from "cn";

type NoticeCardData = {
  title: string;
  body: string | null;
  imagePath: string | null;
  category: { name: string } | null;
};

/** `compact`: usado na prévia estreita do painel (360px) — imagem menor, texto truncado. */
export function NoticeCard({
  announcement,
  compact = false,
}: {
  announcement: NoticeCardData;
  compact?: boolean;
}) {
  return (
    <article className={cn("flex rounded-3xl border border-line bg-card", compact ? "gap-4 p-4" : "gap-7 p-6")}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-2xl bg-sand",
          compact ? "h-20 w-20" : "h-45 w-50"
        )}
      >
        {announcement.imagePath ? (
          <Image
            src={announcement.imagePath}
            alt=""
            fill
            sizes={compact ? "80px" : "200px"}
            quality={90}
            className="object-cover"
          />
        ) : null}
      </div>
      <div className={cn("flex min-w-0 flex-col justify-center", compact ? "gap-1" : "gap-2.5")}>
        {announcement.category ? (
          <p className={cn("label-caps text-soft", compact && "text-[10px] tracking-[2px]")}>
            {announcement.category.name}
          </p>
        ) : null}
        <h3 className={cn("font-extrabold", compact ? "line-clamp-1 text-base" : "text-[22px]")}>
          {announcement.title}
        </h3>
        {announcement.body ? (
          <p
            className={cn(
              "text-soft",
              compact ? "line-clamp-2 text-sm leading-[1.4]" : "text-[15px] leading-[1.55]"
            )}
          >
            {announcement.body}
          </p>
        ) : null}
      </div>
    </article>
  );
}
