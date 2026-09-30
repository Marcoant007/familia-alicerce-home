import { cn } from "cn";
import { SITE_NAME } from "@/lib/site-config";

/**
 * Marca placeholder deste boilerplate: um monograma com a inicial de
 * SITE_NAME. Troque por um ícone/imagem de verdade ao adaptar o template.
 */
export function LogoMark({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  const initial = SITE_NAME.trim().charAt(0).toUpperCase() || "•";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex aspect-square h-8 shrink-0 items-center justify-center rounded-lg text-sm font-black",
        onDark ? "bg-paper text-ink" : "bg-ink text-paper",
        className
      )}
    >
      {initial}
    </span>
  );
}

export function Logo({
  onDark = false,
  iconClassName,
  textClassName,
  className,
}: {
  /** true quando o fundo é escuro (ink) e a marca já pode ficar clara */
  onDark?: boolean;
  iconClassName?: string;
  textClassName?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark onDark={onDark} className={iconClassName} />
      <span className={cn("font-black uppercase", textClassName)}>{SITE_NAME}</span>
    </span>
  );
}
