"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const DEFAULT_MESSAGES: Record<string, string> = {
  publish: "Publicado!",
  draft: "Rascunho salvo!",
  submit: "Enviado para aprovação!",
};

/** Lê ?saved=publish|draft|submit na URL e mostra a confirmação — depois limpa o parâmetro. */
export function SaveSuccessDialog({ messages = DEFAULT_MESSAGES }: { messages?: Record<string, string> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const saved = searchParams.get("saved");
    if (saved && messages[saved]) {
      setTitle(messages[saved]);
      setOpen(true);
    }
  }, [searchParams, messages]);

  function close() {
    setOpen(false);
    router.replace(pathname);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 size={32} strokeWidth={2} aria-hidden="true" />
        </div>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-[15px] text-soft">Sua alteração foi salva.</p>
        <DialogClose
          onClick={close}
          className="rounded-full bg-ink px-8 py-3 text-[15px] font-extrabold text-paper"
        >
          Ok
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
