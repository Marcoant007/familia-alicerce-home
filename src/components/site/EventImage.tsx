import Image from "next/image";
import { getEventImage } from "@/lib/event-images";

type EventImageData = {
  coverPath: string | null;
  category: { slug: string } | null;
  title: string;
};

/**
 * Preenche o container reservado (o pai precisa ser `relative`): mostra a
 * imagem correspondente à categoria do evento com object-cover/center, ou o
 * título centralizado sobre bg-sand quando não há imagem — mesmo
 * comportamento de antes, só que preenchido de verdade quando disponível.
 */
export function EventImage({ event, sizes = "100vw" }: { event: EventImageData; sizes?: string }) {
  const src = getEventImage(event);

  if (!src) {
    return <span className="px-4 text-center">{event.title}</span>;
  }

  return <Image src={src} alt="" fill sizes={sizes} className="object-cover object-center" />;
}
