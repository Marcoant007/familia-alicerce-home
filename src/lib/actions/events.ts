"use server";

import { revalidatePath } from "next/cache";
import { getActor, hasRole, isEditor, audit, diff } from "@/lib/auth-and-audit";
import { eventSchema } from "@/lib/schemas/event";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { deleteBlobIfExists } from "@/lib/blob";
import type { Prisma } from "@/generated/prisma/client";

async function uniqueSlug(title: string, ignoreId?: string): Promise<string> {
  const base = slugify(title) || "evento";
  let slug = base;
  let n = 1;
  while (await prisma.event.findFirst({ where: { slug, id: { not: ignoreId } } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

function readForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
    endsAt: String(formData.get("endsAt") ?? ""),
    location: String(formData.get("location") ?? ""),
    registrationUrl: String(formData.get("registrationUrl") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    coverPath: String(formData.get("coverPath") ?? ""),
    ministryId: String(formData.get("ministryId") ?? ""),
    isFeatured: formData.get("isFeatured") === "on",
    description: String(formData.get("description") ?? ""),
  };
}

export type EventActionState =
  | { error?: string; fieldErrors?: Record<string, string>; redirectTo?: undefined }
  | { redirectTo: string; error?: undefined; fieldErrors?: undefined }
  | undefined;

export async function createEvent(
  intent: "draft" | "submit" | "publish",
  _prev: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  const actor = await getActor();
  const raw = readForm(formData);
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Confira os campos destacados.", fieldErrors: flatten(parsed.error) };
  }
  const data = parsed.data;

  const editor = isEditor(actor);
  const lider = hasRole(actor, "LIDER", data.ministryId || undefined);
  if (!editor && !lider) return { error: "Você não tem permissão para criar eventos." };
  if (!editor && !data.ministryId) return { error: "Líder precisa escolher o ministério." };

  let status: "DRAFT" | "PENDING" | "PUBLISHED" = "DRAFT";
  if (intent === "submit") status = "PENDING";
  if (intent === "publish") {
    if (!editor) return { error: "Líder envia para aprovação, não publica direto." };
    status = "PUBLISHED";
  }

  const slug = await uniqueSlug(data.title);

  const event = await prisma.$transaction(async (tx) => {
    const created = await tx.event.create({
      data: {
        title: data.title,
        slug,
        description: data.description || null,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        location: data.location || null,
        registrationUrl: data.registrationUrl || null,
        categoryId: data.categoryId || null,
        coverPath: data.coverPath || null,
        ministryId: data.ministryId || null,
        isFeatured: editor ? data.isFeatured : false,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        createdById: actor.id,
        updatedById: actor.id,
      },
    });
    await audit(tx, actor, {
      action: status === "PUBLISHED" ? "PUBLISH" : status === "PENDING" ? "SUBMIT" : "CREATE",
      entityType: "EVENT",
      entityId: created.id,
      entityLabel: created.title,
    });
    return created;
  });

  revalidatePath("/", "layout");
  revalidatePath("/backstage/eventos");
  return {
    redirectTo:
      status === "PUBLISHED"
        ? "/backstage/eventos?saved=publish"
        : `/backstage/eventos/${event.id}?saved=${intent}`,
  };
}

export async function updateEvent(
  id: string,
  intent: "draft" | "submit" | "publish",
  _prev: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  const actor = await getActor();
  const raw = readForm(formData);
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Confira os campos destacados.", fieldErrors: flatten(parsed.error) };
  }
  const data = parsed.data;
  const editor = isEditor(actor);
  let oldCoverPath: string | null = null;

  await prisma.$transaction(async (tx) => {
    const before = await tx.event.findUniqueOrThrow({ where: { id } });

    const ownDraft = hasRole(actor, "LIDER", before.ministryId) && before.createdById === actor.id;
    const canEdit = editor || (ownDraft && before.status !== "PUBLISHED");
    if (!canEdit) throw new Error("Sem permissão para editar este evento.");

    let status = before.status;
    if (intent === "submit") status = "PENDING";
    if (intent === "publish") {
      if (!editor) throw new Error("Líder envia para aprovação, não publica direto.");
      status = "PUBLISHED";
    }
    if (intent === "draft" && !editor) status = "DRAFT";

    const slug = data.title !== before.title ? await uniqueSlug(data.title, id) : before.slug;

    const after = await tx.event.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        description: data.description || null,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        location: data.location || null,
        registrationUrl: data.registrationUrl || null,
        categoryId: data.categoryId || null,
        coverPath: data.coverPath || null,
        ministryId: data.ministryId || null,
        isFeatured: editor ? data.isFeatured : before.isFeatured,
        status,
        publishedAt: status === "PUBLISHED" && before.status !== "PUBLISHED" ? new Date() : before.publishedAt,
        reviewNote: intent === "submit" ? null : before.reviewNote,
        updatedById: actor.id,
      },
    });

    if (before.coverPath && before.coverPath !== after.coverPath) {
      oldCoverPath = before.coverPath;
    }

    await audit(tx, actor, {
      action: before.status !== "PUBLISHED" && after.status === "PUBLISHED" ? "PUBLISH" : "UPDATE",
      entityType: "EVENT",
      entityId: id,
      entityLabel: after.title,
      changes: diff(before, after) as Prisma.InputJsonValue,
    });
  });

  await deleteBlobIfExists(oldCoverPath);

  revalidatePath("/", "layout");
  revalidatePath("/backstage/eventos");
  return {
    redirectTo:
      intent === "publish" ? "/backstage/eventos?saved=publish" : `/backstage/eventos/${id}?saved=${intent}`,
  };
}

export async function approveEvent(id: string) {
  const actor = await getActor();
  if (!isEditor(actor)) throw new Error("Só a mídia/admin aprova eventos.");

  await prisma.$transaction(async (tx) => {
    const before = await tx.event.findUniqueOrThrow({ where: { id } });
    const after = await tx.event.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date(), reviewNote: null, updatedById: actor.id },
    });
    await audit(tx, actor, {
      action: "PUBLISH",
      entityType: "EVENT",
      entityId: id,
      entityLabel: after.title,
      changes: diff(before, after) as Prisma.InputJsonValue,
    });
  });

  revalidatePath("/", "layout");
  revalidatePath("/backstage/eventos");
}

export async function rejectEvent(id: string, note: string) {
  const actor = await getActor();
  if (!isEditor(actor)) throw new Error("Só a mídia/admin devolve eventos.");
  if (!note.trim()) throw new Error("Explica pro líder o motivo da devolução.");

  await prisma.$transaction(async (tx) => {
    const before = await tx.event.findUniqueOrThrow({ where: { id } });
    const after = await tx.event.update({
      where: { id },
      data: { status: "DRAFT", reviewNote: note.trim(), updatedById: actor.id },
    });
    await audit(tx, actor, {
      action: "REJECT",
      entityType: "EVENT",
      entityId: id,
      entityLabel: after.title,
      note: note.trim(),
    });
  });

  revalidatePath("/backstage/eventos");
}

export async function deleteEvent(id: string) {
  const actor = await getActor();
  if (!isEditor(actor)) throw new Error("Só a mídia/admin remove eventos.");

  const before = await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUniqueOrThrow({ where: { id } });
    await tx.event.delete({ where: { id } });
    await audit(tx, actor, {
      action: "DELETE",
      entityType: "EVENT",
      entityId: id,
      entityLabel: event.title,
    });
    return event;
  });

  await deleteBlobIfExists(before.coverPath);

  revalidatePath("/", "layout");
  revalidatePath("/backstage/eventos");
}

function flatten(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
