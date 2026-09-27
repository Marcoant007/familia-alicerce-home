"use client";

import { useState, useTransition } from "react";
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

export function ApprovalActions({
  entityId,
  entityLabel,
  onApprove,
  onReject,
}: {
  entityId: string;
  entityLabel: string;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, note: string) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-3 rounded-2xl border-2 border-accent/40 bg-accent/10 p-5">
      <p className="w-full text-[15px] text-ink">Este {entityLabel} está aguardando sua aprovação.</p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await onApprove(entityId);
            toast.success(`${entityLabel[0].toUpperCase()}${entityLabel.slice(1)} publicado`);
          })
        }
        className="rounded-full bg-accent px-6 py-3 text-[15px] font-extrabold text-on-accent disabled:opacity-50"
      >
        Aprovar
      </button>

      <Dialog>
        <DialogTrigger className="rounded-full border-2 border-ink px-6 py-3 text-[15px] font-extrabold">
          Devolver
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Devolver {entityLabel}</DialogTitle>
          </DialogHeader>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Explica pro líder o que precisa ajustar..."
            rows={4}
            className="h-auto w-full rounded-xl border-2 border-line px-4 py-3 text-[15px] outline-none focus:border-ink"
          />
          <DialogFooter>
            <DialogClose className="rounded-full px-6 py-3 text-[15px] font-extrabold text-soft">
              Cancelar
            </DialogClose>
            <DialogClose
              disabled={!note.trim() || pending}
              onClick={() =>
                startTransition(async () => {
                  await onReject(entityId, note);
                  toast.success(`${entityLabel[0].toUpperCase()}${entityLabel.slice(1)} devolvido`);
                })
              }
              className="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper disabled:opacity-50"
            >
              Devolver
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
