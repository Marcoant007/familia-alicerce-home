"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { driveImageUrl, type DriveImage } from "@/lib/google-drive";

export function DriveGallery({ images }: { images: DriveImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return <p className="text-soft">Nenhuma foto encontrada nessa pasta ainda.</p>;
  }

  const current = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="relative aspect-square overflow-hidden rounded-2xl bg-sand focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Image
              src={driveImageUrl(image.id, 400)}
              alt={image.name}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              quality={90}
              className="object-cover"
              unoptimized
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
            <Image
              src={driveImageUrl(current.id, 1600)}
              alt={current.name}
              fill
              sizes="100vw"
              className="object-contain"
              unoptimized
            />
          </div>

          {openIndex! < images.length - 1 ? (
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
