import "server-only";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Segunda camada além do Clerk: um token único do painel, gerado pelo admin em
// /backstage/equipe, obrigatório antes de liberar qualquer página de /backstage.
// Resolve o caso de alguém aceitar um convite do Clerk e cair direto no painel
// sem mais nenhum controle — e permite revogar na hora (gerar outro) se
// desconfiar que vazou. Só o hash bcrypt fica salvo; o token em texto puro só
// existe no instante em que é gerado.

const COOKIE_NAME = "fa_panel_gate";
const TTL_MS = 12 * 60 * 60 * 1000; // 12h — nova sessão de navegador pede o token de novo

export function generatePanelToken() {
  return randomBytes(24).toString("base64url");
}

export async function checkPanelToken(input: string) {
  if (!input) return false;
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 1 },
    select: { panelAccessTokenHash: true },
  });
  const hash = settings?.panelAccessTokenHash;
  if (!hash) return true; // nenhum token gerado ainda: não trava o acesso (admin gera um em /backstage/equipe)
  return bcrypt.compare(input, hash);
}

// Limita tentativas por pessoa (já autenticada pelo Clerk) — evita força bruta
// contra a senha compartilhada. Em memória: reinicia a cada deploy/cold start,
// o suficiente pra esse painel de equipe pequena.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;

export function isRateLimited(actorId: string) {
  const entry = attempts.get(actorId);
  if (!entry || Date.now() > entry.resetAt) return false;
  return entry.count >= MAX_ATTEMPTS;
}

export function registerFailedAttempt(actorId: string) {
  const entry = attempts.get(actorId);
  if (!entry || Date.now() > entry.resetAt) {
    attempts.set(actorId, { count: 1, resetAt: Date.now() + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function clearAttempts(actorId: string) {
  attempts.delete(actorId);
}

function signingKey() {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) throw new Error("CLERK_SECRET_KEY não configurada");
  return key;
}

function sign(payload: string) {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

export async function setPanelVerified(actorId: string) {
  const exp = Date.now() + TTL_MS;
  const payload = `${actorId}.${exp}`;
  const token = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/backstage",
    maxAge: TTL_MS / 1000,
  });
}

export async function isPanelVerified(actorId: string) {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [id, expStr, sig] = parts;
  const payload = `${id}.${expStr}`;
  const expected = sign(payload);

  if (expected.length !== sig.length) return false;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  if (id !== actorId) return false;
  if (Date.now() > Number(expStr)) return false;
  return true;
}
