import Link from "next/link";
import { Eyebrow } from "@/components/site/Eyebrow";

export function SectionHeader({
  eyebrow,
  title,
  linkHref,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-3 md:gap-3.5">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="h-section">{title}</h2>
      </div>
      {linkHref && linkLabel ? (
        <Link href={linkHref} className="link-more hidden shrink-0 md:inline-block">
          {linkLabel} →
        </Link>
      ) : null}
    </div>
  );
}
