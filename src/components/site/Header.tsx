import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/site/Button";
import { Logo } from "@/components/site/Logo";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/quem-somos", label: "Quem somos" },
  { href: "/agenda", label: "Agenda" },
  { href: "/avisos", label: "Avisos" },
  { href: "/ministerios", label: "Ministérios" },
  { href: "/contribua", label: "Contribua" },
  { href: "/backstage", label: "Área da equipe" },
];

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-line bg-paper px-5 py-3 md:px-20 md:py-5">
      <Link href="/" className="flex items-center">
        <Logo iconClassName="h-9 md:h-11" textClassName="text-sm md:text-base text-ink" />
      </Link>

      <nav className="hidden items-center gap-9 text-[15px] font-bold text-ink md:flex">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-soft">
            {link.label}
          </Link>
        ))}
        <Button
          variant="dark"
          className="px-6 py-3 text-[15px]"
          render={<Link href="/visite-nos" />}
        >
          Visite-nos
        </Button>
      </nav>

      <Sheet>
        <SheetTrigger
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-paper md:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={22} strokeWidth={2} aria-hidden="true" />
        </SheetTrigger>
        <SheetContent side="right" className="w-full max-w-xs gap-0 border-l border-line bg-paper p-6">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <nav className="flex flex-col gap-6 pt-10">
            {NAV_LINKS.map((link) => (
              <SheetClose
                key={link.href}
                render={<Link href={link.href} className="text-[22px] font-extrabold text-ink" />}
              >
                {link.label}
              </SheetClose>
            ))}
            <SheetClose
              render={
                <Link
                  href="/visite-nos"
                  className="inline-flex items-center justify-center rounded-full bg-ink px-8 py-4 text-base font-extrabold text-paper"
                />
              }
            >
              Visite-nos
            </SheetClose>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
