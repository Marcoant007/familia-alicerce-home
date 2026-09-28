"use server";

import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { getActor, requireRole, audit } from "@/lib/auth-and-audit";
import { inviteMemberSchema, grantRoleSchema } from "@/lib/schemas/staff";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/client";

export type StaffActionState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

function flatten(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const ROLE_LABELS: Record<Role, string> = { ADMIN: "Admin", MIDIA: "Mídia", LIDER: "Líder" };

export async function inviteMember(_prev: StaffActionState, formData: FormData): Promise<StaffActionState> {
  await requireRole("ADMIN");

  const parsed = inviteMemberSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    roles: formData.getAll("roles").map(String),
    ministryId: String(formData.get("ministryId") ?? ""),
  });
  if (!parsed.success) return { error: "Confira os campos.", fieldErrors: flatten(parsed.error) };
  const data = parsed.data;

  const actor = await getActor();

  const pendingRoles = data.roles.map((role) => ({
    role,
    ministryId: role === "LIDER" ? data.ministryId : null,
  }));

  let ministryName: string | null = null;
  if (data.ministryId) {
    const ministry = await prisma.ministry.findUnique({ where: { id: data.ministryId } });
    ministryName = ministry?.name ?? null;
  }

  try {
    const clerk = await clerkClient();
    await clerk.invitations.createInvitation({
      emailAddress: data.email,
      publicMetadata: { pendingRoles },
    });
  } catch {
    return { error: "Não deu pra enviar o convite. Confira se esse e-mail já não está cadastrado." };
  }

  await prisma.$transaction(async (tx) => {
    await audit(tx, actor, {
      action: "CREATE",
      entityType: "STAFF_MEMBER",
      entityId: data.email,
      entityLabel: data.email,
      note: `Convite enviado — ${data.roles.map((r) => (r === "LIDER" ? `${ROLE_LABELS[r]} (${ministryName ?? "—"})` : ROLE_LABELS[r])).join(", ")}`,
    });
  });

  revalidatePath("/backstage/equipe");
}

export async function grantRole(
  staffMemberId: string,
  _prev: StaffActionState,
  formData: FormData
): Promise<StaffActionState> {
  await requireRole("ADMIN");

  const parsed = grantRoleSchema.safeParse({
    role: String(formData.get("role") ?? ""),
    ministryId: String(formData.get("ministryId") ?? ""),
  });
  if (!parsed.success) return { error: "Confira os campos.", fieldErrors: flatten(parsed.error) };
  const data = parsed.data;

  const actor = await getActor();

  const existing = await prisma.staffRole.findFirst({
    where: { staffMemberId, role: data.role, ministryId: data.ministryId ?? null },
  });
  if (existing) return { error: "Esse papel já foi concedido a essa pessoa." };

  await prisma.$transaction(async (tx) => {
    const member = await tx.staffMember.findUniqueOrThrow({ where: { id: staffMemberId } });
    const ministry = data.ministryId ? await tx.ministry.findUnique({ where: { id: data.ministryId } }) : null;

    await tx.staffRole.create({
      data: {
        staffMemberId,
        role: data.role,
        ministryId: data.ministryId ?? null,
        grantedById: actor.id,
      },
    });

    await audit(tx, actor, {
      action: "ROLE_GRANT",
      entityType: "STAFF_MEMBER",
      entityId: staffMemberId,
      entityLabel: member.name,
      note: data.role === "LIDER" ? `${ROLE_LABELS[data.role]} — ${ministry?.name ?? "—"}` : ROLE_LABELS[data.role],
    });
  });

  revalidatePath("/backstage/equipe");
}

export async function revokeRole(staffRoleId: string) {
  const actor = await requireRole("ADMIN");

  await prisma.$transaction(async (tx) => {
    const role = await tx.staffRole.findUniqueOrThrow({
      where: { id: staffRoleId },
      include: { staffMember: true, ministry: true },
    });

    if (role.staffMemberId === actor.id && role.role === "ADMIN") {
      throw new Error("Você não pode remover seu próprio papel de admin.");
    }

    await tx.staffRole.delete({ where: { id: staffRoleId } });

    await audit(tx, actor, {
      action: "ROLE_REVOKE",
      entityType: "STAFF_MEMBER",
      entityId: role.staffMemberId,
      entityLabel: role.staffMember.name,
      note: role.role === "LIDER" ? `${ROLE_LABELS[role.role]} — ${role.ministry?.name ?? "—"}` : ROLE_LABELS[role.role],
    });
  });

  revalidatePath("/backstage/equipe");
}

export async function toggleStaffActive(staffMemberId: string, nextActive: boolean) {
  const actor = await requireRole("ADMIN");

  if (staffMemberId === actor.id && !nextActive) {
    throw new Error("Você não pode desativar o seu próprio acesso.");
  }

  await prisma.$transaction(async (tx) => {
    const before = await tx.staffMember.findUniqueOrThrow({ where: { id: staffMemberId } });
    const after = await tx.staffMember.update({ where: { id: staffMemberId }, data: { active: nextActive } });

    await audit(tx, actor, {
      action: "UPDATE",
      entityType: "STAFF_MEMBER",
      entityId: staffMemberId,
      entityLabel: after.name,
      changes: { active: { from: before.active, to: after.active } },
    });
  });

  revalidatePath("/backstage/equipe");
}
