import type { Metadata } from "next";
import { Suspense } from "react";
import { getActor, isEditor } from "@/lib/auth-and-audit";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { AparenciaForm } from "@/components/admin/AparenciaForm";
import { SaveSuccessDialog } from "@/components/admin/SaveSuccessDialog";

export const metadata: Metadata = { title: "Aparência" };

export default async function AparenciaPage() {
  const actor = await getActor();
  if (!isEditor(actor)) {
    return <p className="text-soft">Só mídia/admin gerenciam a aparência do site.</p>;
  }

  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <SaveSuccessDialog messages={{ settings: "Aparência atualizada!", reset: "Cor restaurada ao padrão!" }} />
      </Suspense>

      <h1 className="text-2xl font-extrabold">Aparência</h1>

      <AparenciaForm settings={settings} />
    </div>
  );
}
