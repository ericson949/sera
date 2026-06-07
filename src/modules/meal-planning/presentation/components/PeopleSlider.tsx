"use client";

import { Users } from "lucide-react";

type PeopleSliderProps = {
  value: number;
  person: string;
  people: string;
  onChange: (value: number) => void;
};

export default function PeopleSlider({ value, person, people, onChange }: PeopleSliderProps) {
  const min = 1;
  const max = 5;
  const percent = ((value - min) / (max - min)) * 100;
  const label = value === 5 ? `5+ ${people}` : `${value} ${value === 1 ? person : people}`;

  return (
    <div className="rounded-[1.8rem] border border-warm-stone/60 bg-card p-6 shadow-md">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Users className="h-6 w-6 stroke-[1.5]" />
        </div>
        <p className="mt-4 font-serif text-[46px] leading-none text-primary">{label}</p>
      </div>
      <div className="relative mt-8 flex h-8 items-center">
        <div className="absolute left-0 right-0 h-2 rounded-full bg-border" />
        <div className="absolute h-2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="absolute h-8 w-full appearance-none bg-transparent"
          aria-label={label}
        />
      </div>
      <div className="mt-2 flex justify-between px-1 text-xs font-semibold text-muted">
        <span>1</span>
        <span>5+</span>
      </div>
    </div>
  );
}
