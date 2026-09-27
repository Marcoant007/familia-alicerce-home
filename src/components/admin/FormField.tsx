import { cn } from "cn";

export function FormField({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-extrabold">
        {label}
      </label>
      {children}
      {error ? <p className="text-sm font-bold text-danger">{error}</p> : null}
    </div>
  );
}

/** Classe compartilhada pra input/select/textarea baterem com a spec do FormField. */
export function fieldInputClass(hasError?: boolean) {
  return cn(
    "h-12 w-full rounded-xl border-2 bg-card px-4 text-[15px] outline-none",
    hasError ? "border-danger" : "border-line focus:border-ink"
  );
}
