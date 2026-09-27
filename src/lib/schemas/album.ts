import { z } from "zod";

export const albumSchema = z.object({
  title: z.string().trim().min(2, "Título muito curto").max(120),
  eventId: z.string().uuid().optional().or(z.literal("")),
  takenOn: z.preprocess((val) => (val === "" || val == null ? undefined : val), z.coerce.date().optional()),
});

export type AlbumFormValues = z.infer<typeof albumSchema>;
