import { z } from "zod";

export const ministrySchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(80),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  schedule: z.string().trim().max(120).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  coverPath: z.string().trim().max(2048).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
});

export type MinistryFormValues = z.infer<typeof ministrySchema>;
