// src/lib/theme.ts — cor de destaque do site

export const DEFAULT_ACCENT = "#FFC53D";

export const ACCENT_PALETTE = [
  { name: "Amarelo", hex: "#FFC53D" },
  { name: "Laranja", hex: "#FF7A1A" },
  { name: "Vermelho", hex: "#E5484D" },
  { name: "Azul", hex: "#3B6FE0" },
  { name: "Verde", hex: "#2FA36B" },
  { name: "Roxo", hex: "#7C5CDB" },
] as const;

export const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

/** Luminância relativa (WCAG) de uma cor #RRGGBB. */
export function luminance(hex: string): number {
  const n = HEX_RE.test(hex) ? hex.slice(1) : DEFAULT_ACCENT.slice(1);
  const ch = (i: number) => {
    const v = parseInt(n.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4);
}

/** Cor do texto sobre o destaque: preto em cores claras, branco nas escuras. */
export const onAccent = (hex: string) => (luminance(hex) > 0.22 ? "#141414" : "#FFFFFF");

/** Cor muito clara: avisar no painel. */
export const isVeryLight = (hex: string) => luminance(hex) > 0.6;

/** Variáveis CSS para aplicar no <html> ou num preview. */
export function accentVars(hex: string): Record<string, string> {
  const accent = HEX_RE.test(hex) ? hex : DEFAULT_ACCENT;
  return { "--accent": accent, "--on-accent": onAccent(accent) };
}
