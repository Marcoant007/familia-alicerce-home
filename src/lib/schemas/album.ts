import { z } from "zod";
import { extractDriveFolderId } from "@/lib/google-drive";

export const albumSchema = z.object({
  title: z.string().trim().min(2, "Título muito curto").max(120),
  eventId: z.string().uuid().optional().or(z.literal("")),
  takenOn: z.preprocess((val) => (val === "" || val == null ? undefined : val), z.coerce.date().optional()),
  coverPath: z.string().trim().optional().or(z.literal("")),
  driveUrl: z
    .string()
    .trim()
    .min(1, "Cole o link da pasta do Google Drive")
    .refine(
      (url) => extractDriveFolderId(url) !== null,
      "Não reconheci esse link — cole o link de compartilhamento da pasta do Google Drive"
    ),
});

export type AlbumFormValues = z.infer<typeof albumSchema>;
