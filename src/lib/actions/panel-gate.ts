"use server";

import { revalidatePath } from "next/cache";
import { getActor, requireRole, audit } from "@/lib/auth-and-audit";
import {
  checkPanelToken,
  isRateLimited,
  registerFailedAttempt,
  clearAttempts,
  setPanelVerified,
  generatePanelToken,
} from "@/lib/panel-gate";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export type PanelGateState = { error?: string } | undefined;

export async function verifyPanelAccess(_prev: PanelGateState, formData: FormData): Promise<PanelGateState> {
  const actor = await getActor();

  if (isRateLimited(actor.id)) {
    return { error: "Muitas tentativas. Espera um minuto e tenta de novo." };
  }

  const token = String(formData.get("token") ?? "");
  if (!(await checkPanelToken(token))) {
    registerFailedAttempt(actor.id);
    return { error: "Token incorreto." };
  }

  clearAttempts(actor.id);
  await setPanelVerified(actor.id);
}

export type RegenerateTokenState = { token?: string; error?: string } | undefined;

export async function regeneratePanelToken(): Promise<RegenerateTokenState> {
  const actor = await requireRole("ADMIN");

  const token = generatePanelToken();
  const hash = await bcrypt.hash(token, 10);

  await prisma.$transaction(async (tx) => {
    await tx.siteSettings.update({
      where: { id: 1 },
      data: { panelAccessTokenHash: hash, panelAccessTokenSetAt: new Date() },
    });
    await audit(tx, actor, {
      action: "SETTINGS_CHANGE",
      entityType: "SITE_SETTINGS",
      entityId: "1",
      entityLabel: "Token de acesso ao painel",
      note: "Token regenerado — o anterior parou de funcionar.",
    });
  });

  revalidatePath("/backstage/equipe");
  return { token };
}
