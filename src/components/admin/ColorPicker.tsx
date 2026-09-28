"use client";

import { ACCENT_PALETTE, HEX_RE, isVeryLight } from "@/lib/theme";
import { cn } from "cn";

export function ColorPicker({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const isCustom = !ACCENT_PALETTE.some((c) => c.hex.toLowerCase() === value.toLowerCase());

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ACCENT_PALETTE.map((color) => {
          const selected = color.hex.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={color.hex}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(color.hex)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-[15px] font-bold",
                selected ? "border-ink" : "border-line hover:border-sand-2"
              )}
            >
              <span
                className="size-7 shrink-0 rounded-full border border-line"
                style={{ backgroundColor: color.hex }}
                aria-hidden="true"
              />
              {color.name}
            </button>
          );
        })}
        <label
          className={cn(
            "flex cursor-pointer items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-[15px] font-bold",
            isCustom ? "border-ink" : "border-line hover:border-sand-2"
          )}
        >
          <span
            className="relative size-7 shrink-0 overflow-hidden rounded-full border border-line"
            aria-hidden="true"
          >
            <input
              type="color"
              value={HEX_RE.test(value) ? value : "#000000"}
              onChange={(e) => onChange(e.target.value)}
              className="absolute -inset-1 size-9 cursor-pointer"
            />
          </span>
          Outra cor
        </label>
      </div>
      {isVeryLight(value) ? (
        <p className="text-sm font-bold text-danger">Essa cor é bem clara — o contraste do texto pode ficar ruim.</p>
      ) : null}
    </div>
  );
}
