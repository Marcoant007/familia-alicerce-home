"use client";

export default function AdminError({ error }: { error: Error & { digest?: string } }) {
  const message =
    error.message === "Acesso desativado"
      ? "Seu acesso ao painel foi desativado. Fale com um admin da equipe."
      : "Não foi possível carregar o painel. Tente novamente em instantes.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-sand p-8 text-center">
      <h1 className="text-xl font-extrabold">Ops</h1>
      <p className="text-soft">{message}</p>
    </div>
  );
}
