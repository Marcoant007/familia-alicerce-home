import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarPlus, MapPin } from "lucide-react";
import { Button } from "@/components/site/Button";
import { DateBadge } from "@/components/site/DateBadge";
import { EventImage } from "@/components/site/EventImage";
import { getEventBySlug } from "@/lib/queries/events";
import { formatDateBadge, formatEventMoment } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};

  return {
    title: event.title,
    description: event.description ?? undefined,
    openGraph: {
      title: event.title,
      description: event.description ?? undefined,
      images: event.coverPath ? [event.coverPath] : undefined,
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const { day, month } = formatDateBadge(event.startsAt);
  const mapsHref = event.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
    : null;

  return (
    <article className="container-site flex flex-col gap-9 py-12 md:py-20">
      <div className="relative flex h-[220px] items-center justify-center overflow-hidden rounded-[28px] bg-sand text-sm font-bold text-soft md:h-[420px]">
        <EventImage event={event} sizes="(min-width: 768px) 1280px, 100vw" />
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
        <DateBadge day={day} month={month} className="w-24 py-4" />
        <div className="flex flex-1 flex-col gap-4">
          {event.category ? <p className="label-caps text-soft">{event.category.name}</p> : null}
          <h1 className="text-3xl font-black uppercase md:text-5xl">{event.title}</h1>
          <div className="flex flex-wrap gap-2 text-[15px] text-soft md:gap-7">
            <span>
              <b className="text-ink">Início</b> {formatEventMoment(event.startsAt)}
            </span>
            <span>
              <b className="text-ink">Término</b> {formatEventMoment(event.endsAt)}
            </span>
          </div>
          {event.location ? (
            <p className="flex items-center gap-2 text-[15px] text-soft">
              <MapPin size={16} strokeWidth={2} aria-hidden="true" />
              {mapsHref ? (
                <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="link-more">
                  {event.location}
                </a>
              ) : (
                event.location
              )}
            </p>
          ) : null}

          {event.description ? (
            <p className="max-w-2xl text-[17px] leading-[1.65] text-soft">{event.description}</p>
          ) : null}

          <div className="mt-2 flex flex-wrap gap-4">
            {event.registrationUrl ? (
              <Button
                variant="accent"
                render={<a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" />}
              >
                Inscreva-se
              </Button>
            ) : null}
            <Button variant="outline" render={<a href={`/agenda/${event.slug}/ics`} />}>
              <CalendarPlus size={18} strokeWidth={2} aria-hidden="true" />
              Adicionar à agenda
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
