import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { getActor, isEditor } from "@/lib/auth-and-audit";
import { getAdminEvents } from "@/lib/queries/events";
import { Panel } from "@/components/admin/Panel";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SaveSuccessDialog } from "@/components/admin/SaveSuccessDialog";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteEvent } from "@/lib/actions/events";
import { formatEventMoment } from "@/lib/format";
import type { ContentStatus } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Eventos" };

const STATUS_TABS: { value: ContentStatus | undefined; label: string }[] = [
  { value: undefined, label: "Todos" },
  { value: "DRAFT", label: "Rascunho" },
  { value: "PENDING", label: "Aguardando aprovação" },
  { value: "PUBLISHED", label: "Publicado" },
];

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const actor = await getActor();
  const statusFilter = (status as ContentStatus | undefined) ?? undefined;
  const events = await getAdminEvents(actor, statusFilter);
  const editor = isEditor(actor);

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <SaveSuccessDialog messages={{ publish: "Evento publicado!", draft: "Rascunho salvo!", submit: "Enviado para aprovação!" }} />
      </Suspense>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Eventos</h1>
        <Link
          href="/backstage/eventos/novo"
          className="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper"
        >
          Novo evento
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/backstage/eventos?status=${tab.value}` : "/backstage/eventos"}
            className={
              "rounded-full border-2 px-4 py-2 text-sm font-extrabold " +
              (statusFilter === tab.value ? "border-ink bg-ink text-paper" : "border-line text-soft")
            }
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Panel className="p-0">
        {events.length === 0 ? (
          <p className="p-8 text-soft">Nenhum evento por aqui ainda.</p>
        ) : (
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="border-b border-line text-xs font-extrabold text-soft uppercase">
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Início</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ministério</th>
                <th className="px-6 py-4">Autor</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-line last:border-0">
                  <td className="px-6 py-4">
                    <Link href={`/backstage/eventos/${event.id}`} className="font-bold hover:text-soft">
                      {event.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-soft">{formatEventMoment(event.startsAt)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={event.status} />
                  </td>
                  <td className="px-6 py-4 text-soft">{event.ministry?.name ?? "—"}</td>
                  <td className="px-6 py-4 text-soft">{event.createdBy?.name ?? "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/backstage/eventos/${event.id}`}
                        aria-label={`Editar ${event.title}`}
                        title="Editar"
                        className="flex size-9 items-center justify-center rounded-lg text-soft hover:bg-sand hover:text-ink"
                      >
                        <Pencil size={18} strokeWidth={2} aria-hidden="true" />
                      </Link>
                      {editor ? (
                        <DeleteButton
                          itemId={event.id}
                          itemTitle={event.title}
                          itemLabel="evento"
                          listHref="/backstage/eventos"
                          deleteAction={deleteEvent}
                          variant="icon"
                        />
                      ) : null}
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
