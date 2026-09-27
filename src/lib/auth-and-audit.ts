// src/lib/auth-and-audit.ts
// Permissões (papéis do banco) + auditoria para as Server Actions.
// Login: Clerk. Papéis e histórico: Postgres via Prisma.
import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { AuditAction, AuditEntity, Prisma, Role } from "@/generated/prisma/client";

export type Actor = Awaited<ReturnType<typeof getActor>>;

/** Pessoa logada + papéis. Cria o StaffMember no primeiro acesso, se o webhook ainda não criou. */
export async function getActor() {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado");

  let member = await prisma.staffMember.findUnique({
    where: { clerkUserId: userId },
    include: { roles: true },
  });

  if (!member) {
    const u = await currentUser();
    member = await prisma.staffMember.create({
      data: {
        clerkUserId: userId,
        name: [u?.firstName, u?.lastName].filter(Boolean).join(" ") || "Sem nome",
        email: u?.primaryEmailAddress?.emailAddress ?? `${userId}@sem-email`,
        imageUrl: u?.imageUrl,
      },
      include: { roles: true },
    });
  }
  if (!member.active) throw new Error("Acesso desativado");
  return member;
}

export const hasRole = (actor: Actor, role: Role, ministryId?: string | null) =>
  actor.roles.some((r) => r.role === "ADMIN") ||
  actor.roles.some((r) => r.role === role && (ministryId === undefined || r.ministryId === ministryId));

export const isEditor = (actor: Actor) => hasRole(actor, "MIDIA");

const ROLE_LABELS: Record<Role, string> = { ADMIN: "Admin", MIDIA: "Mídia", LIDER: "Líder" };

/** Rótulo pra exibir na Sidebar/Equipe: "Admin · Líder" ou "Sem papel atribuído". */
export function describeRoles(actor: Actor): string {
  if (actor.roles.length === 0) return "Sem papel atribuído";
  const unique = Array.from(new Set(actor.roles.map((r) => r.role)));
  return unique.map((r) => ROLE_LABELS[r]).join(" · ");
}

/** Lança erro se a pessoa não tiver nenhum dos papéis pedidos. */
export async function requireRole(...roles: Role[]) {
  const actor = await getActor();
  if (!roles.some((r) => hasRole(actor, r))) throw new Error("Sem permissão");
  return actor;
}

/** Diferença campo a campo entre antes e depois, para o UPDATE. */
export function diff(before: Record<string, unknown>, after: Record<string, unknown>) {
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(after)) {
    if (["updatedAt", "updatedById"].includes(key)) continue;
    const a = JSON.stringify(before[key] ?? null);
    const b = JSON.stringify(after[key] ?? null);
    if (a !== b) changes[key] = { from: before[key] ?? null, to: after[key] ?? null };
  }
  return changes;
}

type AuditInput = {
  action: AuditAction;
  entityType: AuditEntity;
  entityId: string;
  entityLabel?: string | null;
  changes?: Prisma.InputJsonValue;
  note?: string | null;
};

/** Grava a auditoria DENTRO da mesma transação da alteração. */
export async function audit(tx: Prisma.TransactionClient, actor: Actor, input: AuditInput) {
  const h = await headers();
  await tx.auditLog.create({
    data: {
      ...input,
      actorId: actor.id,
      actorClerkId: actor.clerkUserId,
      actorName: actor.name,
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: h.get("user-agent"),
    },
  });
}

// ---------------------------------------------------------------------
// Exemplo de uso numa Server Action
// ---------------------------------------------------------------------
export async function updateEventExample(id: string, data: Prisma.EventUpdateInput & { title?: string }) {
  const actor = await getActor();

  return prisma.$transaction(async (tx) => {
    const before = await tx.event.findUniqueOrThrow({ where: { id } });

    const canEdit =
      isEditor(actor) ||
      (hasRole(actor, "LIDER", before.ministryId) && before.createdById === actor.id && before.status !== "PUBLISHED");
    if (!canEdit) throw new Error("Sem permissão para editar este evento");
    if (!isEditor(actor) && data.status === "PUBLISHED") throw new Error("Líder envia para aprovação, não publica");

    const after = await tx.event.update({
      where: { id },
      data: { ...data, updatedBy: { connect: { id: actor.id } } },
    });

    await audit(tx, actor, {
      action: before.status !== "PUBLISHED" && after.status === "PUBLISHED" ? "PUBLISH" : "UPDATE",
      entityType: "EVENT",
      entityId: id,
      entityLabel: after.title,
      changes: diff(before, after) as Prisma.InputJsonValue,
    });

    return after;
  });
}
