import "server-only";
import { prisma } from "@/lib/prisma";
import type { Actor } from "@/lib/auth-and-audit";
import { hasRole, isEditor } from "@/lib/auth-and-audit";
import type { ContentStatus } from "@/generated/prisma/client";

export async function getUpcomingEvents(limit = 3) {
  return prisma.event.findMany({
    where: { status: "PUBLISHED", endsAt: { gt: new Date() } },
    orderBy: [{ isFeatured: "desc" }, { startsAt: "asc" }],
    include: { category: true },
    take: limit,
  });
}

export async function getEventsByCategory(categorySlug?: string) {
  return prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      endsAt: { gt: new Date() },
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { startsAt: "asc" }],
    include: { category: true },
  });
}

export async function getEventCategories() {
  return prisma.category.findMany({
    where: { events: { some: { status: "PUBLISHED", endsAt: { gt: new Date() } } } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPastEvents(limit = 6) {
  return prisma.event.findMany({
    where: { status: "PUBLISHED", endsAt: { lte: new Date() } },
    orderBy: { endsAt: "desc" },
    take: limit,
  });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true },
  });
}

/** Lista do painel: mídia/admin vê tudo; líder só os eventos dos ministérios em que é líder. */
export async function getAdminEvents(actor: Actor, status?: ContentStatus) {
  const ministryIds = actor.roles.filter((r) => r.role === "LIDER" && r.ministryId).map((r) => r.ministryId!);

  return prisma.event.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(isEditor(actor) ? {} : { ministryId: { in: ministryIds } }),
    },
    orderBy: { startsAt: "desc" },
    include: { ministry: true, createdBy: true, category: true },
  });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({ where: { id }, include: { category: true } });
}

export async function getPendingEventsCount(actor: Actor) {
  if (!hasRole(actor, "MIDIA")) return 0;
  return prisma.event.count({ where: { status: "PENDING" } });
}
