import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getActor, hasRole, isEditor } from "@/lib/auth-and-audit";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { ApprovalActions } from "@/components/admin/ApprovalActions";
import { AuditTimeline } from "@/components/admin/AuditTimeline";
import { SimpleTabs } from "@/components/admin/SimpleTabs";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { SaveSuccessDialog } from "@/components/admin/SaveSuccessDialog";
import { getAnnouncementById } from "@/lib/queries/announcements";
import { getAllCategories } from "@/lib/queries/categories";
import { getMinistries } from "@/lib/queries/ministries";
import { getEntityAuditLog } from "@/lib/queries/audit";
import { approveAnnouncement, rejectAnnouncement, deleteAnnouncement } from "@/lib/actions/announcements";

export const metadata: Metadata = { title: "Editar aviso" };

export default async function EditarAvisoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActor();
  const editor = isEditor(actor);

  const announcement = await getAnnouncementById(id);
  if (!announcement) notFound();

  const ownDraft = hasRole(actor, "LIDER", announcement.ministryId) && announcement.createdById === actor.id;
  if (!editor && !ownDraft) notFound();

  const [categories, allMinistries, auditLog] = await Promise.all([
    getAllCategories(),
    getMinistries(),
    getEntityAuditLog("ANNOUNCEMENT", id),
  ]);
  const ministries = editor ? allMinistries : allMinistries.filter((m) => hasRole(actor, "LIDER", m.id));

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <SaveSuccessDialog messages={{ draft: "Rascunho salvo!", submit: "Enviado para aprovação!" }} />
      </Suspense>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">{announcement.title}</h1>
        {editor ? (
          <DeleteButton
            itemId={announcement.id}
            itemTitle={announcement.title}
            itemLabel="aviso"
            listHref="/backstage/avisos"
            deleteAction={deleteAnnouncement}
          />
        ) : null}
      </div>

      {editor && announcement.status === "PENDING" ? (
        <ApprovalActions
          entityId={announcement.id}
          entityLabel="aviso"
          onApprove={approveAnnouncement}
          onReject={rejectAnnouncement}
        />
      ) : null}

      <SimpleTabs
        tabs={[
          {
            value: "detalhes",
            label: "Detalhes",
            content: (
              <AnnouncementForm
                announcement={announcement}
                categories={categories}
                ministries={ministries}
                isEditor={editor}
              />
            ),
          },
          { value: "historico", label: "Histórico", content: <AuditTimeline entries={auditLog} /> },
        ]}
      />
    </div>
  );
}
