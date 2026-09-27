import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-2 border-t border-line px-5 py-10 text-sm text-soft md:flex-row md:justify-between md:px-20">
      <span>© Família Alicerce · Instagram · YouTube</span>
      <Link href="/backstage" className="text-soft hover:text-ink">
        Área da equipe
      </Link>
    </footer>
  );
}
