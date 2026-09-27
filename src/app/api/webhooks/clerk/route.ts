import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

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
      const { id, first_name, last_name, image_url, email_addresses } = event.data;
      const name = [first_name, last_name].filter(Boolean).join(" ") || "Sem nome";
      const email =
        email_addresses?.find((e) => e.id === event.data.primary_email_address_id)?.email_address ??
        email_addresses?.[0]?.email_address ??
        `${id}@sem-email`;

      await prisma.staffMember.upsert({
        where: { clerkUserId: id },
        create: { clerkUserId: id, name, email, imageUrl: image_url, active: true },
        update: { name, email, imageUrl: image_url },
      });
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
