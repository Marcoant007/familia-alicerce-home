import Link from "next/link";
import { cn } from "cn";

type CategoryOption = { slug: string; name: string };

export function CategoryFilter({
  categories,
  active,
}: {
  categories: CategoryOption[];
  active?: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/agenda"
        className={cn(
          "rounded-full border-2 px-6 py-3 text-[15px] font-extrabold",
          !active ? "border-accent bg-accent text-on-accent" : "border-ink-line text-paper"
        )}
      >
        Todos
      </Link>
      {categories.map((category) => {
        const isActive = category.slug === active;
        return (
          <Link
            key={category.slug}
            href={`/agenda?categoria=${encodeURIComponent(category.slug)}`}
            className={cn(
              "rounded-full border-2 px-6 py-3 text-[15px] font-extrabold",
              isActive ? "border-accent bg-accent text-on-accent" : "border-ink-line text-paper"
            )}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
