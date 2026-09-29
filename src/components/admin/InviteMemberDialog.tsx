"use client";

import { useActionState, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Ministry } from "@/generated/prisma/client";
import { FormField, fieldInputClass } from "@/components/admin/FormField";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { inviteMember, type StaffActionState } from "@/lib/actions/staff";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin", hint: "Acesso total ao painel, inclusive equipe e auditoria" },
  { value: "MIDIA", label: "Mídia", hint: "Publica e edita conteúdo de qualquer ministério" },
  { value: "LIDER", label: "Líder", hint: "Cria e envia conteúdo do ministério dele para aprovação" },
] as const;

export function InviteMemberDialog({
  ministries,
  trigger,
  triggerClassName,
}: {
  ministries: Ministry[];
  trigger: React.ReactNode;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [state, formAction, pending] = useActionState<StaffActionState, FormData>(inviteMember, undefined);

  useEffect(() => {
    if (open && state && !state.error) {
      setOpen(false);
      setRoles([]);
      router.push(`${pathname}?saved=invite`);
    }
  }, [state, open, router, pathname]);

  function toggleRole(value: string) {
    setRoles((prev) => (prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={triggerClassName}>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar para a equipe</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {state?.error ? <p className="text-sm font-bold text-danger">{state.error}</p> : null}
          <FormField label="E-mail" htmlFor="email" error={state?.fieldErrors?.email}>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="pessoa@exemplo.com"
              className={fieldInputClass(!!state?.fieldErrors?.email)}
              required
            />
          </FormField>

          <FormField label="Papéis" error={state?.fieldErrors?.roles}>
            <div className="flex flex-col gap-2">
              {ROLE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-line px-4 py-3 has-[:checked]:border-ink"
                >
                  <input
                    type="checkbox"
                    name="roles"
                    value={option.value}
                    checked={roles.includes(option.value)}
                    onChange={() => toggleRole(option.value)}
                    className="mt-1 size-4 accent-ink"
                  />
                  <span className="flex flex-col">
                    <span className="text-[15px] font-extrabold">{option.label}</span>
                    <span className="text-sm text-soft">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </FormField>

          {roles.includes("LIDER") ? (
            <FormField label="Ministério do líder" htmlFor="ministryId" error={state?.fieldErrors?.ministryId}>
              <select
                id="ministryId"
                name="ministryId"
                className={fieldInputClass(!!state?.fieldErrors?.ministryId)}
                required
              >
                <option value="">Escolha um ministério</option>
                {ministries.map((ministry) => (
                  <option key={ministry.id} value={ministry.id}>
                    {ministry.name}
                  </option>
                ))}
              </select>
            </FormField>
          ) : null}

          <DialogFooter>
            <button
              type="submit"
              disabled={pending || roles.length === 0}
              className="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper disabled:opacity-50"
            >
              Enviar convite
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
