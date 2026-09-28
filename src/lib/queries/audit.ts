import "server-only";
import { prisma } from "@/lib/prisma";
import type { AuditAction, AuditEntity, Prisma } from "@/generated/prisma/client";

export async function getEntityAuditLog(entityType: AuditEntity, entityId: string) {
  return prisma.auditLog.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecentAuditLog(limit = 10) {
  return prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}

export type AuditFilters = {
  actorId?: string;
  entityType?: AuditEntity;
  action?: AuditAction;
  from?: Date;
  to?: Date;
};

export async function getFilteredAuditLog(filters: AuditFilters, limit = 100) {
  const where: Prisma.AuditLogWhereInput = {
    actorId: filters.actorId,
    entityType: filters.entityType,
    action: filters.action,
  };
  if (filters.from || filters.to) {
    where.createdAt = {
      ...(filters.from ? { gte: filters.from } : {}),
      ...(filters.to ? { lte: filters.to } : {}),
    };
  }

  return prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: limit });
}
