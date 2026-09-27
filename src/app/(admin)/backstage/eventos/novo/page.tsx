import type { Metadata } from "next";
import { getActor, hasRole, isEditor } from "@/lib/auth-and-audit";
import { EventForm } from "@/components/admin/EventForm";
import { getAllCategories } from "@/lib/queries/categories";
import { getMinistries } from "@/lib/queries/ministries";

export const metadata: Metadata = { title: "Novo evento" };

export default async function NovoEventoPage() {
  const actor = await getActor();
  const editor = isEditor(actor);
  const [categories, allMinistries] = await Promise.all([getAllCategories(), getMinistries()]);

  const ministries = editor
    ? allMinistries
    : allMinistries.filter((m) => hasRole(actor, "LIDER", m.id));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Novo evento</h1>
      <EventForm categories={categories} ministries={ministries} isEditor={editor} />
    </div>
  );
}
