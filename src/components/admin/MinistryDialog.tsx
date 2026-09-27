"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { createMinistry, updateMinistry, type MinistryActionState } from "@/lib/actions/ministries";

export function MinistryDialog({
  ministry,
  trigger,
  triggerClassName,
}: {
  ministry?: Ministry;
  trigger: React.ReactNode;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const action = ministry ? updateMinistry.bind(null, ministry.id) : createMinistry;
  const [state, formAction, pending] = useActionState<MinistryActionState, FormData>(action, undefined);

  useEffect(() => {
    if (open && state && !state.error) {
      setOpen(false);
      toast.success(ministry ? "Ministério atualizado!" : "Ministério criado!");
      router.refresh();
    }
  }, [state, open, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={triggerClassName}>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ministry ? "Editar ministério" : "Novo ministério"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {state?.error ? <p className="text-sm font-bold text-danger">{state.error}</p> : null}
          <FormField label="Nome" htmlFor="name" error={state?.fieldErrors?.name}>
            <input
              id="name"
              name="name"
              defaultValue={ministry?.name}
              className={fieldInputClass(!!state?.fieldErrors?.name)}
              required
            />
          </FormField>
          <FormField label="Horário" htmlFor="schedule">
            <input
              id="schedule"
              name="schedule"
              placeholder="ex.: Sábados, 19h"
              defaultValue={ministry?.schedule ?? ""}
              className={fieldInputClass()}
            />
          </FormField>
          <FormField label="Descrição" htmlFor="description">
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={ministry?.description ?? ""}
              className={fieldInputClass() + " h-auto py-3"}
            />
          </FormField>
          <FormField label="Ordem" htmlFor="sortOrder">
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={ministry?.sortOrder ?? 0}
              className={fieldInputClass()}
            />
          </FormField>
          <DialogFooter>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper disabled:opacity-50"
            >
              Salvar
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
