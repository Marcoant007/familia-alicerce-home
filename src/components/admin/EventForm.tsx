"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Ministry, Prisma } from "@/generated/prisma/client";
import { FormField, fieldInputClass } from "@/components/admin/FormField";
import { ImageDrop } from "@/components/admin/ImageDrop";
import { EventCard } from "@/components/site/EventCard";
import { createEvent, updateEvent, type EventActionState } from "@/lib/actions/events";

type EventWithCategory = Prisma.EventGetPayload<{ include: { category: true } }>;

function toLocalInput(date: Date | null | undefined) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(
    date.getUTCHours()
  )}:${pad(date.getUTCMinutes())}`;
}

export function EventForm({
  event,
  categories,
  ministries,
  isEditor,
}: {
  event?: EventWithCategory | null;
  categories: Category[];
  ministries: Ministry[];
  isEditor: boolean;
}) {
  const router = useRouter();
  const action = event ? updateEvent.bind(null, event.id) : createEvent;
  const [intent, setIntent] = useState<"draft" | "submit" | "publish">("draft");
  const boundAction = (prev: EventActionState, formData: FormData) => action(intent, prev, formData);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  useEffect(() => {
    if (state?.redirectTo) router.push(state.redirectTo);
  }, [state, router]);

  const [coverPath, setCoverPath] = useState<string | null>(event?.coverPath ?? null);

  const [preview, setPreview] = useState({
    id: event?.id ?? "preview",
    title: event?.title ?? "Título do evento",
    slug: event?.slug ?? "",
    startsAt: event?.startsAt ?? new Date(),
    endsAt: event?.endsAt ?? new Date(Date.now() + 3600_000),
    location: event?.location ?? null,
    registrationUrl: event?.registrationUrl ?? null,
    category: event?.category ?? null,
    coverPath: event?.coverPath ?? null,
  });

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <form action={formAction} className="flex flex-col gap-6">
        {event?.reviewNote ? (
          <div className="rounded-2xl border-2 border-danger/30 bg-danger/5 px-5 py-4 text-[15px] text-ink">
            <b>Devolvido pela mídia:</b> {event.reviewNote}
          </div>
        ) : null}
        {state?.error ? <p className="text-sm font-bold text-danger">{state.error}</p> : null}

        <FormField label="Título" htmlFor="title" error={state?.fieldErrors?.title}>
          <input
            id="title"
            name="title"
            defaultValue={event?.title}
            onChange={(e) => setPreview((p) => ({ ...p, title: e.target.value }))}
            className={fieldInputClass(!!state?.fieldErrors?.title)}
            required
          />
        </FormField>

        <FormField label="Capa">
          <ImageDrop
            value={coverPath}
            name="coverPath"
            pathPrefix="eventos"
            onChange={(url) => {
              setCoverPath(url);
              setPreview((p) => ({ ...p, coverPath: url }));
            }}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Início" htmlFor="startsAt" error={state?.fieldErrors?.startsAt}>
            <input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              defaultValue={toLocalInput(event?.startsAt)}
              onChange={(e) => e.target.value && setPreview((p) => ({ ...p, startsAt: new Date(e.target.value) }))}
              className={fieldInputClass(!!state?.fieldErrors?.startsAt)}
              required
            />
          </FormField>
          <FormField label="Término" htmlFor="endsAt" error={state?.fieldErrors?.endsAt}>
            <input
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              defaultValue={toLocalInput(event?.endsAt)}
              onChange={(e) => e.target.value && setPreview((p) => ({ ...p, endsAt: new Date(e.target.value) }))}
              className={fieldInputClass(!!state?.fieldErrors?.endsAt)}
              required
            />
          </FormField>
        </div>

        <FormField label="Local" htmlFor="location">
          <input
            id="location"
            name="location"
            defaultValue={event?.location ?? ""}
            onChange={(e) => setPreview((p) => ({ ...p, location: e.target.value }))}
            className={fieldInputClass()}
          />
        </FormField>

        <FormField label="Link de inscrição" htmlFor="registrationUrl" error={state?.fieldErrors?.registrationUrl}>
          <input
            id="registrationUrl"
            name="registrationUrl"
            type="url"
            placeholder="https://..."
            defaultValue={event?.registrationUrl ?? ""}
            onChange={(e) => setPreview((p) => ({ ...p, registrationUrl: e.target.value }))}
            className={fieldInputClass(!!state?.fieldErrors?.registrationUrl)}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Categoria" htmlFor="categoryId">
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={event?.categoryId ?? ""}
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
            <select id="ministryId" name="ministryId" defaultValue={event?.ministryId ?? ""} className={fieldInputClass()}>
              <option value="">Sem ministério</option>
              {ministries.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Descrição" htmlFor="description">
          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={event?.description ?? ""}
            className={fieldInputClass() + " h-auto py-3"}
          />
        </FormField>

        {isEditor ? (
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" name="isFeatured" defaultChecked={event?.isFeatured} className="size-4" />
            Destacar na home
          </label>
        ) : null}

        <div className="mt-2 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending}
            onClick={() => setIntent(isEditor ? "publish" : "submit")}
            className="rounded-full bg-ink px-8 py-4 text-[15px] font-extrabold text-paper disabled:opacity-50"
          >
            {isEditor ? "Publicar evento" : "Enviar para aprovação"}
          </button>
          <button
            type="submit"
            disabled={pending}
            onClick={() => setIntent("draft")}
            className="rounded-full border-2 border-ink px-8 py-4 text-[15px] font-extrabold disabled:opacity-50"
          >
            Salvar rascunho
          </button>
          {event ? (
            <button
              type="button"
              onClick={() => router.push("/backstage/eventos")}
              className="rounded-full px-8 py-4 text-[15px] font-extrabold text-soft"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        <p className="label-caps text-soft">Prévia</p>
        <EventCard event={preview} />
      </div>
    </div>
  );
}
