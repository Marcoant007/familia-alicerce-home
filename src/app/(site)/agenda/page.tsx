import type { Metadata } from "next";
import { Eyebrow } from "@/components/site/Eyebrow";
import { CategoryFilter } from "@/components/site/CategoryFilter";
import { EventRow } from "@/components/site/EventRow";
import { getEventsByCategory, getEventCategories, getPastEvents } from "@/lib/queries/events";
import { formatEventMoment } from "@/lib/format";

export const metadata: Metadata = {
  title: "Agenda",
};

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const [events, categories, pastEvents] = await Promise.all([
    getEventsByCategory(categoria),
    getEventCategories(),
    getPastEvents(6),
  ]);

  return (
    <>
      <section className="bg-ink px-5 pt-16 pb-10 text-paper md:px-20 md:pt-18 md:pb-10">
        <div className="container-site flex flex-col gap-5 px-0">
          <Eyebrow>Agenda</Eyebrow>
          <h1 className="text-4xl font-black tracking-[-1px] uppercase md:text-[60px]">
            O que vem por aí
          </h1>
          <div className="mt-3">
            <CategoryFilter categories={categories} active={categoria} />
          </div>
        </div>
      </section>

      <section className="container-site flex flex-col gap-5 pt-14">
        {events.length > 0 ? (
          events.map((event) => <EventRow key={event.id} event={event} />)
        ) : (
          <p className="py-10 text-[17px] text-soft">Nenhum evento nesta categoria por enquanto.</p>
        )}
      </section>

      {pastEvents.length > 0 ? (
        <section className="container-site flex flex-col gap-4 pt-14 pb-16">
          <h2 className="text-xl font-black tracking-tight text-soft uppercase">Já aconteceram</h2>
          <div className="flex flex-col gap-4 md:flex-row">
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-1 items-center justify-between gap-4 rounded-2xl bg-sand px-7 py-5 text-[15px] text-soft"
              >
                <span>
                  <b>{event.title}</b> · {formatEventMoment(event.endsAt)}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
