import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/client";

const ROLE_VALUES = new Set<Role>(["ADMIN", "MIDIA", "LIDER"]);

// Papéis escolhidos no convite (src/lib/actions/staff.ts) viajam no publicMetadata
// da invitation e são copiados pro publicMetadata do usuário quando ele aceita.
type PendingRole = { role: Role; ministryId: string | null };

function readPendingRoles(publicMetadata: Record<string, unknown> | null | undefined): PendingRole[] {
  const raw = publicMetadata?.pendingRoles;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (r): r is PendingRole =>
      !!r && typeof r === "object" && ROLE_VALUES.has((r as PendingRole).role)
  );
}

export async function POST(req: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(req);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const { id, first_name, last_name, image_url, email_addresses, public_metadata } = event.data;
      const name = [first_name, last_name].filter(Boolean).join(" ") || "Sem nome";
      const email =
        email_addresses?.find((e) => e.id === event.data.primary_email_address_id)?.email_address ??
        email_addresses?.[0]?.email_address ??
        `${id}@sem-email`;

      const member = await prisma.staffMember.upsert({
        where: { clerkUserId: id },
        create: { clerkUserId: id, name, email, imageUrl: image_url, active: true },
        update: { name, email, imageUrl: image_url },
      });

      const pendingRoles = event.type === "user.created" ? readPendingRoles(public_metadata) : [];
      if (pendingRoles.length > 0) {
        await prisma.$transaction(async (tx) => {
          for (const pending of pendingRoles) {
            // upsert com chave composta não aceita null (Postgres permite várias linhas
            // com ministryId null); checa/cria manualmente pra ficar idempotente no retry do webhook.
            const existing = await tx.staffRole.findFirst({
              where: { staffMemberId: member.id, role: pending.role, ministryId: pending.ministryId },
            });
            if (existing) continue;

            await tx.staffRole.create({
              data: { staffMemberId: member.id, role: pending.role, ministryId: pending.ministryId },
            });
            await tx.auditLog.create({
              data: {
                action: "ROLE_GRANT",
                entityType: "STAFF_MEMBER",
                entityId: member.id,
                entityLabel: member.name,
                note: `Papel do convite aceito — ${pending.role}`,
                actorId: member.id,
                actorClerkId: member.clerkUserId,
                actorName: member.name,
              },
            });
          }
        });
      }
      break;
    }
    case "user.deleted": {
      const { id } = event.data;
      if (id) {
        // preserva o histórico/auditoria: desativa em vez de apagar
        await prisma.staffMember
          .update({ where: { clerkUserId: id }, data: { active: false } })
          .catch(() => {});
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
