"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { Star, Trash2, Upload } from "lucide-react";
import { cn } from "cn";
import type { Photo } from "@/generated/prisma/client";
import { addPhoto, deletePhoto, reorderPhotos, setCoverPhoto } from "@/lib/actions/albums";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function PhotoGrid({
  albumId,
  photos,
  coverPath,
  canManage,
  actorId,
}: {
  albumId: string;
  photos: Photo[];
  coverPath: string | null;
  canManage: boolean;
  actorId: string;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState<{ name: string; progress: number }[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [order, setOrder] = useState(photos);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setOrder(photos), [photos]);

  async function handleFiles(files: FileList) {
    const list = Array.from(files);
    for (const file of list) {
      if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_SIZE) continue;
      setUploading((u) => [...u, { name: file.name, progress: 0 }]);
      try {
        const blob = await upload(`galeria/${albumId}/${Date.now()}-${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          onUploadProgress: (p) =>
            setUploading((u) => u.map((f) => (f.name === file.name ? { ...f, progress: p.percentage } : f))),
        });
        await addPhoto(albumId, blob.url);
      } finally {
        setUploading((u) => u.filter((f) => f.name !== file.name));
      }
    }
    router.refresh();
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const next = [...order];
    const from = next.findIndex((p) => p.id === dragId);
    const to = next.findIndex((p) => p.id === targetId);
    next.splice(to, 0, next.splice(from, 1)[0]);
    setOrder(next);
    setDragId(null);
    startTransition(() => reorderPhotos(albumId, next.map((p) => p.id)));
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-27.5 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#D6D3CB] bg-paper text-[15px] font-bold text-soft"
        >
          <Upload size={18} strokeWidth={2} aria-hidden="true" />
          Toque para escolher fotos (várias de uma vez)
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {uploading.map((f) => (
          <p key={f.name} className="mt-2 text-sm text-soft">
            Enviando {f.name}... {f.progress}%
          </p>
        ))}
      </div>

      {order.length === 0 ? (
        <p className="text-soft">Nenhuma foto neste álbum ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {order.map((photo) => (
            <div
              key={photo.id}
              draggable
              onDragStart={() => setDragId(photo.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(photo.id)}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-sand"
            >
              <Image src={photo.path} alt={photo.caption ?? ""} fill sizes="200px" className="object-cover" />
              {photo.path === coverPath ? (
                <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs font-extrabold text-on-accent">
                  <Star size={12} strokeWidth={2} aria-hidden="true" /> Capa
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-linear-to-t from-ink/70 to-transparent p-2 opacity-0 group-hover:opacity-100">
                {photo.path !== coverPath ? (
                  <button
                    type="button"
                    title="Definir como capa"
                    onClick={() =>
                      startTransition(async () => {
                        await setCoverPhoto(albumId, photo.path);
                        router.refresh();
                      })
                    }
                    className="flex size-8 items-center justify-center rounded-full bg-paper/90 text-ink"
                  >
                    <Star size={14} strokeWidth={2} aria-hidden="true" />
                  </button>
                ) : null}
                {canManage || photo.uploadedById === actorId ? (
                  <button
                    type="button"
                    title="Excluir foto"
                    onClick={() =>
                      startTransition(async () => {
                        await deletePhoto(photo.id);
                        router.refresh();
                      })
                    }
                    className={cn("flex size-8 items-center justify-center rounded-full bg-paper/90 text-danger")}
                  >
                    <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
