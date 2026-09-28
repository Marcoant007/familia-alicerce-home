import type { Metadata } from "next";
import { getActor, hasRole } from "@/lib/auth-and-audit";
import { getFilteredAuditLog } from "@/lib/queries/audit";
import { getStaffMembers } from "@/lib/queries/staff";
import { Panel } from "@/components/admin/Panel";
import { AuditTimeline } from "@/components/admin/AuditTimeline";
import type { AuditAction, AuditEntity } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Auditoria" };

const ENTITY_LABELS: Record<AuditEntity, string> = {
  EVENT: "Evento",
  ANNOUNCEMENT: "Aviso",
  ALBUM: "Álbum",
  PHOTO: "Foto",
  MINISTRY: "Ministério",
  SERVICE: "Culto",
  SITE_SETTINGS: "Aparência",
  STAFF_MEMBER: "Equipe",
};

const ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: "Criou",
  UPDATE: "Atualizou",
  DELETE: "Removeu",
  PUBLISH: "Publicou",
  UNPUBLISH: "Despublicou",
  SUBMIT: "Enviou p/ aprovação",
  APPROVE: "Aprovou",
  REJECT: "Devolveu",
  UPLOAD: "Enviou foto",
  ROLE_GRANT: "Concedeu papel",
  ROLE_REVOKE: "Removeu papel",
  SETTINGS_CHANGE: "Alterou config.",
};

const ENTITY_VALUES = Object.keys(ENTITY_LABELS) as AuditEntity[];
const ACTION_VALUES = Object.keys(ACTION_LABELS) as AuditAction[];

function isEntity(value: string): value is AuditEntity {
  return (ENTITY_VALUES as string[]).includes(value);
}

function isAction(value: string): value is AuditAction {
  return (ACTION_VALUES as string[]).includes(value);
}

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ pessoa?: string; tipo?: string; acao?: string; de?: string; ate?: string }>;
}) {
  const actor = await getActor();
  if (!hasRole(actor, "ADMIN")) {
    return <p className="text-soft">Só admins veem a auditoria.</p>;
  }

  const params = await searchParams;
  const filters = {
    actorId: params.pessoa || undefined,
    entityType: params.tipo && isEntity(params.tipo) ? params.tipo : undefined,
    action: params.acao && isAction(params.acao) ? params.acao : undefined,
    from: params.de ? new Date(`${params.de}T00:00:00`) : undefined,
    to: params.ate ? new Date(`${params.ate}T23:59:59`) : undefined,
  };

  const hasFilters = Object.values(params).some(Boolean);
  const [entries, members] = await Promise.all([getFilteredAuditLog(filters, 150), getStaffMembers()]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Auditoria</h1>

      <Panel>
        <form className="flex flex-wrap items-end gap-4" method="GET">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pessoa" className="text-sm font-extrabold">
              Pessoa
            </label>
            <select
              id="pessoa"
              name="pessoa"
              defaultValue={params.pessoa ?? ""}
              className="h-11 min-w-[160px] rounded-xl border-2 border-line bg-card px-3 text-sm outline-none focus:border-ink"
            >
              <option value="">Todas</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="tipo" className="text-sm font-extrabold">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              defaultValue={params.tipo ?? ""}
              className="h-11 min-w-[140px] rounded-xl border-2 border-line bg-card px-3 text-sm outline-none focus:border-ink"
            >
              <option value="">Todos</option>
              {ENTITY_VALUES.map((value) => (
                <option key={value} value={value}>
                  {ENTITY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="acao" className="text-sm font-extrabold">
              Ação
            </label>
            <select
              id="acao"
              name="acao"
              defaultValue={params.acao ?? ""}
              className="h-11 min-w-[160px] rounded-xl border-2 border-line bg-card px-3 text-sm outline-none focus:border-ink"
            >
              <option value="">Todas</option>
              {ACTION_VALUES.map((value) => (
                <option key={value} value={value}>
                  {ACTION_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="de" className="text-sm font-extrabold">
              De
            </label>
            <input
              id="de"
              name="de"
              type="date"
              defaultValue={params.de ?? ""}
              className="h-11 rounded-xl border-2 border-line bg-card px-3 text-sm outline-none focus:border-ink"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ate" className="text-sm font-extrabold">
              Até
            </label>
            <input
              id="ate"
              name="ate"
              type="date"
              defaultValue={params.ate ?? ""}
              className="h-11 rounded-xl border-2 border-line bg-card px-3 text-sm outline-none focus:border-ink"
            />
          </div>

          <button
            type="submit"
            className="h-11 rounded-full bg-ink px-6 text-sm font-extrabold text-paper"
          >
            Filtrar
          </button>
          {hasFilters ? (
            <a href="/backstage/auditoria" className="h-11 px-2 text-sm font-extrabold text-soft">
              Limpar
            </a>
          ) : null}
        </form>
      </Panel>

      <Panel>
        <AuditTimeline entries={entries} />
      </Panel>
    </div>
  );
}
