"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { X } from "lucide-react";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageDrop({
  value,
  onChange,
  name,
  pathPrefix = "eventos",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  name?: string;
  pathPrefix?: string;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Envie um arquivo JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Arquivo acima de 5 MB.");
      return;
    }

    setProgress(0);
    try {
      const blob = await upload(`${pathPrefix}/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
        onUploadProgress: (p) => setProgress(p.percentage),
      });
      onChange(blob.url);
    } catch {
      setError("Não deu pra subir a imagem. Tenta de novo.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Sempre presente e na mesma posição, pra nunca trocar de tipo/controle com o <input type="file"> abaixo. */}
      {name ? <input type="hidden" name={name} value={value ?? ""} readOnly /> : null}

      {value ? (
        <div className="relative h-27.5 w-full overflow-hidden rounded-2xl border-2 border-line bg-sand">
          <Image src={value} alt="" fill sizes="400px" quality={90} className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remover imagem"
            className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-ink/80 text-paper"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-27.5 w-full items-center justify-center rounded-2xl border-2 border-dashed border-[#D6D3CB] bg-paper text-[15px] font-bold text-soft"
        >
          {progress !== null ? `Enviando... ${progress}%` : "Toque para escolher uma foto"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error ? <p className="text-sm font-bold text-danger">{error}</p> : null}
    </div>
  );
}
