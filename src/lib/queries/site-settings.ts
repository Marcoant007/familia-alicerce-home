import "server-only";
import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  return prisma.siteSettings.findUniqueOrThrow({ where: { id: 1 } });
}
