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

  await prisma.$transaction(async (tx) => {
    const before = await tx.album.findUniqueOrThrow({ where: { id } });
    const slug = data.title !== before.title ? await uniqueSlug(data.title, id) : before.slug;
    const after = await tx.album.update({
      where: { id },
      data: { title: data.title, slug, eventId: data.eventId || null, takenOn: data.takenOn ?? null },
    });
    await audit(tx, actor, {
      action: "UPDATE",
      entityType: "ALBUM",
      entityId: id,
      entityLabel: after.title,
      changes: diff(before, after) as Prisma.InputJsonValue,
    });
  });

  revalidatePath("/", "layout");
  revalidatePath("/backstage/galeria");
}

export async function deleteAlbum(id: string) {
  const actor = await getActor();
  if (!isEditor(actor)) throw new Error("Só a mídia/admin remove álbuns.");

  const { before, photoPaths } = await prisma.$transaction(async (tx) => {
    const albumBefore = await tx.album.findUniqueOrThrow({ where: { id }, include: { photos: true } });
    await tx.album.delete({ where: { id } }); // cascade remove as fotos
    await audit(tx, actor, { action: "DELETE", entityType: "ALBUM", entityId: id, entityLabel: albumBefore.title });
    return { before: albumBefore, photoPaths: albumBefore.photos.map((p) => p.path) };
  });

  await deleteBlobIfExists(before.coverPath);
  await Promise.all(photoPaths.map((path) => deleteBlobIfExists(path)));

  revalidatePath("/", "layout");
  revalidatePath("/backstage/galeria");
}

export async function addPhoto(albumId: string, path: string, caption?: string) {
  const actor = await getActor();

  const photo = await prisma.$transaction(async (tx) => {
    const last = await tx.photo.findFirst({ where: { albumId }, orderBy: { sortOrder: "desc" } });
    const created = await tx.photo.create({
      data: { albumId, path, caption: caption || null, sortOrder: (last?.sortOrder ?? -1) + 1, uploadedById: actor.id },
    });
    await audit(tx, actor, { action: "UPLOAD", entityType: "PHOTO", entityId: created.id, entityLabel: caption ?? null });

    const album = await tx.album.findUniqueOrThrow({ where: { id: albumId } });
    if (!album.coverPath) {
      await tx.album.update({ where: { id: albumId }, data: { coverPath: path } });
    }
    return created;
  });

  revalidatePath("/", "layout");
  revalidatePath(`/backstage/galeria/${albumId}`);
  return photo;
}

export async function deletePhoto(photoId: string) {
  const actor = await getActor();

  const { photo, albumId } = await prisma.$transaction(async (tx) => {
    const found = await tx.photo.findUniqueOrThrow({ where: { id: photoId } });
    if (!isEditor(actor) && found.uploadedById !== actor.id) {
      throw new Error("Você só pode remover fotos que você mesmo subiu.");
    }
    await tx.photo.delete({ where: { id: photoId } });
    await audit(tx, actor, { action: "DELETE", entityType: "PHOTO", entityId: photoId, entityLabel: found.caption });

    const album = await tx.album.findUniqueOrThrow({ where: { id: found.albumId } });
    if (album.coverPath === found.path) {
      const nextCover = await tx.photo.findFirst({ where: { albumId: found.albumId }, orderBy: { sortOrder: "asc" } });
      await tx.album.update({ where: { id: found.albumId }, data: { coverPath: nextCover?.path ?? null } });
    }
    return { photo: found, albumId: found.albumId };
  });

  await deleteBlobIfExists(photo.path);

  revalidatePath("/", "layout");
  revalidatePath(`/backstage/galeria/${albumId}`);
}

export async function reorderPhotos(albumId: string, orderedIds: string[]) {
  const actor = await getActor();
  await prisma.$transaction(async (tx) => {
    await Promise.all(orderedIds.map((id, index) => tx.photo.update({ where: { id }, data: { sortOrder: index } })));
    await audit(tx, actor, {
      action: "UPDATE",
      entityType: "ALBUM",
      entityId: albumId,
      entityLabel: "ordem das fotos",
    });
  });
  revalidatePath(`/backstage/galeria/${albumId}`);
  revalidatePath("/", "layout");
}

export async function setCoverPhoto(albumId: string, path: string) {
  const actor = await getActor();
  await prisma.$transaction(async (tx) => {
    await tx.album.update({ where: { id: albumId }, data: { coverPath: path } });
    await audit(tx, actor, { action: "UPDATE", entityType: "ALBUM", entityId: albumId, entityLabel: "capa do álbum" });
  });
  revalidatePath("/", "layout");
  revalidatePath(`/backstage/galeria/${albumId}`);
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
