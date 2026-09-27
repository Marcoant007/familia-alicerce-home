import "server-only";
import { prisma } from "@/lib/prisma";

export async function getAlbums() {
  return prisma.album.findMany({
    orderBy: { takenOn: "desc" },
    include: { _count: { select: { photos: true } } },
  });
}

export async function getAlbumBySlug(slug: string) {
  return prisma.album.findUnique({
    where: { slug },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getAlbumByIdAdmin(id: string) {
  return prisma.album.findUnique({
    where: { id },
    include: { photos: { orderBy: { sortOrder: "asc" } }, createdBy: true, event: true },
  });
}
