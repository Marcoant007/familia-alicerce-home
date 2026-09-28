"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Panel } from "@/components/admin/Panel";
import { regeneratePanelToken } from "@/lib/actions/panel-gate";
import { formatRelative } from "@/lib/format";

export function PanelTokenCard({ setAt }: { setAt: Date | null }) {
  const [pending, startTransition] = useTransition();
  const [newToken, setNewToken] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function generate() {
    startTransition(async () => {
      const result = await regeneratePanelToken();
      if (result?.token) {
        setNewToken(result.token);
        setOpen(false);
        toast.success("Novo token gerado");
      }
    });
  }

  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <KeyRound size={20} strokeWidth={2} aria-hidden="true" />
        <div>
          <h2 className="text-lg font-extrabold">Token de acesso ao painel</h2>
          <p className="text-sm text-soft">
            {setAt ? `Gerado ${formatRelative(setAt)}` : "Nenhum token gerado ainda — o portão extra fica desativado."}
          </p>
        </div>
      </div>

      {newToken ? (
        <div className="flex flex-col gap-2 rounded-2xl border-2 border-accent/40 bg-accent/10 p-5">
          <p className="text-sm font-bold text-ink">
            Guarde agora — esse token só aparece essa vez. Compartilhe com a equipe por um canal seguro.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-xl bg-card px-4 py-3 text-sm">{newToken}</code>
            <button
              type="button"
              aria-label="Copiar token"
              onClick={() => {
                navigator.clipboard.writeText(newToken);
                toast.success("Copiado!");
              }}
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink text-paper"
            >
              <Copy size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="self-start rounded-full border-2 border-ink px-6 py-3 text-[15px] font-extrabold disabled:opacity-50">
          Gerar novo token
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar novo token?</DialogTitle>
          </DialogHeader>
          <p className="text-[15px] text-soft">
            O token atual para de funcionar na hora. Quem ainda não confirmou nesta sessão vai precisar do
            token novo pra entrar no painel.
          </p>
          <DialogFooter>
            <DialogClose className="rounded-full px-6 py-3 text-[15px] font-extrabold text-soft">
              Cancelar
            </DialogClose>
            <button
              type="button"
              disabled={pending}
              onClick={generate}
              className="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper disabled:opacity-50"
            >
              Gerar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
