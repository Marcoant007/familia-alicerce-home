import { cn } from "cn";

export function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-3xl border border-line bg-card px-6 py-7 md:px-10 md:py-9", className)}
      {...props}
    />
  );
}
