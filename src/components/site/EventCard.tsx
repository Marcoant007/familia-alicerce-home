import { Button } from "@/components/site/Button";
import { DateBadge } from "@/components/site/DateBadge";
import { EventImage } from "@/components/site/EventImage";
import { formatDateBadge, formatEventRange } from "@/lib/format";

type EventCardData = {
  title: string;
  startsAt: Date;
  endsAt: Date;
  location: string | null;
  registrationUrl: string | null;
  coverPath: string | null;
  category: { slug: string } | null;
};

export function EventCard({ event }: { event: EventCardData }) {
  const { day, month } = formatDateBadge(event.startsAt);
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-line bg-card">
      <div className="relative flex h-[200px] items-center justify-center bg-sand text-sm font-bold text-soft">
        <EventImage event={event} sizes="(min-width: 768px) 33vw, 100vw" />
        <DateBadge day={day} month={month} className="absolute top-5 left-5" />
      </div>
      <div className="flex flex-col gap-2.5 p-7">
        <h3 className="text-[22px] font-extrabold">{event.title}</h3>
        <p className="text-[15px] text-soft">{formatEventRange(event.startsAt, event.endsAt)}</p>
        {event.location ? <p className="text-[15px] text-soft">{event.location}</p> : null}
        {event.registrationUrl ? (
          <Button
            variant="dark"
            className="mt-2 self-start px-6 py-3 text-[15px]"
            render={<a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" />}
          >
            Inscreva-se
          </Button>
        ) : null}
      </div>
    </article>
  );
}
