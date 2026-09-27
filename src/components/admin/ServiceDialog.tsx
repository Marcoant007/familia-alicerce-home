"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Service } from "@/generated/prisma/client";
import { FormField, fieldInputClass } from "@/components/admin/FormField";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createService, updateService, type ServiceActionState } from "@/lib/actions/services";

const WEEKDAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

function toHHMM(date: Date | undefined) {
  if (!date) return "18:00";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

export function ServiceDialog({
  service,
  trigger,
  triggerClassName,
}: {
  service?: Service;
  trigger: React.ReactNode;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const action = service ? updateService.bind(null, service.id) : createService;
  const [state, formAction, pending] = useActionState<ServiceActionState, FormData>(action, undefined);

  useEffect(() => {
    if (open && state && !state.error) {
      setOpen(false);
      toast.success(service ? "Culto atualizado!" : "Culto criado!");
      router.refresh();
    }
  }, [state, open, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={triggerClassName}>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? "Editar culto" : "Novo culto"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {state?.error ? <p className="text-sm font-bold text-danger">{state.error}</p> : null}
          <FormField label="Nome" htmlFor="name" error={state?.fieldErrors?.name}>
            <input
              id="name"
              name="name"
              placeholder="ex.: Culto da Família"
              defaultValue={service?.name}
              className={fieldInputClass(!!state?.fieldErrors?.name)}
              required
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Dia da semana" htmlFor="weekday">
              <select
                id="weekday"
                name="weekday"
                defaultValue={service?.weekday ?? 0}
                className={fieldInputClass()}
              >
                {WEEKDAYS.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Horário" htmlFor="time" error={state?.fieldErrors?.time}>
              <input
                id="time"
                name="time"
                type="time"
                defaultValue={toHHMM(service?.startsAt)}
                className={fieldInputClass(!!state?.fieldErrors?.time)}
                required
              />
            </FormField>
          </div>
          <FormField label="Ordem" htmlFor="sortOrder">
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={service?.sortOrder ?? 0}
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
