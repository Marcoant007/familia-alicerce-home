import { LogoMark } from "@/components/site/Logo";

export function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-paper/60 backdrop-blur-xl"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex size-20 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-line border-t-accent" />
        <LogoMark className="h-8 animate-pulse" />
      </div>
      <p className="text-sm font-bold text-soft">Carregando...</p>
    </div>
  );
}
