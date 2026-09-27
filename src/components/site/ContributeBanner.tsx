"use client";

import { toast } from "sonner";
import { Button } from "@/components/site/Button";

export function ContributeBanner({ pixKey }: { pixKey: string | null }) {
  if (!pixKey) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(pixKey!);
    toast.success("Chave copiada");
  }

  return (
    <div className="mx-5 flex flex-col items-start gap-6 rounded-[28px] bg-accent px-8 py-10 text-on-accent md:mx-20 md:flex-row md:items-center md:justify-between md:px-16 md:py-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-[28px] font-black uppercase md:text-[32px]">Contribua com a obra</h2>
        <p className="text-[17px] font-semibold">Dízimos e ofertas por Pix: {pixKey}</p>
      </div>
      <Button variant="dark" onClick={handleCopy}>
        Copiar chave
      </Button>
    </div>
  );
}
