import Link from "next/link";
import { cn } from "cn";

const VARIANTS = ["bg-ink text-paper", "bg-accent text-on-accent", "bg-sand text-ink"];

export function MinistryChip({ name, slug, index }: { name: string; slug: string; index: number }) {
  return (
    <Link
      href={`/ministerios#${slug}`}
      className={cn(
        "rounded-full px-7 py-[18px] text-[17px] font-extrabold",
        VARIANTS[index % VARIANTS.length]
      )}
    >
      {name}
    </Link>
  );
}
