import { Button } from "@/components/site/Button";
import { Logo } from "@/components/site/Logo";

export function VisitBlock({
  address,
  mapsUrl,
  whatsapp,
}: {
  address: string | null;
  mapsUrl: string | null;
  whatsapp: string | null;
}) {
  const whatsappUrl = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : null;

  return (
    <div className="mx-5 grid grid-cols-1 overflow-hidden rounded-[32px] bg-ink text-paper md:mx-20 md:grid-cols-2">
      <div className="flex flex-col gap-6 p-10 md:p-18">
        <Logo onDark iconClassName="h-12" textClassName="text-xl text-paper" className="self-start" />
        <h2 className="text-[28px] leading-[1.1] font-black uppercase md:text-[40px]">
          Tem um lugar esperando por você.
        </h2>
        <p className="text-lg leading-[1.6] text-soft-dark">{address ?? "Endereço a confirmar"}</p>
        <div className="flex flex-wrap gap-4">
          {mapsUrl ? (
            <Button variant="accent" render={<a href={mapsUrl} target="_blank" rel="noopener noreferrer" />}>
              Abrir no mapa
            </Button>
          ) : null}
          {whatsappUrl ? (
            <Button
              variant="outline-light"
              render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
            >
              WhatsApp
            </Button>
          ) : null}
        </div>
      </div>
      <div className="min-h-70 bg-ink-2 md:min-h-105">
        {address ? (
          <iframe
            title="Mapa até o endereço"
            src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
            className="h-full min-h-70 w-full border-0 grayscale md:min-h-105"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex h-full min-h-70 items-center justify-center text-[15px] font-bold text-soft-dark md:min-h-105">
            Mapa
          </div>
        )}
      </div>
    </div>
  );
}
