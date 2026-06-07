"use client";

import { Clock3 } from "lucide-react";
import { CookingTime } from "../../domain/value-objects/CookingTime";

type CookingTimeCardsProps = {
  times: readonly CookingTime[];
  selected: CookingTime;
  copy: Record<CookingTime, readonly [string, string]>;
  onSelect: (time: CookingTime) => void;
};

export default function CookingTimeCards({ times, selected, copy, onSelect }: CookingTimeCardsProps) {
  return (
    <div className="rounded-[1.8rem] border border-warm-stone/60 bg-card p-4 shadow-md">
      <div className="grid grid-cols-2 gap-2">
        {times.map((time) => {
          const active = selected === time;
          const [title, body] = copy[time];

          return (
            <button
              key={time}
              onClick={() => onSelect(time)}
              className={`min-h-28 rounded-[1.35rem] border p-4 text-left transition ${
                active ? "border-primary bg-primary text-white shadow-md" : "border-warm-stone/45 bg-background text-foreground"
              } ${time === "No limit" ? "col-span-2" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-serif text-[42px] leading-none">{title}</span>
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${active ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
                  <Clock3 className="h-4 w-4 stroke-[1.7]" />
                </span>
              </div>
              <p className={`mt-3 text-xs font-semibold leading-5 ${active ? "text-white/78" : "text-muted"}`}>
                {time === "No limit" ? body : `${body} - min`}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
