"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { Ministry, StaffRole } from "@/generated/prisma/client";
import { FormField, fieldInputClass } from "@/components/admin/FormField";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { grantRole, revokeRole, type StaffActionState } from "@/lib/actions/staff";

const ROLE_LABELS = { ADMIN: "Admin", MIDIA: "Mídia", LIDER: "Líder" } as const;

type StaffMemberRole = StaffRole & { ministry: Ministry | null };

export function StaffRolesDialog({
  staffMemberId,
  staffName,
  roles,
  ministries,
  trigger,
  triggerClassName,
}: {
  staffMemberId: string;
  staffName: string;
  roles: StaffMemberRole[];
  ministries: Ministry[];
  trigger: React.ReactNode;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string>("");
  const [pendingRevoke, startRevoke] = useTransition();
  const action = grantRole.bind(null, staffMemberId);
  const [state, formAction, pending] = useActionState<StaffActionState, FormData>(action, undefined);

  useEffect(() => {
    if (open && state && !state.error) {
      setRole("");
      router.push(`${pathname}?saved=role`);
    }
  }, [state, open, router, pathname]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={triggerClassName}>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Papéis de {staffName}</DialogTitle>
        </DialogHeader>

        {roles.length === 0 ? (
          <p className="text-[15px] text-soft">Nenhum papel atribuído ainda.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-2 rounded-full bg-sand px-4 py-2 text-sm font-extrabold text-ink"
              >
                {ROLE_LABELS[r.role]}
                {r.ministry ? <span className="font-bold text-soft"> · {r.ministry.name}</span> : null}
                <button
                  type="button"
                  aria-label={`Remover papel ${ROLE_LABELS[r.role]}`}
                  disabled={pendingRevoke}
                  onClick={() =>
                    startRevoke(async () => {
                      try {
                        await revokeRole(r.id);
                        toast.success("Papel removido");
                        router.refresh();
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Não deu pra remover o papel.");
                      }
                    })
                  }
                  className="text-soft hover:text-danger disabled:opacity-50"
                >
                  <X size={14} strokeWidth={2.5} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <form action={formAction} className="flex flex-col gap-4 border-t border-line pt-4">
          {state?.error ? <p className="text-sm font-bold text-danger">{state.error}</p> : null}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Novo papel" htmlFor="role" error={state?.fieldErrors?.role}>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={fieldInputClass(!!state?.fieldErrors?.role)}
              >
                <option value="">Escolha</option>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
            {role === "LIDER" ? (
              <FormField label="Ministério" htmlFor="ministryId" error={state?.fieldErrors?.ministryId}>
                <select id="ministryId" name="ministryId" className={fieldInputClass(!!state?.fieldErrors?.ministryId)}>
                  <option value="">Escolha</option>
                  {ministries.map((ministry) => (
                    <option key={ministry.id} value={ministry.id}>
                      {ministry.name}
                    </option>
                  ))}
                </select>
              </FormField>
            ) : null}
          </div>
          <DialogFooter>
            <button
              type="submit"
              disabled={pending || !role}
              className="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper disabled:opacity-50"
            >
              Conceder papel
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
