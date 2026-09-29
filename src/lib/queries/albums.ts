import "server-only";
import { prisma } from "@/lib/prisma";

export async function getAlbums() {
  return prisma.album.findMany({ orderBy: { takenOn: "desc" } });
}

/** Só álbuns com link do Drive já configurado — os outros ainda não estão prontos pro site público. */
export async function getPublicAlbums() {
  return prisma.album.findMany({ where: { driveUrl: { not: null } }, orderBy: { takenOn: "desc" } });
}

export async function getAlbumBySlug(slug: string) {
  return prisma.album.findFirst({ where: { slug, driveUrl: { not: null } } });
}

export async function getAlbumByIdAdmin(id: string) {
  return prisma.album.findUnique({ where: { id }, include: { createdBy: true, event: true } });
}
