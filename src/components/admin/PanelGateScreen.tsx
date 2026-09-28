"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { fieldInputClass } from "@/components/admin/FormField";
import { verifyPanelAccess, type PanelGateState } from "@/lib/actions/panel-gate";

export function PanelGateScreen() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState<PanelGateState, FormData>(verifyPanelAccess, undefined);

  useEffect(() => {
    if (state === undefined) return;
    if (!state.error) router.refresh();
  }, [state, router]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-card px-8 py-9">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-sand">
            <Lock size={20} strokeWidth={2} aria-hidden="true" />
          </span>
          <h1 className="text-xl font-extrabold">Acesso ao painel</h1>
          <p className="text-[15px] text-soft">Cole o token de acesso da equipe pra continuar.</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          {state?.error ? <p className="text-center text-sm font-bold text-danger">{state.error}</p> : null}
          <input
            ref={inputRef}
            name="token"
            type="password"
            autoComplete="off"
            placeholder="Token de acesso"
            className={fieldInputClass(!!state?.error)}
            required
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper disabled:opacity-50"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
