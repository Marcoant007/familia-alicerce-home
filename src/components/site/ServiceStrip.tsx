import type { Service } from "@/generated/prisma/client";
import { WEEKDAY_FULL, formatServiceTime } from "@/lib/format";

export function ServiceStrip({ services }: { services: Service[] }) {
  if (services.length === 0) return null;
  return (
    <div className="mx-5 flex flex-col divide-y divide-ink-line rounded-[28px] bg-ink text-paper md:mx-20 md:flex-row md:divide-x md:divide-y-0">
      {services.map((service) => (
        <div key={service.id} className="flex flex-1 flex-col gap-1.5 px-10 py-9">
          <p className="text-xs font-extrabold tracking-[3px] text-accent uppercase">
            {WEEKDAY_FULL[service.weekday]}
          </p>
          <p className="text-2xl font-extrabold">{service.name}</p>
          <p className="text-base text-soft-dark">{formatServiceTime(service.startsAt)}</p>
        </div>
      ))}
    </div>
  );
}
