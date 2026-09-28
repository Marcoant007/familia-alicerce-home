import { z } from "zod";
import { HEX_RE } from "@/lib/theme";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const optionalUrl = (max: number) =>
  z.string().trim().max(max).url("Link inválido").optional().or(z.literal(""));

export const siteSettingsSchema = z.object({
  accentColor: z.string().trim().regex(HEX_RE, "Cor inválida"),
  address: optionalText(200),
  mapsUrl: optionalUrl(500),
  whatsapp: optionalText(30),
  pixKey: optionalText(140),
  instagram: optionalUrl(200),
  youtube: optionalUrl(200),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;
