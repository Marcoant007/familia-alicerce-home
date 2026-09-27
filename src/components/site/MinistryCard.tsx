import type { Ministry } from "@/generated/prisma/client";

export function MinistryCard({ ministry }: { ministry: Ministry }) {
  return (
    <article id={ministry.slug} className="flex flex-col gap-3 rounded-3xl border border-line bg-card p-8">
      <h3 className="text-xl font-extrabold">{ministry.name}</h3>
      {ministry.description ? <p className="text-[15px] leading-[1.55] text-soft">{ministry.description}</p> : null}
      {ministry.schedule ? <p className="label-caps text-soft">{ministry.schedule}</p> : null}
    </article>
  );
}
