"use client";

import { useState } from "react";
import { cn } from "cn";

export function SimpleTabs({
  tabs,
}: {
  tabs: { value: string; label: string; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.value);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-fit gap-1 rounded-xl bg-sand p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActive(tab.value)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-extrabold",
              active === tab.value ? "bg-card text-ink shadow-sm" : "text-soft"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.find((t) => t.value === active)?.content}
    </div>
  );
}
