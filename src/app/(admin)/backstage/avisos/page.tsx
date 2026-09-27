import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { getActor, isEditor } from "@/lib/auth-and-audit";
import { getAdminAnnouncements } from "@/lib/queries/announcements";
import { deleteAnnouncement } from "@/lib/actions/announcements";
import { Panel } from "@/components/admin/Panel";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SaveSuccessDialog } from "@/components/admin/SaveSuccessDialog";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatRelative } from "@/lib/format";
import type { ContentStatus } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Avisos" };

const STATUS_TABS: { value: ContentStatus | undefined; label: string }[] = [
  { value: undefined, label: "Todos" },
  { value: "DRAFT", label: "Rascunho" },
  { value: "PENDING", label: "Aguardando aprovação" },
  { value: "PUBLISHED", label: "Publicado" },
];

export default async function AvisosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const actor = await getActor();
  const statusFilter = (status as ContentStatus | undefined) ?? undefined;
  const announcements = await getAdminAnnouncements(actor, statusFilter);
  const editor = isEditor(actor);

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <SaveSuccessDialog messages={{ publish: "Aviso publicado!", draft: "Rascunho salvo!", submit: "Enviado para aprovação!" }} />
      </Suspense>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Avisos</h1>
        <Link
          href="/backstage/avisos/novo"
          className="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper"
        >
          Novo aviso
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/backstage/avisos?status=${tab.value}` : "/backstage/avisos"}
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
        {announcements.length === 0 ? (
          <p className="p-8 text-soft">Nenhum aviso por aqui ainda.</p>
        ) : (
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="border-b border-line text-xs font-extrabold text-soft uppercase">
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Publica em</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ministério</th>
                <th className="px-6 py-4">Autor</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="border-b border-line last:border-0">
                  <td className="px-6 py-4">
                    <Link href={`/backstage/avisos/${announcement.id}`} className="font-bold hover:text-soft">
                      {announcement.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-soft">{formatRelative(announcement.publishAt)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={announcement.status} />
                  </td>
                  <td className="px-6 py-4 text-soft">{announcement.ministry?.name ?? "—"}</td>
                  <td className="px-6 py-4 text-soft">{announcement.createdBy?.name ?? "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/backstage/avisos/${announcement.id}`}
                        aria-label={`Editar ${announcement.title}`}
                        title="Editar"
                        className="flex size-9 items-center justify-center rounded-lg text-soft hover:bg-sand hover:text-ink"
                      >
                        <Pencil size={18} strokeWidth={2} aria-hidden="true" />
                      </Link>
                      {editor ? (
                        <DeleteButton
                          itemId={announcement.id}
                          itemTitle={announcement.title}
                          itemLabel="aviso"
                          listHref="/backstage/avisos"
                          deleteAction={deleteAnnouncement}
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
