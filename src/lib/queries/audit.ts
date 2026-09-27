import "server-only";
import { prisma } from "@/lib/prisma";
import type { AuditEntity } from "@/generated/prisma/client";

export async function getEntityAuditLog(entityType: AuditEntity, entityId: string) {
  return prisma.auditLog.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecentAuditLog(limit = 10) {
  return prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}
