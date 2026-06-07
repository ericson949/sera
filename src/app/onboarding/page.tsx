"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Apple, Beef, Check, ChevronLeft, ChevronRight, Clock, Compass, CookingPot, Egg, Fish, Flame, Heart, Leaf, Milk, PiggyBank, Salad, Sparkles, Store, Target, Timer, User, Users, Utensils, Wallet, WheatOff } from "lucide-react";
import BudgetSlider from "@/modules/meal-planning/presentation/components/BudgetSlider";
import SeraPreOnboarding from "@/modules/meal-planning/presentation/components/SeraPreOnboarding";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { useSeraLocaleDetection } from "@/modules/meal-planning/presentation/hooks/useSeraLocaleDetection";
import { getCopy } from "@/shared/i18n";
import { getProductCopy } from "@/shared/seraProductCopy";
import { GROCERY_SHOPS } from "@/modules/meal-planning/domain/value-objects/GroceryShop";
import { MEAL_GOALS } from "@/modules/meal-planning/domain/value-objects/MealGoal";
import { FOOD_VIBES, FoodVibe } from "@/modules/meal-planning/domain/value-objects/FoodVibe";
import { DIETARY_NEEDS, DietaryNeed } from "@/modules/meal-planning/domain/value-objects/DietaryNeed";
import { COOKING_TIMES } from "@/modules/meal-planning/domain/value-objects/CookingTime";

const KITCHEN_ITEMS = ["Pasta", "Rice", "Eggs", "Chicken", "Tuna", "Tomatoes", "Cheese", "Potatoes", "Beans", "Lentils", "Olive oil", "Onion", "Garlic", "Frozen vegetables", "Spices", "Milk", "Yogurt", "Bread", "Oats"];

export default function OnboardingPage() {
  const router = useRouter();
  const store = useDinneroStore();
  const copy = getCopy(store.appLanguage);
  const productCopy = getProductCopy(store.appLanguage);
  const onboardingCopy = productCopy.onboarding;
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const {
    onboardingStep,
    onboardingShop,
    onboardingBudgetMax,
    onboardingPeople,
    onboardingGoal,
    onboardingVibes,
    onboardingDietaryNeeds,
    onboardingCookingTime,
    onboardingKitchenItems,
    error,
    setOnboardingField,
    nextStep,
    prevStep,
    generatePlan,
    resetOnboarding,
  } = store;

  useSeraLocaleDetection(setOnboardingField);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (onboardingStep === 10) {
      interval = setInterval(() => setLoadingStepIdx((prev) => Math.min(prev + 1, onboardingCopy.loadingPhrases.length - 1)), 700);
    } else {
      setLoadingStepIdx(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [onboardingCopy.loadingPhrases.length, onboardingStep]);

  useEffect(() => {
    if (onboardingStep !== 10) return;
    generatePlan().then(() => router.push("/results"));
  }, [onboardingStep, generatePlan, router]);

  const startQuestions = () => {
    resetOnboarding();
    nextStep();
  };

  const toggleVibe = (vibe: FoodVibe) => {
    const current = [...onboardingVibes];
    setOnboardingField(
      "onboardingVibes",
      current.includes(vibe) ? current.filter((item) => item !== vibe) : current.length < 3 ? [...current, vibe] : current
    );
  };

  const toggleDiet = (diet: DietaryNeed) => {
    if (diet === "None") {
      setOnboardingField("onboardingDietaryNeeds", ["None"]);
      return;
    }
    const withoutNone = onboardingDietaryNeeds.filter((item) => item !== "None");
    const next = withoutNone.includes(diet) ? withoutNone.filter((item) => item !== diet) : [...withoutNone, diet];
    setOnboardingField("onboardingDietaryNeeds", next.length ? next : ["None"]);
  };

  const toggleKitchenItem = (item: string) => {
    setOnboardingField(
      "onboardingKitchenItems",
      onboardingKitchenItems.includes(item) ? onboardingKitchenItems.filter((value) => value !== item) : [...onboardingKitchenItems, item]
    );
  };

  const renderProgress = () => {
    if (onboardingStep === 1 || onboardingStep === 10) return null;
    return (
      <div className="mb-4 flex w-full gap-1.5 px-6 pt-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className={`h-1 flex-1 rounded-full ${idx < onboardingStep - 1 ? "bg-primary" : "bg-border"}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-svh flex-col justify-between overflow-hidden bg-background p-5">
      {onboardingStep > 1 && onboardingStep < 10 && (
        <div className="flex shrink-0 items-center justify-between pt-2">
          <button onClick={prevStep} className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="editorial-kicker">{onboardingCopy.progress} {onboardingStep - 1} / 8</span>
          <div className="w-10" />
        </div>
      )}

      {renderProgress()}

      <div className="flex min-h-0 flex-1 flex-col justify-center">
        {onboardingStep === 1 && (
          <SeraPreOnboarding appCountry={store.appCountry} copy={copy} setOnboardingField={setOnboardingField} onStart={startQuestions} />
        )}

        {onboardingStep === 2 && (
          <StepShell icon={<Store />} title={onboardingCopy.shopTitle} body={onboardingCopy.shopBody} kicker={onboardingCopy.kicker}>
            <OptionGrid values={GROCERY_SHOPS} selected={[onboardingShop]} onSelect={(shop) => setOnboardingField("onboardingShop", shop)} iconFor={getOptionIcon} />
          </StepShell>
        )}

        {onboardingStep === 3 && (
          <StepShell icon={<Wallet />} title={onboardingCopy.budgetTitle} body={onboardingCopy.budgetBody} kicker={onboardingCopy.kicker}>
            <div className="rounded-[1.8rem] border border-warm-stone/60 bg-card p-6 shadow-md">
              <BudgetSlider
                max={onboardingBudgetMax}
                label={onboardingCopy.budgetLabel}
                helper={onboardingCopy.budgetHelper}
                onChange={(max) => {
                  setOnboardingField("onboardingBudgetMin", 15);
                  setOnboardingField("onboardingBudgetMax", max);
                }}
              />
            </div>
          </StepShell>
        )}

        {onboardingStep === 4 && (
          <StepShell icon={<Users />} title={onboardingCopy.peopleTitle} body={onboardingCopy.peopleBody} kicker={onboardingCopy.kicker}>
            <PeopleSlider
              value={onboardingPeople}
              person={onboardingCopy.person}
              people={onboardingCopy.people}
              onChange={(value) => setOnboardingField("onboardingPeople", value)}
            />
          </StepShell>
        )}

        {onboardingStep === 5 && (
          <StepShell icon={<Target />} title={onboardingCopy.goalTitle} body={onboardingCopy.goalBody} kicker={onboardingCopy.kicker}>
            <OptionList values={MEAL_GOALS} selected={onboardingGoal} onSelect={(goal) => setOnboardingField("onboardingGoal", goal)} iconFor={getOptionIcon} />
          </StepShell>
        )}

        {onboardingStep === 6 && (
          <StepShell icon={<Compass />} title={onboardingCopy.vibeTitle} body={onboardingCopy.vibeBody.replace("{count}", String(onboardingVibes.length))} kicker={onboardingCopy.kicker}>
            <OptionGrid values={FOOD_VIBES} selected={onboardingVibes} onSelect={toggleVibe} disabled={(vibe) => onboardingVibes.length >= 3 && !onboardingVibes.includes(vibe)} iconFor={getOptionIcon} />
          </StepShell>
        )}

        {onboardingStep === 7 && (
          <StepShell icon={<Heart />} title={onboardingCopy.dietTitle} body={onboardingCopy.dietBody} kicker={onboardingCopy.kicker}>
            <OptionGrid values={DIETARY_NEEDS} selected={onboardingDietaryNeeds} onSelect={toggleDiet} iconFor={getOptionIcon} />
          </StepShell>
        )}

        {onboardingStep === 8 && (
          <StepShell icon={<Clock />} title={onboardingCopy.timeTitle} body={onboardingCopy.timeBody} kicker={onboardingCopy.kicker}>
            <OptionList values={COOKING_TIMES} selected={onboardingCookingTime} onSelect={(time) => setOnboardingField("onboardingCookingTime", time)} iconFor={getOptionIcon} />
          </StepShell>
        )}

        {onboardingStep === 9 && (
          <StepShell icon={<CookingPot />} title={onboardingCopy.kitchenTitle} body={onboardingCopy.kitchenBody} kicker={onboardingCopy.kicker}>
            <OptionGrid values={KITCHEN_ITEMS} selected={onboardingKitchenItems} onSelect={toggleKitchenItem} iconFor={getOptionIcon} compact />
          </StepShell>
        )}

        {onboardingStep === 10 && (
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="h-20 w-20 rounded-full border border-warm-stone border-t-primary animate-spin" />
            <div>
              <h2 className="font-serif text-[36px] leading-[39px] text-foreground">{onboardingCopy.loadingTitle}</h2>
              <div className="mt-6 space-y-2 text-left">
                {onboardingCopy.loadingPhrases.map((phrase, idx) => (
                  <p key={phrase} className={`text-sm ${idx <= loadingStepIdx ? "text-foreground" : "text-muted/45"}`}>{phrase}</p>
                ))}
              </div>
            </div>
            {error && <p className="rounded-2xl bg-card p-4 text-sm text-muted">{error}</p>}
          </div>
        )}
      </div>

      {onboardingStep > 1 && onboardingStep < 10 && (
        <button onClick={nextStep} className="mt-4 flex h-14 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-white shadow-md">
          <span>{onboardingStep === 9 ? onboardingCopy.compose : onboardingCopy.continue}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function StepShell({ icon, title, body, kicker, children }: { icon: React.ReactNode; title: string; body: string; kicker: string; children: React.ReactNode }) {
  return (
    <motion.div key={title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }} className="flex min-h-0 flex-1 flex-col">
      <div className="relative mb-5 overflow-hidden rounded-[2rem] border border-warm-stone/60 bg-card p-5 shadow-md">
        <div className="absolute right-4 top-4 h-20 w-20 rounded-full border border-primary/20" />
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-primary text-white shadow-md [&_svg]:h-6 [&_svg]:w-6 [&_svg]:stroke-[1.5]">
          {icon}
        </div>
        <p className="editorial-kicker mt-7">{kicker}</p>
        <h2 className="mt-2 font-serif text-[36px] leading-[38px] text-foreground">{title}</h2>
        <p className="mt-3 max-w-[330px] text-sm leading-6 text-muted">{body}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-1 no-scrollbar">{children}</div>
    </motion.div>
  );
}

function OptionGrid<T extends string>({ values, selected, onSelect, disabled, iconFor, compact }: { values: readonly T[]; selected: readonly T[]; onSelect: (value: T) => void; disabled?: (value: T) => boolean; iconFor: (value: string) => React.ReactNode; compact?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {values.map((value) => (
        <OptionButton key={value} active={selected.includes(value)} disabled={disabled?.(value)} onClick={() => onSelect(value)} icon={iconFor(String(value))} compact={compact}>
          {value}
        </OptionButton>
      ))}
    </div>
  );
}

function PeopleSlider({ value, person, people, onChange }: { value: number; person: string; people: string; onChange: (value: number) => void }) {
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

function OptionList<T extends string | number>({ values, selected, onSelect, label, iconFor }: { values: readonly T[]; selected: T; onSelect: (value: T) => void; label?: (value: T) => string; iconFor: (value: string) => React.ReactNode }) {
  return (
    <div className="space-y-2">
      {values.map((value) => (
        <OptionButton key={String(value)} active={selected === value} onClick={() => onSelect(value)} icon={iconFor(String(value))}>
          {label ? label(value) : String(value)}
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
  if (/^[1-5]/.test(v)) return <User />;
  return <Sparkles />;
}
