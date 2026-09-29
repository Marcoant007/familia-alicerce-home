import Image from "next/image";
import type { Ministry } from "@/generated/prisma/client";
import { Button } from "@/components/site/Button";

export function MinistryCard({ ministry }: { ministry: Ministry }) {
  const whatsappUrl = ministry.whatsapp
    ? `https://wa.me/${ministry.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Olá! Quero fazer parte do ministério ${ministry.name}.`
      )}`
    : null;

  return (
    <article id={ministry.slug} className="flex flex-col gap-3 overflow-hidden rounded-3xl border border-line bg-card">
      {ministry.coverPath ? (
        <div className="relative h-45 w-full bg-sand">
          <Image
            src={ministry.coverPath}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            quality={90}
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="flex flex-col gap-3 p-8">
        <h3 className="text-xl font-extrabold">{ministry.name}</h3>
        {ministry.description ? <p className="text-[15px] leading-[1.55] text-soft">{ministry.description}</p> : null}
        {ministry.schedule ? <p className="label-caps text-soft">{ministry.schedule}</p> : null}
        {whatsappUrl ? (
          <Button
            variant="outline"
            className="mt-2 self-start px-6 py-3 text-[15px]"
            render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
          >
            Quero fazer parte
          </Button>
        ) : null}
      </div>
    </article>
  );
}
