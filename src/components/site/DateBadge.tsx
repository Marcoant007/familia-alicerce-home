import { cn } from "cn";

export function DateBadge({
  day,
  month,
  className,
}: {
  day: string;
  month: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-[72px] flex-col items-center justify-center gap-0.5 rounded-2xl bg-accent py-2.5 text-on-accent",
        className
      )}
    >
      <span className="text-[28px] leading-none font-black">{day}</span>
      <span className="text-xs font-extrabold tracking-wide uppercase">{month}</span>
    </div>
  );
}
