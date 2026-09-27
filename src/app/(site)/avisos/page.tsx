import type { Metadata } from "next";
import { Eyebrow } from "@/components/site/Eyebrow";
import { NoticeCard } from "@/components/site/NoticeCard";
import { getActiveAnnouncements } from "@/lib/queries/announcements";

export const metadata: Metadata = { title: "Avisos" };

export default async function AvisosPage() {
  const announcements = await getActiveAnnouncements();

  return (
    <section className="container-site flex flex-col gap-9 py-12 md:py-20">
      <div className="flex flex-col gap-4">
        <Eyebrow>Mural</Eyebrow>
        <h1 className="h-section">Avisos</h1>
      </div>

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
  );
}
