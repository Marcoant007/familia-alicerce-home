import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/site/Button";
import { Eyebrow } from "@/components/site/Eyebrow";

export function Hero({
  nextServiceLabel,
  address,
}: {
  nextServiceLabel: string | null;
  address: string | null;
}) {
  return (
    <section className="container-site grid grid-cols-1 items-center gap-12 py-14 md:grid-cols-2 md:gap-16 md:py-22">
      <div className="flex flex-col gap-6 md:gap-7">
        <Eyebrow>Bem-vindo à nossa casa</Eyebrow>
        <h1 className="h-display">Uma casa firme, de portas abertas.</h1>
        <p className="max-w-[520px] text-base leading-[1.55] text-soft md:text-xl md:leading-[1.6]">
          Aqui você encontra família, fé e um lugar para crescer. Venha como está.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="accent" render={<Link href="/visite-nos" />}>
            Planeje sua visita
          </Button>
          <Button variant="outline" render={<Link href="/agenda" />}>
            Ver agenda
          </Button>
        </div>
      </div>

      <div className="relative h-[300px] md:h-[540px]">
        <div className="absolute top-[-24px] right-[-24px] h-40 w-40 rounded-full bg-accent md:top-[-30px] md:right-[-40px] md:h-60 md:w-60" />
        <div className="absolute inset-0 bottom-10 overflow-hidden rounded-3xl bg-ink-2 md:right-10 md:bottom-10 md:rounded-4xl">
          <Image
            src="/culto-images/pastor.jpg"
            alt="Culto da Família Alicerce"
            fill
            sizes="(min-width: 768px) 480px, 100vw"
            className="object-cover"
            priority
          />
        </div>
        {nextServiceLabel ? (
          <div className="absolute bottom-0 left-0 flex w-[240px] flex-col gap-1.5 rounded-3xl bg-ink px-6 py-5 text-paper shadow-[0_20px_40px_rgba(20,20,20,0.2)] md:w-[300px] md:px-7 md:py-6">
            <p className="text-xs font-extrabold tracking-[3px] text-accent uppercase">Próximo culto</p>
            <p className="text-xl font-extrabold md:text-[26px]">{nextServiceLabel}</p>
            {address ? <p className="text-sm font-medium text-soft-dark">{address}</p> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
