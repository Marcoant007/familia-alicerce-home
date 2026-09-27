// src/app/layout.tsx — fonte, Clerk e tema dinâmico
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Montserrat } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { shadcn } from "@clerk/ui/themes";
import { prisma } from "@/lib/prisma";
import { accentVars, DEFAULT_ACCENT } from "@/lib/theme";
import "./globals.css";
import "@clerk/ui/themes/shadcn.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Família Alicerce", template: "%s · Família Alicerce" },
  description: "Uma casa firme, de portas abertas. Igreja Família Alicerce em Vitória – ES.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { accentColor: true } });
  const vars = accentVars(settings?.accentColor ?? DEFAULT_ACCENT) as CSSProperties;

  return (
    <html lang="pt-BR" className={montserrat.variable} style={vars}>
      <body>
        <ClerkProvider localization={ptBR} appearance={{ theme: shadcn }}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
