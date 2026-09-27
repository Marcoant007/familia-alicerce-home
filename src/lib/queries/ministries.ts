import "server-only";
import { prisma } from "@/lib/prisma";

export async function getMinistries() {
  return prisma.ministry.findMany({ orderBy: { sortOrder: "asc" } });
}
