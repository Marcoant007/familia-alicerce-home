import type { Metadata } from "next";
import { Eyebrow } from "@/components/site/Eyebrow";
import { ServiceStrip } from "@/components/site/ServiceStrip";
import { VisitBlock } from "@/components/site/VisitBlock";
import { getServices } from "@/lib/queries/services";
import { getSiteSettings } from "@/lib/queries/site-settings";

export const metadata: Metadata = { title: "Visite-nos" };

export default async function VisiteNosPage() {
  const [services, settings] = await Promise.all([getServices(), getSiteSettings()]);

  return (
    <section className="flex flex-col gap-12 py-12 md:gap-16 md:py-20">
      <div className="container-site flex flex-col gap-4">
        <Eyebrow>Visite-nos</Eyebrow>
        <h1 className="h-section">Tem um lugar esperando por você.</h1>
      </div>

      <ServiceStrip services={services} />

      <VisitBlock address={settings.address} mapsUrl={settings.mapsUrl} whatsapp={settings.whatsapp} />
    </section>
  );
}
