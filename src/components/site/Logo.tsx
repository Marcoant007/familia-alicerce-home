import Image from "next/image";
import { cn } from "cn";

/**
 * Ícone da marca + "Família Alicerce" como texto de verdade.
 * O arquivo public/brand/logo-branca.png tem o texto embutido em resolução
 * baixa (ilegível abaixo de ~150px) — por isso usamos só o ícone recortado
 * (public/brand/icon-branca.png) e escrevemos o nome como HTML, sempre nítido.
 */
export function Logo({
  onDark = false,
  iconClassName,
  textClassName,
  className,
}: {
  /** true quando o fundo é escuro (ink) e o ícone já pode ficar branco */
  onDark?: boolean;
  iconClassName?: string;
  textClassName?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/brand/icon-branca.png"
        alt=""
        width={98}
        height={56}
        className={cn("h-8 w-auto", !onDark && "brightness-0", iconClassName)}
      />
      <span className={cn("leading-[0.95] font-black uppercase", textClassName)}>
        Família
        <br />
        Alicerce
      </span>
    </span>
  );
}
