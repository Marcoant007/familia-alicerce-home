"use server";

import { revalidatePath } from "next/cache";
import { getActor, isEditor, audit, diff } from "@/lib/auth-and-audit";
import { ministrySchema } from "@/lib/schemas/ministry";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import type { Prisma } from "@/generated/prisma/client";

async function uniqueSlug(name: string, ignoreId?: string): Promise<string> {
  const base = slugify(name) || "ministerio";
  let slug = base;
  let n = 1;
  while (await prisma.ministry.findFirst({ where: { slug, id: { not: ignoreId } } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export type MinistryActionState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

function readForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    schedule: String(formData.get("schedule") ?? ""),
    coverPath: String(formData.get("coverPath") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
  };
}

export async function createMinistry(_prev: MinistryActionState, formData: FormData): Promise<MinistryActionState> {
  const actor = await getActor();
  if (!isEditor(actor)) return { error: "Só a mídia/admin gerencia ministérios." };

  const parsed = ministrySchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: "Confira os campos.", fieldErrors: flatten(parsed.error) };
  const data = parsed.data;

  const slug = await uniqueSlug(data.name);

  await prisma.$transaction(async (tx) => {
    const created = await tx.ministry.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        schedule: data.schedule || null,
        coverPath: data.coverPath || null,
        sortOrder: data.sortOrder,
      },
    });
    await audit(tx, actor, { action: "CREATE", entityType: "MINISTRY", entityId: created.id, entityLabel: created.name });
  });

  revalidatePath("/", "layout");
  revalidatePath("/backstage/ministerios");
  return {};
}

export async function updateMinistry(
  id: string,
  _prev: MinistryActionState,
  formData: FormData
): Promise<MinistryActionState> {
  const actor = await getActor();
  if (!isEditor(actor)) return { error: "Só a mídia/admin gerencia ministérios." };

  const parsed = ministrySchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: "Confira os campos.", fieldErrors: flatten(parsed.error) };
  const data = parsed.data;

  await prisma.$transaction(async (tx) => {
    const before = await tx.ministry.findUniqueOrThrow({ where: { id } });
    const slug = data.name !== before.name ? await uniqueSlug(data.name, id) : before.slug;
    const after = await tx.ministry.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        schedule: data.schedule || null,
        coverPath: data.coverPath || null,
        sortOrder: data.sortOrder,
      },
    });
    await audit(tx, actor, {
      action: "UPDATE",
      entityType: "MINISTRY",
      entityId: id,
      entityLabel: after.name,
      changes: diff(before, after) as Prisma.InputJsonValue,
    });
  });

  revalidatePath("/", "layout");
  revalidatePath("/backstage/ministerios");
  return {};
}

export async function deleteMinistry(id: string) {
  const actor = await getActor();
  if (!isEditor(actor)) throw new Error("Só a mídia/admin gerencia ministérios.");

  await prisma.$transaction(async (tx) => {
    const before = await tx.ministry.findUniqueOrThrow({ where: { id } });
    await tx.ministry.delete({ where: { id } });
    await audit(tx, actor, { action: "DELETE", entityType: "MINISTRY", entityId: id, entityLabel: before.name });
  });

  revalidatePath("/", "layout");
  revalidatePath("/backstage/ministerios");
}

function flatten(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
