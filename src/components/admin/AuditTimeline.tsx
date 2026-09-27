import type { AuditLog } from "@/generated/prisma/client";
import { formatRelative } from "@/lib/format";

const VERB: Record<string, string> = {
  CREATE: "criou",
  UPDATE: "atualizou",
  DELETE: "removeu",
  PUBLISH: "publicou",
  UNPUBLISH: "despublicou",
  SUBMIT: "enviou para aprovação",
  APPROVE: "aprovou",
  REJECT: "devolveu",
  UPLOAD: "enviou uma foto em",
  ROLE_GRANT: "concedeu papel em",
  ROLE_REVOKE: "removeu papel de",
  SETTINGS_CHANGE: "alterou",
};

export function AuditTimeline({ entries }: { entries: AuditLog[] }) {
  if (entries.length === 0) {
    return <p className="text-soft">Nenhuma atividade registrada ainda.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {entries.map((entry) => (
        <li key={entry.id} className="flex flex-col gap-1 border-b border-line pb-4 last:border-0">
          <p className="text-[15px]">
            <b>{entry.actorName}</b> {VERB[entry.action] ?? entry.action.toLowerCase()}{" "}
            {entry.entityLabel ? <span className="font-bold">{entry.entityLabel}</span> : null}
          </p>
          <p className="text-sm text-soft">{formatRelative(entry.createdAt)}</p>
          {entry.note ? <p className="text-sm text-soft italic">“{entry.note}”</p> : null}
          {entry.changes ? (
            <details className="mt-1 text-sm text-soft">
              <summary className="cursor-pointer font-bold">Ver alterações</summary>
              <ul className="mt-2 flex flex-col gap-1">
                {Object.entries(entry.changes as Record<string, { from: unknown; to: unknown }>).map(
                  ([field, change]) => (
                    <li key={field}>
                      <b>{field}</b>: {String(change.from ?? "—")} → {String(change.to ?? "—")}
                    </li>
                  )
                )}
              </ul>
            </details>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
