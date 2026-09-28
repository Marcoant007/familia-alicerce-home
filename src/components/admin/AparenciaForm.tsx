"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/generated/prisma/client";
import { FormField, fieldInputClass } from "@/components/admin/FormField";
import { ColorPicker } from "@/components/admin/ColorPicker";
import { ThemePreview } from "@/components/admin/ThemePreview";
import { DEFAULT_ACCENT } from "@/lib/theme";
import { updateSiteSettings, type SiteSettingsActionState } from "@/lib/actions/site-settings";

export function AparenciaForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [intent, setIntent] = useState<"apply" | "reset">("apply");
  const boundAction = (prev: SiteSettingsActionState, formData: FormData) =>
    updateSiteSettings(intent, prev, formData);
  const [state, formAction, pending] = useActionState(boundAction, undefined);
  const [color, setColor] = useState(settings.accentColor);

  useEffect(() => {
    if (state?.redirectTo) router.push(state.redirectTo);
  }, [state, router]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <form action={formAction} className="flex flex-col gap-8">
        {state?.error ? <p className="text-sm font-bold text-danger">{state.error}</p> : null}

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-extrabold">Cor de destaque</h2>
          <input type="hidden" name="accentColor" value={color} />
          <ColorPicker value={color} onChange={setColor} />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-extrabold">Dados da igreja</h2>
          <FormField label="Endereço" htmlFor="address" error={state?.fieldErrors?.address}>
            <input
              id="address"
              name="address"
              defaultValue={settings.address ?? ""}
              className={fieldInputClass(!!state?.fieldErrors?.address)}
            />
          </FormField>
          <FormField label="Link do mapa" htmlFor="mapsUrl" error={state?.fieldErrors?.mapsUrl}>
            <input
              id="mapsUrl"
              name="mapsUrl"
              type="url"
              placeholder="https://maps.google.com/..."
              defaultValue={settings.mapsUrl ?? ""}
              className={fieldInputClass(!!state?.fieldErrors?.mapsUrl)}
            />
          </FormField>
          <FormField label="WhatsApp" htmlFor="whatsapp" error={state?.fieldErrors?.whatsapp}>
            <input
              id="whatsapp"
              name="whatsapp"
              placeholder="5527999999999"
              defaultValue={settings.whatsapp ?? ""}
              className={fieldInputClass(!!state?.fieldErrors?.whatsapp)}
            />
          </FormField>
          <FormField label="Chave Pix" htmlFor="pixKey" error={state?.fieldErrors?.pixKey}>
            <input
              id="pixKey"
              name="pixKey"
              defaultValue={settings.pixKey ?? ""}
              className={fieldInputClass(!!state?.fieldErrors?.pixKey)}
            />
          </FormField>
          <FormField label="Instagram" htmlFor="instagram" error={state?.fieldErrors?.instagram}>
            <input
              id="instagram"
              name="instagram"
              type="url"
              placeholder="https://instagram.com/..."
              defaultValue={settings.instagram ?? ""}
              className={fieldInputClass(!!state?.fieldErrors?.instagram)}
            />
          </FormField>
          <FormField label="YouTube" htmlFor="youtube" error={state?.fieldErrors?.youtube}>
            <input
              id="youtube"
              name="youtube"
              type="url"
              placeholder="https://youtube.com/@..."
              defaultValue={settings.youtube ?? ""}
              className={fieldInputClass(!!state?.fieldErrors?.youtube)}
            />
          </FormField>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending}
            onClick={() => setIntent("apply")}
            className="rounded-full bg-ink px-8 py-4 text-[15px] font-extrabold text-paper disabled:opacity-50"
          >
            Aplicar no site
          </button>
          <button
            type="submit"
            disabled={pending}
            onClick={() => {
              setIntent("reset");
              setColor(DEFAULT_ACCENT);
            }}
            className="rounded-full border-2 border-ink px-8 py-4 text-[15px] font-extrabold disabled:opacity-50"
          >
            Restaurar padrão
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        <p className="label-caps text-soft">Prévia</p>
        <ThemePreview color={color} />
      </div>
    </div>
  );
}
