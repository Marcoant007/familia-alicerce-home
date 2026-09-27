import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getActor, hasRole, isEditor } from "@/lib/auth-and-audit";
import { EventForm } from "@/components/admin/EventForm";
import { ApprovalActions } from "@/components/admin/ApprovalActions";
import { AuditTimeline } from "@/components/admin/AuditTimeline";
import { SimpleTabs } from "@/components/admin/SimpleTabs";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { SaveSuccessDialog } from "@/components/admin/SaveSuccessDialog";
import { getEventById } from "@/lib/queries/events";
import { approveEvent, rejectEvent, deleteEvent } from "@/lib/actions/events";
import { getAllCategories } from "@/lib/queries/categories";
import { getMinistries } from "@/lib/queries/ministries";
import { getEntityAuditLog } from "@/lib/queries/audit";

export const metadata: Metadata = { title: "Editar evento" };

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActor();
  const editor = isEditor(actor);

  const event = await getEventById(id);
  if (!event) notFound();

  const ownDraft = hasRole(actor, "LIDER", event.ministryId) && event.createdById === actor.id;
  if (!editor && !ownDraft) notFound();

  const [categories, allMinistries, auditLog] = await Promise.all([
    getAllCategories(),
    getMinistries(),
    getEntityAuditLog("EVENT", id),
  ]);
  const ministries = editor ? allMinistries : allMinistries.filter((m) => hasRole(actor, "LIDER", m.id));

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <SaveSuccessDialog messages={{ draft: "Rascunho salvo!", submit: "Enviado para aprovação!" }} />
      </Suspense>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">{event.title}</h1>
        {editor ? (
          <DeleteButton
            itemId={event.id}
            itemTitle={event.title}
            itemLabel="evento"
            listHref="/backstage/eventos"
            deleteAction={deleteEvent}
          />
        ) : null}
      </div>

      {editor && event.status === "PENDING" ? (
        <ApprovalActions
          entityId={event.id}
          entityLabel="evento"
          onApprove={approveEvent}
          onReject={rejectEvent}
        />
      ) : null}

      <SimpleTabs
        tabs={[
          {
            value: "detalhes",
            label: "Detalhes",
            content: <EventForm event={event} categories={categories} ministries={ministries} isEditor={editor} />,
          },
          { value: "historico", label: "Histórico", content: <AuditTimeline entries={auditLog} /> },
        ]}
      />
    </div>
  );
}
