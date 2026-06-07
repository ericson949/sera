"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Clock, Compass, CookingPot, Heart, Layers, Loader2, ShoppingCart, Target, User } from "lucide-react";
import BudgetSlider from "@/modules/meal-planning/presentation/components/BudgetSlider";
import SeraPreOnboarding from "@/modules/meal-planning/presentation/components/SeraPreOnboarding";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { useSeraLocaleDetection } from "@/modules/meal-planning/presentation/hooks/useSeraLocaleDetection";
import { getCopy } from "@/shared/i18n";
import { GROCERY_SHOPS } from "@/modules/meal-planning/domain/value-objects/GroceryShop";
import { MEAL_GOALS } from "@/modules/meal-planning/domain/value-objects/MealGoal";
import { FOOD_VIBES, FoodVibe } from "@/modules/meal-planning/domain/value-objects/FoodVibe";
import { DIETARY_NEEDS, DietaryNeed } from "@/modules/meal-planning/domain/value-objects/DietaryNeed";
import { COOKING_TIMES } from "@/modules/meal-planning/domain/value-objects/CookingTime";

const KITCHEN_ITEMS = ["Pasta", "Rice", "Eggs", "Chicken", "Tuna", "Tomatoes", "Cheese", "Potatoes", "Beans", "Lentils", "Olive oil", "Onion", "Garlic", "Frozen vegetables", "Spices", "Milk", "Yogurt", "Bread", "Oats"];
const LOADING_PHRASES = ["Reading your market rhythm...", "Balancing budget and taste...", "Choosing dinners with restraint...", "Arranging a calm shopping guide...", "Preparing the week."];

export default function OnboardingPage() {
  const router = useRouter();
  const store = useDinneroStore();
  const copy = getCopy(store.appLanguage);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const {
    onboardingStep,
    onboardingShop,
    onboardingBudgetMin,
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
      interval = setInterval(() => setLoadingStepIdx((prev) => Math.min(prev + 1, LOADING_PHRASES.length - 1)), 700);
    } else {
      setLoadingStepIdx(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [onboardingStep]);

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
    <div className={`${onboardingStep === 1 ? "h-svh overflow-hidden" : "min-h-svh"} flex flex-col justify-between bg-background p-5`}>
      {onboardingStep > 1 && onboardingStep < 10 && (
        <div className="flex items-center justify-between pt-2">
          <button onClick={prevStep} className="flex h-10 w-10 items-center justify-center rounded-full border border-warm-stone/70">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="editorial-kicker">Step {onboardingStep - 1} / 8</span>
          <div className="w-10" />
        </div>
      )}

      {renderProgress()}

      <div className="flex min-h-0 flex-1 flex-col justify-center">
        {onboardingStep === 1 && (
          <SeraPreOnboarding appCountry={store.appCountry} copy={copy} setOnboardingField={setOnboardingField} onStart={startQuestions} />
        )}

        {onboardingStep === 2 && (
          <StepShell icon={<ShoppingCart />} title="Where do you usually shop?" body="We use this to make your market estimate feel realistic.">
            <OptionGrid values={GROCERY_SHOPS} selected={[onboardingShop]} onSelect={(shop) => setOnboardingField("onboardingShop", shop)} />
          </StepShell>
        )}

        {onboardingStep === 3 && (
          <StepShell icon={<Layers />} title="What is your dinner budget?" body="Sera will keep the weekly journal anchored to this range.">
            <div className="rounded-[1.8rem] bg-card p-6 shadow-sm">
              <BudgetSlider
                min={onboardingBudgetMin}
                max={onboardingBudgetMax}
                onChange={(min, max) => {
                  setOnboardingField("onboardingBudgetMin", min);
                  setOnboardingField("onboardingBudgetMax", max);
                }}
              />
            </div>
          </StepShell>
        )}

        {onboardingStep === 4 && (
          <StepShell icon={<User />} title="How many people eat at your table?" body="Portions and shopping quantities will follow.">
            <OptionList values={[1, 2, 3, 4, 5]} selected={onboardingPeople} label={(num) => (num === 5 ? "5+ people" : `${num} ${num === 1 ? "person" : "people"}`)} onSelect={(num) => setOnboardingField("onboardingPeople", num)} />
          </StepShell>
        )}

        {onboardingStep === 5 && (
          <StepShell icon={<Target />} title="What should the week prioritize?" body="A subtle editorial direction for the meals.">
            <OptionList values={MEAL_GOALS} selected={onboardingGoal} onSelect={(goal) => setOnboardingField("onboardingGoal", goal)} />
          </StepShell>
        )}

        {onboardingStep === 6 && (
          <StepShell icon={<Compass />} title="What style feels right?" body={`Choose up to 3. Selected: ${onboardingVibes.length}/3`}>
            <OptionGrid values={FOOD_VIBES} selected={onboardingVibes} onSelect={toggleVibe} disabled={(vibe) => onboardingVibes.length >= 3 && !onboardingVibes.includes(vibe)} />
          </StepShell>
        )}

        {onboardingStep === 7 && (
          <StepShell icon={<Heart />} title="Any dietary needs?" body="Sera will respect these boundaries.">
            <OptionGrid values={DIETARY_NEEDS} selected={onboardingDietaryNeeds} onSelect={toggleDiet} />
          </StepShell>
        )}

        {onboardingStep === 8 && (
          <StepShell icon={<Clock />} title="How much time do you have?" body="No elaborate recipes on rushed evenings.">
            <OptionList values={COOKING_TIMES} selected={onboardingCookingTime} onSelect={(time) => setOnboardingField("onboardingCookingTime", time)} />
          </StepShell>
        )}

        {onboardingStep === 9 && (
          <StepShell icon={<CookingPot />} title="What is already in your kitchen?" body="Use what is there first.">
            <OptionGrid values={KITCHEN_ITEMS} selected={onboardingKitchenItems} onSelect={toggleKitchenItem} />
          </StepShell>
        )}

        {onboardingStep === 10 && (
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="h-20 w-20 rounded-full border border-warm-stone border-t-primary animate-spin" />
            <div>
              <h2 className="font-serif text-[36px] leading-[39px] text-foreground">Composing the week.</h2>
              <div className="mt-6 space-y-2 text-left">
                {LOADING_PHRASES.map((phrase, idx) => (
                  <p key={phrase} className={`text-sm ${idx <= loadingStepIdx ? "text-foreground" : "text-muted/45"}`}>{phrase}</p>
                ))}
              </div>
            </div>
            {error && <p className="rounded-2xl bg-card p-4 text-sm text-muted">{error}</p>}
          </div>
        )}
      </div>

      {onboardingStep > 1 && onboardingStep < 10 && (
        <button onClick={nextStep} className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-white shadow-md">
          <span>{onboardingStep === 9 ? "Compose the week" : "Continue"}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function StepShell({ icon, title, body, children }: { icon: React.ReactNode; title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-low text-primary [&_svg]:h-5 [&_svg]:w-5 [&_svg]:stroke-[1.5]">
          {icon}
        </div>
        <h2 className="font-serif text-[34px] leading-[37px] text-foreground">{title}</h2>
        <p className="mx-auto mt-3 max-w-[310px] text-sm leading-6 text-muted">{body}</p>
      </div>
      {children}
    </div>
  );
}

function OptionGrid<T extends string>({ values, selected, onSelect, disabled }: { values: readonly T[]; selected: readonly T[]; onSelect: (value: T) => void; disabled?: (value: T) => boolean }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {values.map((value) => (
        <OptionButton key={value} active={selected.includes(value)} disabled={disabled?.(value)} onClick={() => onSelect(value)}>
          {value}
        </OptionButton>
      ))}
    </div>
  );
}

function OptionList<T extends string | number>({ values, selected, onSelect, label }: { values: readonly T[]; selected: T; onSelect: (value: T) => void; label?: (value: T) => string }) {
  return (
    <div className="space-y-2">
      {values.map((value) => (
        <OptionButton key={String(value)} active={selected === value} onClick={() => onSelect(value)}>
          {label ? label(value) : String(value)}
        </OptionButton>
      ))}
    </div>
  );
}

function OptionButton({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-12 items-center justify-between rounded-[1.1rem] px-4 py-3 text-left text-sm font-semibold transition disabled:opacity-35 ${active ? "bg-primary text-white" : "bg-card text-foreground shadow-sm"}`}
    >
      <span>{children}</span>
      {active && <Check className="h-4 w-4" />}
    </button>
  );
}
