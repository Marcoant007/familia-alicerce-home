import { z } from "zod";

export const eventSchema = z
  .object({
    title: z.string().trim().min(3, "Título muito curto").max(120),
    startsAt: z.coerce.date({ error: "Data/hora de início inválida" }),
    endsAt: z.coerce.date({ error: "Data/hora de término inválida" }),
    location: z.string().trim().max(160).optional().or(z.literal("")),
    registrationUrl: z
      .string()
      .trim()
      .url("Precisa ser uma URL válida")
      .refine((url) => url.startsWith("https://"), "O link precisa começar com https://")
      .optional()
      .or(z.literal("")),
    categoryId: z.string().uuid().optional().or(z.literal("")),
    coverPath: z.string().url().optional().or(z.literal("")),
    ministryId: z.string().uuid().optional().or(z.literal("")),
    isFeatured: z.boolean().default(false),
    description: z.string().trim().max(4000).optional().or(z.literal("")),
  })
  .refine((data) => data.endsAt > data.startsAt, {
    message: "O término precisa ser depois do início",
    path: ["endsAt"],
  });

export type EventFormValues = z.infer<typeof eventSchema>;
