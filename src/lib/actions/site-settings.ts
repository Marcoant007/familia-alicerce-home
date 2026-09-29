"use server";

import { revalidatePath } from "next/cache";
import { getActor, isEditor, audit, diff } from "@/lib/auth-and-audit";
import { siteSettingsSchema } from "@/lib/schemas/site-settings";
import { DEFAULT_ACCENT } from "@/lib/theme";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type SiteSettingsActionState =
  | { error?: string; fieldErrors?: Record<string, string>; redirectTo?: undefined }
  | { redirectTo: string; error?: undefined; fieldErrors?: undefined }
  | undefined;

function readForm(formData: FormData) {
  return {
    accentColor: String(formData.get("accentColor") ?? ""),
    address: String(formData.get("address") ?? ""),
    mapsUrl: String(formData.get("mapsUrl") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    pixKey: String(formData.get("pixKey") ?? ""),
    instagram: String(formData.get("instagram") ?? ""),
    youtube: String(formData.get("youtube") ?? ""),
    liveVideoUrl: String(formData.get("liveVideoUrl") ?? ""),
    liveAudioUrl: String(formData.get("liveAudioUrl") ?? ""),
    liveAt: String(formData.get("liveAt") ?? ""),
  };
}

export async function updateSiteSettings(
  intent: "apply" | "reset",
  _prev: SiteSettingsActionState,
  formData: FormData
): Promise<SiteSettingsActionState> {
  const actor = await getActor();
  if (!isEditor(actor)) return { error: "Só a mídia/admin altera a aparência do site." };

  const raw = readForm(formData);
  const parsed = siteSettingsSchema.safeParse({
    ...raw,
    accentColor: intent === "reset" ? DEFAULT_ACCENT : raw.accentColor,
  });
  if (!parsed.success) return { error: "Confira os campos.", fieldErrors: flatten(parsed.error) };
  const data = parsed.data;

  await prisma.$transaction(async (tx) => {
    const before = await tx.siteSettings.findUniqueOrThrow({ where: { id: 1 } });
    const after = await tx.siteSettings.update({
      where: { id: 1 },
      data: {
        accentColor: data.accentColor,
        address: data.address || null,
        mapsUrl: data.mapsUrl || null,
        whatsapp: data.whatsapp || null,
        pixKey: data.pixKey || null,
        instagram: data.instagram || null,
        youtube: data.youtube || null,
        liveVideoUrl: data.liveVideoUrl || null,
        liveAudioUrl: data.liveAudioUrl || null,
        liveAt: data.liveAt,
        updatedBy: { connect: { id: actor.id } },
      },
    });
    await audit(tx, actor, {
      action: "SETTINGS_CHANGE",
      entityType: "SITE_SETTINGS",
      entityId: "1",
      entityLabel: "Aparência do site",
      changes: diff(before, after) as Prisma.InputJsonValue,
    });
  });

  revalidatePath("/", "layout");
  revalidatePath("/backstage/aparencia");
  return { redirectTo: `/backstage/aparencia?saved=${intent === "reset" ? "reset" : "settings"}` };
}

function flatten(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
