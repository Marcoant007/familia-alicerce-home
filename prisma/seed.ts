// prisma/seed.ts — dados de exemplo, só para desenvolvimento local.
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function timeUtc(hour: number, minute = 0) {
  return new Date(Date.UTC(1970, 0, 1, hour, minute, 0));
}

function inDays(days: number, hour: number, minute = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  // Sem chave natural pra upsert (nome não é identidade) — idempotência checada na aplicação.
  const existingServices = await prisma.service.findMany({ select: { name: true } });
  const existingServiceNames = new Set(existingServices.map((s) => s.name));
  const seedServices = [
    { name: "Culto da Família", weekday: 0, startsAt: timeUtc(18), sortOrder: 0 },
    { name: "Culto de Oração", weekday: 3, startsAt: timeUtc(19, 30), sortOrder: 1 },
    { name: "Culto de Jovens", weekday: 6, startsAt: timeUtc(19), sortOrder: 2 },
  ].filter((s) => !existingServiceNames.has(s.name));
  if (seedServices.length > 0) {
    await prisma.service.createMany({ data: seedServices });
  }

  const categories = Object.fromEntries(
    await Promise.all(
      [
        { name: "Casais", slug: "casais", sortOrder: 0 },
        { name: "Louvor", slug: "louvor", sortOrder: 1 },
        { name: "Jovens", slug: "jovens", sortOrder: 2 },
        { name: "Kids", slug: "kids", sortOrder: 3 },
        { name: "Batismo", slug: "batismo", sortOrder: 4 },
        { name: "Ceia", slug: "ceia", sortOrder: 5 },
        { name: "Conferência", slug: "conferencia", sortOrder: 6 },
        { name: "Eventos", slug: "eventos", sortOrder: 7 },
        { name: "Comunidade", slug: "comunidade", sortOrder: 8 },
      ].map(async (c) => {
        const category = await prisma.category.upsert({ where: { slug: c.slug }, create: c, update: {} });
        return [c.slug, category] as const;
      })
    )
  );

  const louvor = await prisma.ministry.upsert({
    where: { slug: "louvor" },
    create: { name: "Louvor", slug: "louvor", schedule: "Quintas, 20h", sortOrder: 0 },
    update: {},
  });
  await prisma.ministry.upsert({
    where: { slug: "kids" },
    create: { name: "Kids", slug: "kids", schedule: "Domingos, durante o culto", sortOrder: 1 },
    update: {},
  });
  await prisma.ministry.upsert({
    where: { slug: "jovens" },
    create: { name: "Jovens", slug: "jovens", schedule: "Sábados, 19h", sortOrder: 2 },
    update: {},
  });
  await prisma.ministry.upsert({
    where: { slug: "casais" },
    create: { name: "Casais", slug: "casais", schedule: "Mensal", sortOrder: 3 },
    update: {},
  });

  await prisma.event.upsert({
    where: { slug: "retiro-de-casais-2026" },
    create: {
      title: "Retiro de Casais",
      slug: "retiro-de-casais-2026",
      startsAt: inDays(18, 11),
      endsAt: inDays(19, 16),
      location: "Sítio Recanto, Domingos Martins",
      registrationUrl: "https://forms.gle/exemplo",
      categoryId: categories.casais.id,
      isFeatured: true,
      status: "PUBLISHED",
      publishedAt: new Date(),
      ministryId: null,
    },
    update: { categoryId: categories.casais.id },
  });
  await prisma.event.upsert({
    where: { slug: "noite-de-louvor" },
    create: {
      title: "Noite de Louvor",
      slug: "noite-de-louvor",
      startsAt: inDays(25, 22),
      endsAt: inDays(26, 1),
      location: "Templo sede",
      categoryId: categories.louvor.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      ministryId: louvor.id,
    },
    update: { categoryId: categories.louvor.id },
  });
  await prisma.event.upsert({
    where: { slug: "encontro-de-jovens" },
    create: {
      title: "Encontro de Jovens",
      slug: "encontro-de-jovens",
      startsAt: inDays(42, 18),
      endsAt: inDays(43, 0),
      location: "Templo sede",
      categoryId: categories.jovens.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
    update: { categoryId: categories.jovens.id },
  });

  for (const announcement of [
    {
      title: "Inscrições abertas para o retiro",
      body: "Garanta sua vaga no Retiro de Casais até o fim do mês. Vagas limitadas.",
      categoryId: categories.eventos.id,
      status: "PUBLISHED" as const,
      publishAt: new Date(),
    },
    {
      title: "Mutirão de limpeza no sábado",
      body: "Precisamos de voluntários no sábado às 9h para preparar o templo para o retiro.",
      categoryId: categories.comunidade.id,
      status: "PUBLISHED" as const,
      publishAt: new Date(),
    },
  ]) {
    const existing = await prisma.announcement.findFirst({ where: { title: announcement.title } });
    if (existing) {
      await prisma.announcement.update({ where: { id: existing.id }, data: { categoryId: announcement.categoryId } });
    } else {
      await prisma.announcement.create({ data: announcement });
    }
  }

  await prisma.siteSettings.update({
    where: { id: 1 },
    data: {
      address: "Rua Exemplo, 123 - Centro, Sua Cidade - UF, 00000-000",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent("Rua Exemplo, 123 - Centro, Sua Cidade - UF, 00000-000"),
      whatsapp: "+55 00 90000-0000",
      pixKey: "contato@suaigreja.org.br",
      instagram: "https://instagram.com/suaigreja",
      youtube: "https://youtube.com/@suaigreja",
    },
  });

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
