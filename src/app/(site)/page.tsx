import { Hero } from "@/components/site/Hero";
import { ServiceStrip } from "@/components/site/ServiceStrip";
import { SectionHeader } from "@/components/site/SectionHeader";
import { EventCard } from "@/components/site/EventCard";
import { NoticeCard } from "@/components/site/NoticeCard";
import { AboutBlock } from "@/components/site/AboutBlock";
import { MinistryChip } from "@/components/site/MinistryChip";
import { VisitBlock } from "@/components/site/VisitBlock";
import { ContributeBanner } from "@/components/site/ContributeBanner";
import { getServices } from "@/lib/queries/services";
import { getUpcomingEvents } from "@/lib/queries/events";
import { getActiveAnnouncements } from "@/lib/queries/announcements";
import { getMinistries } from "@/lib/queries/ministries";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { formatServiceLabel, getNextService } from "@/lib/format";

export default async function Home() {
  const [services, events, announcements, ministries, settings] = await Promise.all([
    getServices(),
    getUpcomingEvents(3),
    getActiveAnnouncements(2),
    getMinistries(),
    getSiteSettings(),
  ]);

  const nextService = getNextService(services);

  return (
    <>
      <Hero
        nextServiceLabel={nextService ? formatServiceLabel(nextService) : null}
        address={settings.address}
      />

      <ServiceStrip services={services} />

      <section className="container-site flex flex-col gap-9 pt-12 md:pt-28">
        <SectionHeader eyebrow="Agenda" title="Próximos eventos" linkHref="/agenda" linkLabel="Ver agenda completa" />
        {events.length > 0 ? (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-soft">Nenhum evento publicado por enquanto.</p>
        )}
      </section>

      <section id="avisos" className="container-site flex flex-col gap-9 pt-12 md:pt-28">
        <SectionHeader eyebrow="Mural" title="Avisos da semana" />
        {announcements.length > 0 ? (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
            {announcements.map((announcement) => (
              <NoticeCard key={announcement.id} announcement={announcement} />
            ))}
          </div>
        ) : (
          <p className="text-soft">Nenhum aviso no ar por enquanto.</p>
        )}
      </section>

      <section className="pt-12 md:pt-28">
        <AboutBlock
          title="Uma família construída sobre a Rocha."
          text="Somos uma igreja que acredita no poder da comunidade: um lugar para pertencer, crescer na fé e servir."
        />
      </section>

      {ministries.length > 0 ? (
        <section id="ministerios" className="container-site flex flex-col gap-8 pt-12 md:pt-28">
          <h2 className="h-section">Encontre seu lugar</h2>
          <div className="flex flex-wrap gap-4">
            {ministries.map((ministry, index) => (
              <MinistryChip key={ministry.id} name={ministry.name} slug={ministry.slug} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      <section id="visite" className="pt-12 md:pt-28">
        <VisitBlock address={settings.address} mapsUrl={settings.mapsUrl} whatsapp={settings.whatsapp} />
      </section>

      <section id="contribua" className="py-12 md:py-12">
        <ContributeBanner pixKey={settings.pixKey} />
      </section>
    </>
  );
}
