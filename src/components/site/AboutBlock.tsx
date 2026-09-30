import Link from "next/link";
import Image from "next/image";
import { Eyebrow } from "@/components/site/Eyebrow";

export function AboutBlock({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="mx-5 grid grid-cols-1 items-center gap-10 rounded-4xl bg-sand p-8 md:mx-20 md:grid-cols-2 md:gap-20 md:p-20">
      <div className="relative h-65 overflow-hidden rounded-3xl bg-sand-2 md:h-100">
        <Image
          src="/culto-images/pastor-telmo-martinello-1.jpeg"
          alt="Líder ministrando durante um culto"
          fill
          sizes="(max-width: 768px) calc(100vw - 40px), 45vw"
          quality={90}
          className="object-cover object-[62%_center]"
        />
      </div>
      <div className="flex flex-col gap-6">
        <Eyebrow>Quem somos</Eyebrow>
        <h2 className="text-[28px] leading-[1.1] font-black uppercase md:text-[42px]">{title}</h2>
        <p className="text-lg leading-[1.65] text-soft">{text}</p>
        <Link href="/quem-somos" className="link-more self-start">
          Conheça nossa história →
        </Link>
      </div>
    </div>
  );
}
