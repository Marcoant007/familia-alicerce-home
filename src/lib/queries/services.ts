import "server-only";
import { prisma } from "@/lib/prisma";

export async function getServices() {
  return prisma.service.findMany({ orderBy: { sortOrder: "asc" } });
}
