"use server";

import { revalidatePath } from "next/cache";
import { getActor, isEditor, audit, diff } from "@/lib/auth-and-audit";
import { serviceSchema } from "@/lib/schemas/service";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type ServiceActionState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

function readForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    weekday: String(formData.get("weekday") ?? ""),
    time: String(formData.get("time") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
  };
}

function toTimeDate(hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(1970, 0, 1, h, m, 0));
}

export async function createService(_prev: ServiceActionState, formData: FormData): Promise<ServiceActionState> {
  const actor = await getActor();
  if (!isEditor(actor)) return { error: "Só a mídia/admin gerencia cultos." };

  const parsed = serviceSchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: "Confira os campos.", fieldErrors: flatten(parsed.error) };
  const data = parsed.data;

  await prisma.$transaction(async (tx) => {
    const created = await tx.service.create({
      data: { name: data.name, weekday: data.weekday, startsAt: toTimeDate(data.time), sortOrder: data.sortOrder },
    });
    await audit(tx, actor, { action: "CREATE", entityType: "SERVICE", entityId: created.id, entityLabel: created.name });
  });

  revalidatePath("/", "layout");
  revalidatePath("/backstage/cultos");
}

export async function updateService(
  id: string,
  _prev: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const actor = await getActor();
  if (!isEditor(actor)) return { error: "Só a mídia/admin gerencia cultos." };

  const parsed = serviceSchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: "Confira os campos.", fieldErrors: flatten(parsed.error) };
  const data = parsed.data;

  await prisma.$transaction(async (tx) => {
    const before = await tx.service.findUniqueOrThrow({ where: { id } });
    const after = await tx.service.update({
      where: { id },
      data: { name: data.name, weekday: data.weekday, startsAt: toTimeDate(data.time), sortOrder: data.sortOrder },
    });
    await audit(tx, actor, {
      action: "UPDATE",
      entityType: "SERVICE",
      entityId: id,
      entityLabel: after.name,
      changes: diff(before, after) as Prisma.InputJsonValue,
    });
  });

  revalidatePath("/", "layout");
  revalidatePath("/backstage/cultos");
}

export async function deleteService(id: string) {
  const actor = await getActor();
  if (!isEditor(actor)) throw new Error("Só a mídia/admin gerencia cultos.");

  await prisma.$transaction(async (tx) => {
    const before = await tx.service.findUniqueOrThrow({ where: { id } });
    await tx.service.delete({ where: { id } });
    await audit(tx, actor, { action: "DELETE", entityType: "SERVICE", entityId: id, entityLabel: before.name });
  });

  revalidatePath("/", "layout");
  revalidatePath("/backstage/cultos");
}

function flatten(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
