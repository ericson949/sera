"use client";

import { Apple, Beef, Check, Egg, Fish, Flame, Leaf, Milk, PiggyBank, Salad, Sparkles, Store, Timer, Utensils, WheatOff } from "lucide-react";

type OnboardingOptionGridProps<T extends string> = {
  values: readonly T[];
  selected: readonly T[];
  onSelect: (value: T) => void;
  disabled?: (value: T) => boolean;
  compact?: boolean;
};

export default function OnboardingOptionGrid<T extends string>({ values, selected, onSelect, disabled, compact }: OnboardingOptionGridProps<T>) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {values.map((value) => (
        <OptionButton key={value} active={selected.includes(value)} disabled={disabled?.(value)} onClick={() => onSelect(value)} icon={getOptionIcon(value)} compact={compact}>
          {value}
        </OptionButton>
      ))}
    </div>
  );
}

function OptionButton({ active, disabled, onClick, children, icon, compact }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode; compact?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-between gap-3 rounded-[1.2rem] border px-3 text-left text-sm font-semibold shadow-sm transition disabled:opacity-35 ${compact ? "min-h-12 py-2.5" : "min-h-14 py-3.5"} ${active ? "border-primary bg-primary text-white" : "border-warm-stone/45 bg-card text-foreground"}`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full [&_svg]:h-4 [&_svg]:w-4 ${active ? "bg-white/20 text-white" : "bg-surface-container-low text-primary"}`}>{icon}</span>
        <span className="min-w-0 leading-5">{children}</span>
      </span>
      {active && <Check className="h-4 w-4" />}
    </button>
  );
}

function getOptionIcon(value: string) {
  const v = value.toLowerCase();
  if (["lidl", "aldi", "carrefour", "coop", "conad", "esselunga", "eurospin", "md"].some((shop) => v.includes(shop))) return <Store />;
  if (v.includes("save") || v.includes("budget") || v.includes("cheap")) return <PiggyBank />;
  if (v.includes("healthy") || v.includes("balanced") || v.includes("vegetarian")) return <Salad />;
  if (v.includes("protein") || v.includes("chicken")) return <Beef />;
  if (v.includes("quick") || v.includes("15") || v.includes("30") || v.includes("45") || v.includes("60")) return <Timer />;
  if (v.includes("vegan")) return <Leaf />;
  if (v.includes("gluten")) return <WheatOff />;
  if (v.includes("lactose") || v.includes("milk") || v.includes("yogurt") || v.includes("cheese")) return <Milk />;
  if (v.includes("pescatarian") || v.includes("fish") || v.includes("tuna")) return <Fish />;
  if (v.includes("egg")) return <Egg />;
  if (v.includes("pasta") || v.includes("rice") || v.includes("bread") || v.includes("oats")) return <Utensils />;
  if (v.includes("tomato") || v.includes("potato") || v.includes("onion") || v.includes("garlic")) return <Apple />;
  if (v.includes("spice") || v.includes("comfort") || v.includes("warm")) return <Flame />;
  return <Sparkles />;
}
