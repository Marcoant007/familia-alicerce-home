import type { Metadata } from "next";
import { Plus, Pencil } from "lucide-react";
import { isEditor, getActor } from "@/lib/auth-and-audit";
import { getMinistries } from "@/lib/queries/ministries";
import { deleteMinistry } from "@/lib/actions/ministries";
import { Panel } from "@/components/admin/Panel";
import { MinistryDialog } from "@/components/admin/MinistryDialog";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Ministérios" };

export default async function MinisteriosPage() {
  const actor = await getActor();
  if (!isEditor(actor)) {
    return <p className="text-soft">Só mídia/admin gerenciam ministérios.</p>;
  }

  const ministries = await getMinistries();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Ministérios</h1>
        <MinistryDialog
          trigger={
            <span className="flex items-center gap-2">
              <Plus size={18} strokeWidth={2} aria-hidden="true" /> Novo ministério
            </span>
          }
          triggerClassName="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper"
        />
      </div>

      <Panel className="p-0">
        {ministries.length === 0 ? (
          <p className="p-8 text-soft">Nenhum ministério cadastrado ainda.</p>
        ) : (
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="border-b border-line text-xs font-extrabold text-soft uppercase">
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Horário</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {ministries.map((ministry) => (
                <tr key={ministry.id} className="border-b border-line last:border-0">
                  <td className="px-6 py-4 font-bold">{ministry.name}</td>
                  <td className="px-6 py-4 text-soft">{ministry.schedule ?? "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <MinistryDialog
                        ministry={ministry}
                        trigger={<Pencil size={18} strokeWidth={2} aria-hidden="true" />}
                        triggerClassName="flex size-9 items-center justify-center rounded-lg text-soft hover:bg-sand hover:text-ink"
                      />
                      <DeleteButton
                        itemId={ministry.id}
                        itemTitle={ministry.name}
                        itemLabel="ministério"
                        listHref="/backstage/ministerios"
                        deleteAction={deleteMinistry}
                        variant="icon"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
