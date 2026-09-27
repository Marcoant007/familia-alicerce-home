import type { Metadata } from "next";
import { getActor, hasRole, isEditor } from "@/lib/auth-and-audit";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { getAllCategories } from "@/lib/queries/categories";
import { getMinistries } from "@/lib/queries/ministries";

export const metadata: Metadata = { title: "Novo aviso" };

export default async function NovoAvisoPage() {
  const actor = await getActor();
  const editor = isEditor(actor);
  const [categories, allMinistries] = await Promise.all([getAllCategories(), getMinistries()]);

  const ministries = editor ? allMinistries : allMinistries.filter((m) => hasRole(actor, "LIDER", m.id));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Novo aviso</h1>
      <AnnouncementForm categories={categories} ministries={ministries} isEditor={editor} />
    </div>
  );
}
