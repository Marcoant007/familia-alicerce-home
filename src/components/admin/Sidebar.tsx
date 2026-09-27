"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  CalendarDays,
  Megaphone,
  Images,
  Palette,
  Users,
  Clock,
  UserCog,
  History,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";
import { Logo } from "@/components/site/Logo";

export type SidebarPermissions = { isAdmin: boolean; isEditor: boolean };

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: LucideIcon;
  show: (p: SidebarPermissions) => boolean;
}[] = [
  { href: "/backstage", label: "Visão geral", icon: LayoutDashboard, show: () => true },
  { href: "/backstage/eventos", label: "Eventos", icon: CalendarDays, show: () => true },
  { href: "/backstage/avisos", label: "Avisos", icon: Megaphone, show: () => true },
  { href: "/backstage/galeria", label: "Galeria", icon: Images, show: () => true },
  { href: "/backstage/aparencia", label: "Aparência", icon: Palette, show: (p) => p.isEditor },
  { href: "/backstage/ministerios", label: "Ministérios", icon: Users, show: (p) => p.isEditor },
  { href: "/backstage/cultos", label: "Cultos", icon: Clock, show: (p) => p.isEditor },
  { href: "/backstage/equipe", label: "Equipe", icon: UserCog, show: (p) => p.isAdmin },
  { href: "/backstage/auditoria", label: "Auditoria", icon: History, show: (p) => p.isAdmin },
];

export function Sidebar({
  actorName,
  roleLabel,
  permissions,
}: {
  actorName: string;
  roleLabel: string;
  permissions: SidebarPermissions;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-[260px] shrink-0 flex-col bg-ink text-paper">
      <div className="flex flex-col gap-3 px-6 pt-8 pb-6">
        <Logo onDark iconClassName="h-10" textClassName="text-base text-paper" />
        <p className="label-caps text-soft-dark">Painel da equipe</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4">
        {NAV_ITEMS.filter((item) => item.show(permissions)).map((item) => {
          const active = item.href === "/backstage" ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-extrabold",
                active ? "bg-accent text-on-accent" : "text-soft-dark hover:text-paper"
              )}
            >
              <Icon size={18} strokeWidth={2} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-ink-line px-6 py-6">
        <UserButton />
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-sm font-bold">{actorName}</p>
          <p className="text-xs text-soft-dark">{roleLabel}</p>
        </div>
      </div>

      <Link href="/" className="px-6 pb-8 text-sm font-bold text-soft-dark hover:text-paper">
        ← Ver o site
      </Link>
    </aside>
  );
}
