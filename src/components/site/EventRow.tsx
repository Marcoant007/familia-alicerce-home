import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { Button } from "@/components/site/Button";
import { EventImage } from "@/components/site/EventImage";
import { formatDateBadge, formatEventMoment } from "@/lib/format";

type EventWithCategory = Prisma.EventGetPayload<{ include: { category: true } }>;

export function EventRow({ event }: { event: EventWithCategory }) {
  const { day, month } = formatDateBadge(event.startsAt);
  return (
    <article className="flex flex-col gap-5 rounded-3xl border border-line bg-card p-5 md:flex-row md:items-center md:gap-9 md:py-5 md:pr-7 md:pl-5">
      <div className="flex gap-5 md:contents">
        <div className="relative flex h-[100px] w-[140px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sand text-xs font-bold text-soft md:h-[140px] md:w-[220px]">
          <EventImage event={event} sizes="(min-width: 768px) 220px, 140px" />
        </div>
        <div className="flex h-[100px] w-[80px] shrink-0 flex-col items-center justify-center rounded-[20px] bg-accent text-on-accent md:h-[112px] md:w-24">
          <span className="text-3xl leading-none font-black md:text-[44px]">{day}</span>
          <span className="text-xs font-extrabold tracking-[2px]">{month}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {event.category ? <p className="label-caps text-soft">{event.category.name}</p> : null}
        <Link href={`/agenda/${event.slug}`} className="text-2xl font-extrabold hover:text-soft md:text-[26px]">
          {event.title}
        </Link>
        <div className="flex flex-wrap gap-2 text-[15px] text-soft md:gap-7">
          <span>
            <b className="text-ink">Início</b> {formatEventMoment(event.startsAt)}
          </span>
          <span>
            <b className="text-ink">Término</b> {formatEventMoment(event.endsAt)}
          </span>
          {event.location ? <span>{event.location}</span> : null}
        </div>
      </div>
      {event.registrationUrl ? (
        <Button
          variant="dark"
          className="shrink-0 self-start px-7 py-4 text-[15px] md:self-auto"
          render={<a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" />}
        >
          Inscreva-se
        </Button>
      ) : null}
    </article>
  );
}
