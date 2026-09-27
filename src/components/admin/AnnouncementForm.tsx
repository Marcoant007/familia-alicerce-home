"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Ministry, Prisma } from "@/generated/prisma/client";
import { FormField, fieldInputClass } from "@/components/admin/FormField";
import { ImageDrop } from "@/components/admin/ImageDrop";
import { NoticeCard } from "@/components/site/NoticeCard";
import {
  createAnnouncement,
  updateAnnouncement,
  type AnnouncementActionState,
} from "@/lib/actions/announcements";

type AnnouncementWithCategory = Prisma.AnnouncementGetPayload<{ include: { category: true } }>;

function toLocalInput(date: Date | null | undefined) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(
    date.getUTCHours()
  )}:${pad(date.getUTCMinutes())}`;
}

export function AnnouncementForm({
  announcement,
  categories,
  ministries,
  isEditor,
}: {
  announcement?: AnnouncementWithCategory | null;
  categories: Category[];
  ministries: Ministry[];
  isEditor: boolean;
}) {
  const router = useRouter();
  const action = announcement ? updateAnnouncement.bind(null, announcement.id) : createAnnouncement;
  const [intent, setIntent] = useState<"draft" | "submit" | "publish">("draft");
  const boundAction = (prev: AnnouncementActionState, formData: FormData) => action(intent, prev, formData);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  useEffect(() => {
    if (state?.redirectTo) router.push(state.redirectTo);
  }, [state, router]);

  const [imagePath, setImagePath] = useState<string | null>(announcement?.imagePath ?? null);

  const [preview, setPreview] = useState({
    title: announcement?.title ?? "Título do aviso",
    body: announcement?.body ?? null,
    imagePath: announcement?.imagePath ?? null,
    category: announcement?.category ?? null,
  });

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <form action={formAction} className="flex flex-col gap-6">
        {announcement?.reviewNote ? (
          <div className="rounded-2xl border-2 border-danger/30 bg-danger/5 px-5 py-4 text-[15px] text-ink">
            <b>Devolvido pela mídia:</b> {announcement.reviewNote}
          </div>
        ) : null}
        {state?.error ? <p className="text-sm font-bold text-danger">{state.error}</p> : null}

        <FormField label="Título" htmlFor="title" error={state?.fieldErrors?.title}>
          <input
            id="title"
            name="title"
            defaultValue={announcement?.title}
            onChange={(e) => setPreview((p) => ({ ...p, title: e.target.value }))}
            className={fieldInputClass(!!state?.fieldErrors?.title)}
            required
          />
        </FormField>

        <FormField label="Imagem">
          <ImageDrop
            value={imagePath}
            name="imagePath"
            pathPrefix="avisos"
            onChange={(url) => {
              setImagePath(url);
              setPreview((p) => ({ ...p, imagePath: url }));
            }}
          />
        </FormField>

        <FormField label="Texto" htmlFor="body">
          <textarea
            id="body"
            name="body"
            rows={4}
            defaultValue={announcement?.body ?? ""}
            onChange={(e) => setPreview((p) => ({ ...p, body: e.target.value }))}
            className={fieldInputClass() + " h-auto py-3"}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Categoria" htmlFor="categoryId">
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={announcement?.categoryId ?? ""}
              onChange={(e) => {
                const category = categories.find((c) => c.id === e.target.value) ?? null;
                setPreview((p) => ({ ...p, category }));
              }}
              className={fieldInputClass()}
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Ministério" htmlFor="ministryId">
            <select
              id="ministryId"
              name="ministryId"
              defaultValue={announcement?.ministryId ?? ""}
              className={fieldInputClass()}
            >
              <option value="">Sem ministério</option>
              {ministries.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Publicar em" htmlFor="publishAt" error={state?.fieldErrors?.publishAt}>
            <input
              id="publishAt"
              name="publishAt"
              type="datetime-local"
              defaultValue={toLocalInput(announcement?.publishAt ?? new Date())}
              className={fieldInputClass(!!state?.fieldErrors?.publishAt)}
              required
            />
          </FormField>
          <FormField label="Sair do ar em (opcional)" htmlFor="unpublishAt" error={state?.fieldErrors?.unpublishAt}>
            <input
              id="unpublishAt"
              name="unpublishAt"
              type="datetime-local"
              defaultValue={toLocalInput(announcement?.unpublishAt)}
              className={fieldInputClass(!!state?.fieldErrors?.unpublishAt)}
            />
          </FormField>
        </div>

        <div className="mt-2 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending}
            onClick={() => setIntent(isEditor ? "publish" : "submit")}
            className="rounded-full bg-ink px-8 py-4 text-[15px] font-extrabold text-paper disabled:opacity-50"
          >
            {isEditor ? "Publicar aviso" : "Enviar para aprovação"}
          </button>
          <button
            type="submit"
            disabled={pending}
            onClick={() => setIntent("draft")}
            className="rounded-full border-2 border-ink px-8 py-4 text-[15px] font-extrabold disabled:opacity-50"
          >
            Salvar rascunho
          </button>
          {announcement ? (
            <button
              type="button"
              onClick={() => router.push("/backstage/avisos")}
              className="rounded-full px-8 py-4 text-[15px] font-extrabold text-soft"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        <p className="label-caps text-soft">Prévia</p>
        <NoticeCard announcement={preview} compact />
      </div>
    </div>
  );
}
