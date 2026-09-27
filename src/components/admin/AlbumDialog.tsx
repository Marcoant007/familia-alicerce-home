"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Event } from "@/generated/prisma/client";
import { FormField, fieldInputClass } from "@/components/admin/FormField";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createAlbum, type AlbumActionState } from "@/lib/actions/albums";

export function AlbumDialog({ events }: { events: Event[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<AlbumActionState, FormData>(createAlbum, undefined);

  useEffect(() => {
    if (open && state?.id) {
      setOpen(false);
      toast.success("Álbum criado!");
      router.push(`/backstage/galeria/${state.id}`);
    }
  }, [state, open, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper">
        Novo álbum
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo álbum</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {state?.error ? <p className="text-sm font-bold text-danger">{state.error}</p> : null}
          <FormField label="Título" htmlFor="title" error={state?.fieldErrors?.title}>
            <input
              id="title"
              name="title"
              className={fieldInputClass(!!state?.fieldErrors?.title)}
              required
            />
          </FormField>
          <FormField label="Evento (opcional)" htmlFor="eventId">
            <select id="eventId" name="eventId" className={fieldInputClass()}>
              <option value="">Nenhum</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Data (opcional)" htmlFor="takenOn">
            <input id="takenOn" name="takenOn" type="date" className={fieldInputClass()} />
          </FormField>
          <DialogFooter>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper disabled:opacity-50"
            >
              Criar álbum
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
