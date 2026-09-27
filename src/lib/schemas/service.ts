import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(80),
  weekday: z.coerce.number().int().min(0).max(6),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Horário inválido"),
  sortOrder: z.coerce.number().int().default(0),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
