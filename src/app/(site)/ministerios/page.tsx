import type { Metadata } from "next";
import { Eyebrow } from "@/components/site/Eyebrow";
import { MinistryCard } from "@/components/site/MinistryCard";
import { getMinistries } from "@/lib/queries/ministries";

export const metadata: Metadata = { title: "Ministérios" };

export default async function MinisteriosPage() {
  const ministries = await getMinistries();

  return (
    <section className="container-site flex flex-col gap-9 py-12 md:py-20">
      <div className="flex flex-col gap-4">
        <Eyebrow>Ministérios</Eyebrow>
        <h1 className="h-section">Encontre seu lugar</h1>
      </div>

      {ministries.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {ministries.map((ministry) => (
            <MinistryCard key={ministry.id} ministry={ministry} />
          ))}
        </div>
      ) : (
        <p className="text-soft">Nenhum ministério cadastrado por enquanto.</p>
      )}
    </section>
  );
}
