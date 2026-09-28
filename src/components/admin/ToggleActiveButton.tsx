"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toggleStaffActive } from "@/lib/actions/staff";

export function ToggleActiveButton({
  staffMemberId,
  staffName,
  active,
  isSelf,
}: {
  staffMemberId: string;
  staffName: string;
  active: boolean;
  isSelf?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (active && isSelf) {
    return <span className="text-sm text-soft">—</span>;
  }

  function run(nextActive: boolean) {
    startTransition(async () => {
      try {
        await toggleStaffActive(staffMemberId, nextActive);
        toast.success(nextActive ? "Acesso reativado" : "Acesso desativado");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não deu pra atualizar o acesso.");
      }
    });
  }

  if (active) {
    return (
      <Dialog>
        <DialogTrigger
          disabled={pending}
          className="rounded-full border-2 border-danger px-5 py-2 text-sm font-extrabold text-danger disabled:opacity-50"
        >
          Desativar
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desativar acesso de {staffName}?</DialogTitle>
          </DialogHeader>
          <p className="text-[15px] text-soft">
            {staffName} não vai mais conseguir entrar no painel. O histórico e a auditoria continuam guardados.
          </p>
          <DialogFooter>
            <DialogClose className="rounded-full px-6 py-3 text-[15px] font-extrabold text-soft">
              Cancelar
            </DialogClose>
            <DialogClose
              onClick={() => run(false)}
              className="rounded-full bg-danger px-6 py-3 text-[15px] font-extrabold text-paper"
            >
              Desativar
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => run(true)}
      className="rounded-full border-2 border-ink px-5 py-2 text-sm font-extrabold disabled:opacity-50"
    >
      Reativar
    </button>
  );
}
