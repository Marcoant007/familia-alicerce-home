import type { Metadata } from "next";
import { Eyebrow } from "@/components/site/Eyebrow";

export const metadata: Metadata = { title: "Quem somos" };

export default function QuemSomosPage() {
  return (
    <section className="container-site flex flex-col gap-16 py-12 md:py-20">
      <div className="flex flex-col gap-4">
        <Eyebrow>Quem somos</Eyebrow>
        <h1 className="h-section max-w-2xl">Uma família construída sobre a Rocha.</h1>
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-20">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-extrabold uppercase">Nossa história</h2>
          <p className="text-[17px] leading-[1.65] text-soft">
            A Família Alicerce nasceu do desejo de construir uma comunidade onde cada
            pessoa encontra acolhimento, propósito e um lugar para crescer na fé —
            uma casa firme, de portas abertas, para toda família de Vitória e região.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-extrabold uppercase">Nossa visão</h2>
          <p className="text-[17px] leading-[1.65] text-soft">
            Ser uma igreja que forma famílias sólidas na fé, servindo a comunidade
            ao redor com amor prático e levando esperança a cada geração.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-extrabold uppercase">No que cremos</h2>
          <p className="text-[17px] leading-[1.65] text-soft">
            Cremos nas Escrituras como Palavra de Deus, na graça de Jesus Cristo
            que transforma vidas, e no chamado de viver em comunidade, servindo uns
            aos outros com amor.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-extrabold uppercase">Liderança</h2>
          <p className="text-[17px] leading-[1.65] text-soft">
            Nossos pastores e líderes de ministério caminham junto com a igreja,
            cuidando de cada pessoa e conduzindo a comunidade com integridade e cuidado.
          </p>
        </div>
      </div>
    </section>
  );
}
