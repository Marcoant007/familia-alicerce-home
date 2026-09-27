import type { Metadata } from "next";
import { Eyebrow } from "@/components/site/Eyebrow";
import { ContributeBanner } from "@/components/site/ContributeBanner";
import { getSiteSettings } from "@/lib/queries/site-settings";

export const metadata: Metadata = { title: "Contribua" };

export default async function ContribuaPage() {
  const settings = await getSiteSettings();

  return (
    <section className="flex flex-col gap-9 py-12 md:py-20">
      <div className="container-site flex flex-col gap-4">
        <Eyebrow>Contribua</Eyebrow>
        <h1 className="h-section max-w-xl">Sua contribuição sustenta a obra.</h1>
        <p className="max-w-xl text-[17px] leading-[1.6] text-soft">
          Dízimos e ofertas ajudam a manter a estrutura da igreja e os projetos que
          transformam vidas na nossa comunidade.
        </p>
      </div>

      {settings.pixKey ? (
        <ContributeBanner pixKey={settings.pixKey} />
      ) : (
        <p className="container-site text-soft">Chave Pix ainda não cadastrada.</p>
      )}
    </section>
  );
}
