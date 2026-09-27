import type { Metadata } from "next";
import { Plus, Pencil } from "lucide-react";
import { isEditor, getActor } from "@/lib/auth-and-audit";
import { getServices } from "@/lib/queries/services";
import { deleteService } from "@/lib/actions/services";
import { Panel } from "@/components/admin/Panel";
import { ServiceDialog } from "@/components/admin/ServiceDialog";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { WEEKDAY_FULL, formatServiceTime } from "@/lib/format";

export const metadata: Metadata = { title: "Cultos" };

export default async function CultosPage() {
  const actor = await getActor();
  if (!isEditor(actor)) {
    return <p className="text-soft">Só mídia/admin gerenciam cultos.</p>;
  }

  const services = await getServices();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Cultos</h1>
        <ServiceDialog
          trigger={
            <span className="flex items-center gap-2">
              <Plus size={18} strokeWidth={2} aria-hidden="true" /> Novo culto
            </span>
          }
          triggerClassName="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper"
        />
      </div>

      <Panel className="p-0">
        {services.length === 0 ? (
          <p className="p-8 text-soft">Nenhum culto cadastrado ainda.</p>
        ) : (
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="border-b border-line text-xs font-extrabold text-soft uppercase">
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Dia</th>
                <th className="px-6 py-4">Horário</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-line last:border-0">
                  <td className="px-6 py-4 font-bold">{service.name}</td>
                  <td className="px-6 py-4 text-soft">{WEEKDAY_FULL[service.weekday]}</td>
                  <td className="px-6 py-4 text-soft">{formatServiceTime(service.startsAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ServiceDialog
                        service={service}
                        trigger={<Pencil size={18} strokeWidth={2} aria-hidden="true" />}
                        triggerClassName="flex size-9 items-center justify-center rounded-lg text-soft hover:bg-sand hover:text-ink"
                      />
                      <DeleteButton
                        itemId={service.id}
                        itemTitle={service.name}
                        itemLabel="culto"
                        listHref="/backstage/cultos"
                        deleteAction={deleteService}
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
