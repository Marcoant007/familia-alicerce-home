import { z } from "zod";

export const announcementSchema = z
  .object({
    title: z.string().trim().min(3, "Título muito curto").max(120),
    body: z.string().trim().max(2000).optional().or(z.literal("")),
    categoryId: z.string().uuid().optional().or(z.literal("")),
    ministryId: z.string().uuid().optional().or(z.literal("")),
    imagePath: z.string().url().optional().or(z.literal("")),
    publishAt: z.coerce.date({ error: "Data de 'publicar em' inválida" }),
    unpublishAt: z.preprocess(
      (val) => (val === "" || val == null ? undefined : val),
      z.coerce.date().optional()
    ),
  })
  .refine((data) => !data.unpublishAt || data.unpublishAt > data.publishAt, {
    message: "'Sair do ar em' precisa ser depois de 'publicar em'",
    path: ["unpublishAt"],
  });

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;
