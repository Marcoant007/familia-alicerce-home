import "server-only";
import { prisma } from "@/lib/prisma";

export async function getAllCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}
