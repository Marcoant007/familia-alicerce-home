import { z } from "zod";
import { HEX_RE } from "@/lib/theme";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const optionalUrl = (max: number) =>
  z.string().trim().max(max).url("Link inválido").optional().or(z.literal(""));

const optionalDate = () =>
  z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? new Date(v) : null))
    .refine((v) => v === null || !Number.isNaN(v.getTime()), "Data inválida");

export const siteSettingsSchema = z.object({
  accentColor: z.string().trim().regex(HEX_RE, "Cor inválida"),
  address: optionalText(200),
  mapsUrl: optionalUrl(500),
  whatsapp: optionalText(30),
  pixKey: optionalText(140),
  instagram: optionalUrl(200),
  youtube: optionalUrl(200),
  liveVideoUrl: optionalUrl(500),
  liveAudioUrl: optionalUrl(500),
  liveAt: optionalDate(),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;
