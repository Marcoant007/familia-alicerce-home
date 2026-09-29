"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import type { Album, Event } from "@/generated/prisma/client";
import { FormField, fieldInputClass } from "@/components/admin/FormField";
import { ImageDrop } from "@/components/admin/ImageDrop";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createAlbum, updateAlbum, type AlbumActionState } from "@/lib/actions/albums";

function toDateInput(date: Date | null | undefined) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function AlbumDialog({
  album,
  events,
  trigger,
  triggerClassName,
}: {
  album?: Album;
  events: Event[];
  trigger?: React.ReactNode;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(album?.title ?? "");
  const [coverPath, setCoverPath] = useState<string | null>(album?.coverPath ?? null);
  const [created, setCreated] = useState<{ id: string; title: string } | null>(null);
  const action = album ? updateAlbum.bind(null, album.id) : createAlbum;
  const [state, formAction, pending] = useActionState<AlbumActionState, FormData>(action, undefined);

  useEffect(() => {
    if (open && state?.id) {
      if (album) {
        setOpen(false);
      } else {
        setCreated({ id: state.id, title });
      }
      router.refresh();
    }
  }, [state, open, router, title, album]);

  function close() {
    setOpen(false);
    // limpa depois da animação de fechar, pra não trocar o conteúdo à vista
    setTimeout(() => {
      setCreated(null);
      if (!album) {
        setTitle("");
        setCoverPath(null);
      }
    }, 200);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      <DialogTrigger className={triggerClassName}>
        {trigger ?? (album ? "Editar" : "Novo álbum")}
      </DialogTrigger>
      <DialogContent>
        {created ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 size={32} strokeWidth={2} aria-hidden="true" />
            </div>
            <DialogHeader>
              <DialogTitle>Álbum criado!</DialogTitle>
            </DialogHeader>
            <p className="text-[15px] text-soft">“{created.title}” já está na lista.</p>
            <DialogFooter className="w-full">
              <DialogClose onClick={close} className="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper">
                Fechar
              </DialogClose>
            </DialogFooter>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{album ? "Editar álbum" : "Novo álbum"}</DialogTitle>
            </DialogHeader>
            <form action={formAction} className="flex flex-col gap-4">
              {state?.error ? <p className="text-sm font-bold text-danger">{state.error}</p> : null}
              <FormField label="Título" htmlFor="title" error={state?.fieldErrors?.title}>
                <input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={fieldInputClass(!!state?.fieldErrors?.title)}
                  required
                />
              </FormField>

              <FormField label="Capa (opcional)">
                <ImageDrop value={coverPath} name="coverPath" pathPrefix="galeria" onChange={setCoverPath} />
              </FormField>

              <FormField label="Link da pasta do Google Drive" htmlFor="driveUrl" error={state?.fieldErrors?.driveUrl}>
                <input
                  id="driveUrl"
                  name="driveUrl"
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/..."
                  defaultValue={album?.driveUrl ?? ""}
                  className={fieldInputClass(!!state?.fieldErrors?.driveUrl)}
                  required
                />
              </FormField>
              <div className="rounded-xl bg-sand px-4 py-3 text-sm text-soft">
                <p className="font-bold text-ink">Como pegar o link:</p>
                <ol className="mt-1 list-decimal pl-4">
                  <li>No Google Drive, clique com o botão direito na pasta com as fotos</li>
                  <li>
                    Compartilhar → Acesso geral → mude para <b>&quot;Qualquer pessoa com o link&quot;</b>
                  </li>
                  <li>Copiar link e colar aqui em cima</li>
                </ol>
              </div>

              <FormField label="Evento (opcional)" htmlFor="eventId">
                <select id="eventId" name="eventId" defaultValue={album?.eventId ?? ""} className={fieldInputClass()}>
                  <option value="">Nenhum</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Data (opcional)" htmlFor="takenOn">
                <input
                  id="takenOn"
                  name="takenOn"
                  type="date"
                  defaultValue={toDateInput(album?.takenOn)}
                  className={fieldInputClass()}
                />
              </FormField>
              <DialogFooter>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper disabled:opacity-50"
                >
                  {album ? "Salvar" : "Criar álbum"}
                </button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
