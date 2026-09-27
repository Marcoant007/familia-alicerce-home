import type { ContentStatus } from "@/generated/prisma/client";
import { cn } from "cn";

const LABELS: Record<ContentStatus, string> = {
  DRAFT: "Rascunho",
  PENDING: "Aguardando aprovação",
  PUBLISHED: "Publicado",
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold",
        status === "DRAFT" && "bg-sand text-soft",
        status === "PENDING" && "bg-accent text-on-accent",
        status === "PUBLISHED" && "text-success"
      )}
    >
      {status === "PUBLISHED" ? <span className="size-1.5 rounded-full bg-success" /> : null}
      {LABELS[status]}
    </span>
  );
}
