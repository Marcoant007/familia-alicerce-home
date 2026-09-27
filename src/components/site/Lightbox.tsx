"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Photo = { id: string; path: string; caption: string | null };

export function Lightbox({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return <p className="text-soft">Nenhuma foto neste álbum ainda.</p>;
  }

  const current = openIndex !== null ? photos[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="relative aspect-square overflow-hidden rounded-2xl bg-sand focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Image
              src={photo.path}
              alt={photo.caption ?? ""}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {current ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-ink/95 p-6"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            aria-label="Fechar"
            className="absolute top-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-ink-2 text-paper"
            onClick={() => setOpenIndex(null)}
          >
            <X size={22} strokeWidth={2} aria-hidden="true" />
          </button>

          {openIndex! > 0 ? (
            <button
              type="button"
              aria-label="Foto anterior"
              className="absolute left-5 flex h-11 w-11 items-center justify-center rounded-full bg-ink-2 text-paper"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex((i) => (i !== null ? i - 1 : i));
              }}
            >
              <ChevronLeft size={22} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : null}

          <div className="relative h-[70vh] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <Image src={current.path} alt={current.caption ?? ""} fill sizes="100vw" className="object-contain" />
          </div>
          {current.caption ? <p className="text-center text-sm text-soft-dark">{current.caption}</p> : null}

          {openIndex! < photos.length - 1 ? (
            <button
              type="button"
              aria-label="Próxima foto"
              className="absolute right-5 flex h-11 w-11 items-center justify-center rounded-full bg-ink-2 text-paper"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex((i) => (i !== null ? i + 1 : i));
              }}
            >
              <ChevronRight size={22} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
