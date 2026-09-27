// src/lib/format.ts — datas exibidas no fuso America/Sao_Paulo (banco fica em UTC/timestamptz)
const TIME_ZONE = "America/Sao_Paulo";

const MONTH_ABBR = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

export const WEEKDAY_FULL = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado",
];

function partsInSaoPaulo(date: Date) {
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    weekday: get("weekday").replace(".", ""),
    day: get("day"),
    month: get("month"),
    hour: get("hour") === "24" ? "00" : get("hour"),
    minute: get("minute"),
  };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function hourLabel(hour: string, minute: string) {
  return minute === "00" ? `${parseInt(hour, 10)}h` : `${parseInt(hour, 10)}h${minute}`;
}

/** "Sáb 18/10, 8h → Dom 19/10, 13h" (mesmo dia: "Sáb 25/10, 19h → 22h") */
export function formatEventRange(startsAt: Date, endsAt: Date): string {
  const s = partsInSaoPaulo(startsAt);
  const e = partsInSaoPaulo(endsAt);
  const sameDay = s.day === e.day && s.month === e.month;
  const startLabel = `${capitalize(s.weekday)} ${s.day}/${s.month}, ${hourLabel(s.hour, s.minute)}`;
  return sameDay
    ? `${startLabel} → ${hourLabel(e.hour, e.minute)}`
    : `${startLabel} → ${capitalize(e.weekday)} ${e.day}/${e.month}, ${hourLabel(e.hour, e.minute)}`;
}

/** Um só momento, para os campos Início/Término da Agenda: "sáb 18/10, 8h" */
export function formatEventMoment(date: Date): string {
  const p = partsInSaoPaulo(date);
  return `${p.weekday} ${p.day}/${p.month}, ${hourLabel(p.hour, p.minute)}`;
}

/** Selo de data: dia com 2 dígitos + mês abreviado caps ("08" / "NOV") */
export function formatDateBadge(date: Date): { day: string; month: string } {
  const p = partsInSaoPaulo(date);
  return { day: p.day, month: MONTH_ABBR[parseInt(p.month, 10) - 1] };
}

/**
 * Horário de um `Service.startsAt` (coluna `time`, sem fuso — é um horário de
 * parede, não um instante). Não aplicar conversão de fuso aqui.
 */
export function formatServiceTime(startsAt: Date): string {
  const hour = String(startsAt.getUTCHours()).padStart(2, "0");
  const minute = String(startsAt.getUTCMinutes()).padStart(2, "0");
  return hourLabel(hour, minute);
}

/** Serviço mais próximo a partir de agora (fuso America/Sao_Paulo), dado o dia da semana + hora. */
export function getNextService<T extends { weekday: number; startsAt: Date }>(
  services: T[]
): T | null {
  if (services.length === 0) return null;
  const now = partsInSaoPaulo(new Date());
  const weekdayIndex = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"].indexOf(now.weekday);
  const nowMinutes = (weekdayIndex < 0 ? 0 : weekdayIndex) * 1440 + parseInt(now.hour, 10) * 60 + parseInt(now.minute, 10);

  let closest: T | null = null;
  let closestDiff = Infinity;
  for (const service of services) {
    const serviceMinutes =
      service.weekday * 1440 + service.startsAt.getUTCHours() * 60 + service.startsAt.getUTCMinutes();
    let diff = serviceMinutes - nowMinutes;
    if (diff < 0) diff += 7 * 1440;
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = service;
    }
  }
  return closest;
}

/** "Domingo, 18h" */
export function formatServiceLabel(service: { weekday: number; startsAt: Date }): string {
  return `${WEEKDAY_FULL[service.weekday]}, ${formatServiceTime(service.startsAt)}`;
}

/** Relativo no painel: "há 5 min", "ontem às 14h" */
export function formatRelative(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  const p = partsInSaoPaulo(date);
  const today = partsInSaoPaulo(new Date());
  const isYesterday = diffHours < 48;
  if (isYesterday) return `ontem às ${hourLabel(p.hour, p.minute)}`;
  if (p.day === today.day && p.month === today.month) return `hoje às ${hourLabel(p.hour, p.minute)}`;
  return `${p.day}/${p.month} às ${hourLabel(p.hour, p.minute)}`;
}
