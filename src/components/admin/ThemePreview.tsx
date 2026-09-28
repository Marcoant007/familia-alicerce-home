import type { CSSProperties } from "react";
import { onAccent } from "@/lib/theme";
import { Logo } from "@/components/site/Logo";

/** Mini home usando a cor em edição, sem tocar no tema real da página. */
export function ThemePreview({ color }: { color: string }) {
  const vars = { "--accent": color, "--on-accent": onAccent(color) } as CSSProperties;

  return (
    <div style={vars} className="overflow-hidden rounded-3xl border border-line bg-paper text-ink">
      <header className="flex items-center justify-between bg-ink px-5 py-3 text-paper">
        <Logo onDark iconClassName="h-6" textClassName="text-[9px] text-paper" />
        <span className="h-2 w-16 rounded-full bg-soft-dark/40" aria-hidden="true" />
      </header>

      <div className="flex flex-col gap-3 px-5 py-6">
        <span className="eyebrow text-[9px] tracking-[2px]">Bem-vindo à nossa casa</span>
        <p className="text-lg leading-tight font-black uppercase">Uma casa firme, de portas abertas.</p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-accent px-4 py-1.5 text-[11px] font-extrabold text-on-accent">
            Planeje sua visita
          </span>
          <span className="rounded-full border-2 border-ink px-4 py-1.5 text-[11px] font-extrabold">Ver agenda</span>
        </div>
      </div>

      <div className="flex gap-3 border-t border-line px-5 py-4">
        <span className="flex-1 rounded-xl border border-line px-3 py-3 text-center text-[11px] font-bold text-soft">
          Domingo · 18h
        </span>
        <span className="flex-1 rounded-xl border border-line px-3 py-3 text-center text-[11px] font-bold text-soft">
          Sábado · 19h
        </span>
      </div>

      <div className="mx-5 mb-5 flex items-center justify-between gap-3 rounded-2xl bg-accent px-5 py-4 text-on-accent">
        <span className="text-[13px] font-black uppercase">Contribua com a obra</span>
        <span className="rounded-full bg-ink px-3 py-1.5 text-[11px] font-extrabold text-paper">Copiar chave</span>
      </div>
    </div>
  );
}
