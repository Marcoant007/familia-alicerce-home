"use server";

import { revalidatePath } from "next/cache";
import { getActor, isEditor, audit, diff } from "@/lib/auth-and-audit";
import { albumSchema } from "@/lib/schemas/album";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { deleteBlobIfExists } from "@/lib/blob";
import type { Prisma } from "@/generated/prisma/client";

async function uniqueSlug(title: string, ignoreId?: string): Promise<string> {
  const base = slugify(title) || "album";
  let slug = base;
  let n = 1;
  while (await prisma.album.findFirst({ where: { slug, id: { not: ignoreId } } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export type AlbumActionState =
  | { error?: string; fieldErrors?: Record<string, string>; id?: undefined }
  | { id: string; error?: undefined; fieldErrors?: undefined }
  | undefined;

function readForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    eventId: String(formData.get("eventId") ?? ""),
    takenOn: String(formData.get("takenOn") ?? ""),
    coverPath: String(formData.get("coverPath") ?? ""),
    driveUrl: String(formData.get("driveUrl") ?? ""),
  };
}

export async function createAlbum(_prev: AlbumActionState, formData: FormData): Promise<AlbumActionState> {
  const actor = await getActor();
  if (!isEditor(actor)) return { error: "Só a mídia/admin cria álbuns." };

  const parsed = albumSchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: "Confira os campos.", fieldErrors: flatten(parsed.error) };
  const data = parsed.data;

  const slug = await uniqueSlug(data.title);

  const album = await prisma.$transaction(async (tx) => {
    const created = await tx.album.create({
      data: {
        title: data.title,
        slug,
        eventId: data.eventId || null,
        takenOn: data.takenOn ?? null,
        coverPath: data.coverPath || null,
        driveUrl: data.driveUrl,
        createdById: actor.id,
      },
    });
    await audit(tx, actor, { action: "CREATE", entityType: "ALBUM", entityId: created.id, entityLabel: created.title });
    return created;
  });

  revalidatePath("/", "layout");
  revalidatePath("/backstage/galeria");
  return { id: album.id };
}

export async function updateAlbum(
  id: string,
  _prev: AlbumActionState,
  formData: FormData
): Promise<AlbumActionState> {
  const actor = await getActor();
  if (!isEditor(actor)) return { error: "Só a mídia/admin edita álbuns." };

  const parsed = albumSchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: "Confira os campos.", fieldErrors: flatten(parsed.error) };
  const data = parsed.data;

  let oldCoverPath: string | null = null;

  await prisma.$transaction(async (tx) => {
    const before = await tx.album.findUniqueOrThrow({ where: { id } });
    const slug = data.title !== before.title ? await uniqueSlug(data.title, id) : before.slug;
    const after = await tx.album.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        eventId: data.eventId || null,
        takenOn: data.takenOn ?? null,
        coverPath: data.coverPath || null,
        driveUrl: data.driveUrl,
      },
    });

    if (before.coverPath && before.coverPath !== after.coverPath) {
      oldCoverPath = before.coverPath;
    }

    await audit(tx, actor, {
      action: "UPDATE",
      entityType: "ALBUM",
      entityId: id,
      entityLabel: after.title,
      changes: diff(before, after) as Prisma.InputJsonValue,
    });
  });

  await deleteBlobIfExists(oldCoverPath);

  revalidatePath("/", "layout");
  revalidatePath("/backstage/galeria");
  revalidatePath(`/backstage/galeria/${id}`);
  return { id };
}

export async function deleteAlbum(id: string) {
  const actor = await getActor();
  if (!isEditor(actor)) throw new Error("Só a mídia/admin remove álbuns.");

  const before = await prisma.$transaction(async (tx) => {
    const album = await tx.album.findUniqueOrThrow({ where: { id } });
    await tx.album.delete({ where: { id } });
    await audit(tx, actor, { action: "DELETE", entityType: "ALBUM", entityId: id, entityLabel: album.title });
    return album;
  });

  await deleteBlobIfExists(before.coverPath);

  revalidatePath("/", "layout");
  revalidatePath("/backstage/galeria");
}

function flatten(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
