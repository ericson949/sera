"use client";

type BudgetSliderProps = {
  max: number;
  label: string;
  helper: string;
  onChange: (max: number) => void;
};

export default function BudgetSlider({ max, label, helper, onChange }: BudgetSliderProps) {
  const minLimit = 20;
  const maxLimit = 180;
  const step = 5;
  const percent = ((max - minLimit) / (maxLimit - minLimit)) * 100;

  return (
    <div className="mt-2 flex w-full flex-col gap-7">
      <div className="text-center">
        <p className="editorial-kicker">{label}</p>
        <p className="mt-3 font-serif text-[58px] leading-none text-primary">EUR {max}</p>
        <p className="mx-auto mt-3 max-w-[260px] text-sm leading-6 text-muted">{helper}</p>
      </div>

      <div className="relative flex h-8 items-center">
        <div className="absolute left-0 right-0 h-2 rounded-full bg-border" />
        <div className="absolute h-2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={max}
          onChange={(event) => onChange(Number(event.target.value))}
          className="absolute h-8 w-full appearance-none bg-transparent"
          aria-label={label}
        />
      </div>

      <div className="flex justify-between px-1 text-xs font-semibold text-muted">
        <span>EUR {minLimit}</span>
        <span>EUR {maxLimit}</span>
      </div>
    </div>
  );
}
