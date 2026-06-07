"use client";

import { Clock3 } from "lucide-react";
import { CookingTime } from "../../domain/value-objects/CookingTime";
import { AppLanguage } from "../hooks/useDinneroStore";

type CookingTimeSelectorProps = {
  times: readonly CookingTime[];
  selected: CookingTime;
  language: AppLanguage;
  onSelect: (time: CookingTime) => void;
};

const timeCopy: Record<AppLanguage, Record<CookingTime, { title: string; body: string }>> = {
  en: {
    "15 min": { title: "15", body: "Fast pantry dinners" },
    "30 min": { title: "30", body: "Weeknight rhythm" },
    "45 min": { title: "45", body: "A little more care" },
    "60 min": { title: "60", body: "Slow evening cooking" },
    "No limit": { title: "No limit", body: "Let Sera choose freely" },
  },
  fr: {
    "15 min": { title: "15", body: "Diners tres rapides" },
    "30 min": { title: "30", body: "Rythme de semaine" },
    "45 min": { title: "45", body: "Un peu plus soigne" },
    "60 min": { title: "60", body: "Cuisine plus lente" },
    "No limit": { title: "Sans limite", body: "Sera choisit librement" },
  },
  it: {
    "15 min": { title: "15", body: "Cene molto rapide" },
    "30 min": { title: "30", body: "Ritmo settimanale" },
    "45 min": { title: "45", body: "Un po' piu cura" },
    "60 min": { title: "60", body: "Cucina lenta" },
    "No limit": { title: "Senza limite", body: "Sera sceglie libera" },
  },
};

export default function CookingTimeSelector({ times, selected, language, onSelect }: CookingTimeSelectorProps) {
  return (
    <div className="rounded-[1.8rem] border border-warm-stone/60 bg-card p-4 shadow-md">
      <div className="grid grid-cols-2 gap-2">
        {times.map((time) => {
          const active = selected === time;
          const copy = timeCopy[language][time];

          return (
            <button
              key={time}
              onClick={() => onSelect(time)}
              className={`min-h-28 rounded-[1.35rem] border p-4 text-left transition ${
                active ? "border-primary bg-primary text-white shadow-md" : "border-warm-stone/45 bg-background text-foreground"
              } ${time === "No limit" ? "col-span-2" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-serif text-[42px] leading-none">{copy.title}</span>
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${active ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
                  <Clock3 className="h-4 w-4 stroke-[1.7]" />
                </span>
              </div>
              <p className={`mt-3 text-xs font-semibold leading-5 ${active ? "text-white/78" : "text-muted"}`}>
                {time === "No limit" ? copy.body : `${copy.body} · min`}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
