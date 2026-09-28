import { z } from "zod";

export const ROLE_VALUES = ["ADMIN", "MIDIA", "LIDER"] as const;

export const inviteMemberSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("E-mail inválido"),
    roles: z.array(z.enum(ROLE_VALUES)).min(1, "Escolha ao menos um papel"),
    ministryId: z
      .string()
      .uuid()
      .optional()
      .or(z.literal(""))
      .transform((v) => v || undefined),
  })
  .refine((data) => !data.roles.includes("LIDER") || !!data.ministryId, {
    message: "Escolha o ministério do líder",
    path: ["ministryId"],
  });

export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;

export const grantRoleSchema = z
  .object({
    role: z.enum(ROLE_VALUES),
    ministryId: z
      .string()
      .uuid()
      .optional()
      .or(z.literal(""))
      .transform((v) => v || undefined),
  })
  .refine((data) => data.role !== "LIDER" || !!data.ministryId, {
    message: "Escolha o ministério do líder",
    path: ["ministryId"],
  });

export type GrantRoleValues = z.infer<typeof grantRoleSchema>;
