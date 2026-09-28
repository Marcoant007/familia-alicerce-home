import "server-only";
import { prisma } from "@/lib/prisma";

export async function getStaffMembers() {
  return prisma.staffMember.findMany({
    include: { roles: { include: { ministry: true }, orderBy: { createdAt: "asc" } } },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
}
