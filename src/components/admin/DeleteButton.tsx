"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Trash2 } from "lucide-react";
import { cn } from "cn";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteButton({
  itemId,
  itemTitle,
  itemLabel,
  listHref,
  deleteAction,
  variant = "full",
}: {
  itemId: string;
  itemTitle: string;
  /** ex.: "evento", "aviso" — usado nas frases do modal */
  itemLabel: string;
  listHref: string;
  deleteAction: (id: string) => Promise<void>;
  variant?: "full" | "icon";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <Dialog>
      <DialogTrigger
        aria-label={variant === "icon" ? `Excluir ${itemTitle}` : undefined}
        title={variant === "icon" ? "Excluir" : undefined}
        className={cn(
          "font-extrabold text-danger",
          variant === "full"
            ? "rounded-full border-2 border-danger px-6 py-4 text-[15px]"
            : "flex size-9 items-center justify-center rounded-lg hover:bg-danger/10"
        )}
      >
        {variant === "full" ? `Excluir ${itemLabel}` : <Trash2 size={18} strokeWidth={2} aria-hidden="true" />}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir “{itemTitle}”?</DialogTitle>
        </DialogHeader>
        <p className="text-[15px] text-soft">
          Isso remove o {itemLabel} e a imagem dele (se tiver uma) pra sempre. Não dá pra desfazer.
        </p>
        <DialogFooter>
          <DialogClose className="rounded-full px-6 py-3 text-[15px] font-extrabold text-soft">
            Cancelar
          </DialogClose>
          <DialogClose
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await deleteAction(itemId);
                if (pathname !== listHref) router.push(listHref);
                else router.refresh();
              })
            }
            className="rounded-full bg-danger px-6 py-3 text-[15px] font-extrabold text-paper disabled:opacity-50"
          >
            Excluir
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
