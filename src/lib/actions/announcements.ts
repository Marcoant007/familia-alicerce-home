"use server";

import { revalidatePath } from "next/cache";
import { getActor, hasRole, isEditor, audit, diff } from "@/lib/auth-and-audit";
import { announcementSchema } from "@/lib/schemas/announcement";
import { prisma } from "@/lib/prisma";
import { deleteBlobIfExists } from "@/lib/blob";
import type { Prisma } from "@/generated/prisma/client";

function readForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    ministryId: String(formData.get("ministryId") ?? ""),
    imagePath: String(formData.get("imagePath") ?? ""),
    publishAt: String(formData.get("publishAt") ?? ""),
    unpublishAt: String(formData.get("unpublishAt") ?? ""),
  };
}

export type AnnouncementActionState =
  | { error?: string; fieldErrors?: Record<string, string>; redirectTo?: undefined }
  | { redirectTo: string; error?: undefined; fieldErrors?: undefined }
  | undefined;

export async function createAnnouncement(
  intent: "draft" | "submit" | "publish",
  _prev: AnnouncementActionState,
  formData: FormData
): Promise<AnnouncementActionState> {
  const actor = await getActor();
  const raw = readForm(formData);
  const parsed = announcementSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Confira os campos destacados.", fieldErrors: flatten(parsed.error) };
  }
  const data = parsed.data;
  const editor = isEditor(actor);
  const lider = hasRole(actor, "LIDER", data.ministryId || undefined);
  if (!editor && !lider) return { error: "Você não tem permissão para criar avisos." };
  if (!editor && !data.ministryId) return { error: "Líder precisa escolher o ministério." };

  let status: "DRAFT" | "PENDING" | "PUBLISHED" = "DRAFT";
  if (intent === "submit") status = "PENDING";
  if (intent === "publish") {
    if (!editor) return { error: "Líder envia para aprovação, não publica direto." };
    status = "PUBLISHED";
  }

  const created = await prisma.$transaction(async (tx) => {
    const announcement = await tx.announcement.create({
      data: {
        title: data.title,
        body: data.body || null,
        categoryId: data.categoryId || null,
        ministryId: data.ministryId || null,
        imagePath: data.imagePath || null,
        publishAt: data.publishAt,
        unpublishAt: data.unpublishAt ?? null,
        status,
        createdById: actor.id,
        updatedById: actor.id,
      },
    });
    await audit(tx, actor, {
      action: status === "PUBLISHED" ? "PUBLISH" : status === "PENDING" ? "SUBMIT" : "CREATE",
      entityType: "ANNOUNCEMENT",
      entityId: announcement.id,
      entityLabel: announcement.title,
    });
    return announcement;
  });

  revalidatePath("/", "layout");
  revalidatePath("/backstage/avisos");
  return {
    redirectTo:
      status === "PUBLISHED"
        ? "/backstage/avisos?saved=publish"
        : `/backstage/avisos/${created.id}?saved=${intent}`,
  };
}

export async function updateAnnouncement(
  id: string,
  intent: "draft" | "submit" | "publish",
  _prev: AnnouncementActionState,
  formData: FormData
): Promise<AnnouncementActionState> {
  const actor = await getActor();
  const raw = readForm(formData);
  const parsed = announcementSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Confira os campos destacados.", fieldErrors: flatten(parsed.error) };
  }
  const data = parsed.data;
  const editor = isEditor(actor);
  let oldImagePath: string | null = null;
  let justPublished = false;

  await prisma.$transaction(async (tx) => {
    const before = await tx.announcement.findUniqueOrThrow({ where: { id } });

    const ownDraft = hasRole(actor, "LIDER", before.ministryId) && before.createdById === actor.id;
    const canEdit = editor || (ownDraft && before.status !== "PUBLISHED");
    if (!canEdit) throw new Error("Sem permissão para editar este aviso.");

    let status = before.status;
    if (intent === "submit") status = "PENDING";
    if (intent === "publish") {
      if (!editor) throw new Error("Líder envia para aprovação, não publica direto.");
      status = "PUBLISHED";
    }
    if (intent === "draft" && !editor) status = "DRAFT";

    const after = await tx.announcement.update({
      where: { id },
      data: {
        title: data.title,
        body: data.body || null,
        categoryId: data.categoryId || null,
        ministryId: data.ministryId || null,
        imagePath: data.imagePath || null,
        publishAt: data.publishAt,
        unpublishAt: data.unpublishAt ?? null,
        status,
        reviewNote: intent === "submit" ? null : before.reviewNote,
        updatedById: actor.id,
      },
    });

    if (before.imagePath && before.imagePath !== after.imagePath) {
      oldImagePath = before.imagePath;
    }
    justPublished = before.status !== "PUBLISHED" && after.status === "PUBLISHED";

    await audit(tx, actor, {
      action: justPublished ? "PUBLISH" : "UPDATE",
      entityType: "ANNOUNCEMENT",
      entityId: id,
      entityLabel: after.title,
      changes: diff(before, after) as Prisma.InputJsonValue,
    });
  });

  await deleteBlobIfExists(oldImagePath);

  revalidatePath("/", "layout");
  revalidatePath("/backstage/avisos");
  return {
    redirectTo:
      intent === "publish" ? "/backstage/avisos?saved=publish" : `/backstage/avisos/${id}?saved=${intent}`,
  };
}

export async function approveAnnouncement(id: string) {
  const actor = await getActor();
  if (!isEditor(actor)) throw new Error("Só a mídia/admin aprova avisos.");

  await prisma.$transaction(async (tx) => {
    const before = await tx.announcement.findUniqueOrThrow({ where: { id } });
    const after = await tx.announcement.update({
      where: { id },
      data: { status: "PUBLISHED", reviewNote: null, updatedById: actor.id },
    });
    await audit(tx, actor, {
      action: "PUBLISH",
      entityType: "ANNOUNCEMENT",
      entityId: id,
      entityLabel: after.title,
      changes: diff(before, after) as Prisma.InputJsonValue,
    });
  });

  revalidatePath("/", "layout");
  revalidatePath("/backstage/avisos");
}

export async function rejectAnnouncement(id: string, note: string) {
  const actor = await getActor();
  if (!isEditor(actor)) throw new Error("Só a mídia/admin devolve avisos.");
  if (!note.trim()) throw new Error("Explica pro líder o motivo da devolução.");

  await prisma.$transaction(async (tx) => {
    const before = await tx.announcement.findUniqueOrThrow({ where: { id } });
    const after = await tx.announcement.update({
      where: { id },
      data: { status: "DRAFT", reviewNote: note.trim(), updatedById: actor.id },
    });
    await audit(tx, actor, {
      action: "REJECT",
      entityType: "ANNOUNCEMENT",
      entityId: id,
      entityLabel: after.title,
      note: note.trim(),
    });
  });

  revalidatePath("/backstage/avisos");
}

export async function deleteAnnouncement(id: string) {
  const actor = await getActor();
  if (!isEditor(actor)) throw new Error("Só a mídia/admin remove avisos.");

  const before = await prisma.$transaction(async (tx) => {
    const announcement = await tx.announcement.findUniqueOrThrow({ where: { id } });
    await tx.announcement.delete({ where: { id } });
    await audit(tx, actor, {
      action: "DELETE",
      entityType: "ANNOUNCEMENT",
      entityId: id,
      entityLabel: announcement.title,
    });
    return announcement;
  });

  await deleteBlobIfExists(before.imagePath);

  revalidatePath("/", "layout");
  revalidatePath("/backstage/avisos");
}

function flatten(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
