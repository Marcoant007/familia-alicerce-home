import Link from "next/link";
import { Eyebrow } from "@/components/site/Eyebrow";

export function AboutBlock({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="mx-5 grid grid-cols-1 items-center gap-10 rounded-[32px] bg-sand p-8 md:mx-20 md:grid-cols-2 md:gap-20 md:p-20">
      <div className="h-[260px] rounded-3xl bg-sand-2 md:h-[400px]" />
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
