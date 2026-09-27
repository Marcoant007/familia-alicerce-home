import "server-only";
import { prisma } from "@/lib/prisma";
import type { Actor } from "@/lib/auth-and-audit";
import { isEditor } from "@/lib/auth-and-audit";
import type { ContentStatus } from "@/generated/prisma/client";

export async function getActiveAnnouncements(limit?: number) {
  const now = new Date();
  return prisma.announcement.findMany({
    where: {
      status: "PUBLISHED",
      publishAt: { lte: now },
      OR: [{ unpublishAt: null }, { unpublishAt: { gt: now } }],
    },
    orderBy: { publishAt: "desc" },
    include: { category: true },
    take: limit,
  });
}

export async function getAdminAnnouncements(actor: Actor, status?: ContentStatus) {
  const ministryIds = actor.roles.filter((r) => r.role === "LIDER" && r.ministryId).map((r) => r.ministryId!);

  return prisma.announcement.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(isEditor(actor) ? {} : { ministryId: { in: ministryIds } }),
    },
    orderBy: { publishAt: "desc" },
    include: { ministry: true, createdBy: true, category: true },
  });
}

export async function getAnnouncementById(id: string) {
  return prisma.announcement.findUnique({ where: { id }, include: { category: true } });
}
