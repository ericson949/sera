"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, Compass, CookingPot, Heart, Store, Target, Users, Wallet } from "lucide-react";
import BudgetSlider from "@/modules/meal-planning/presentation/components/BudgetSlider";
import CookingTimeCards from "@/modules/meal-planning/presentation/components/CookingTimeCards";
import GoalSelector from "@/modules/meal-planning/presentation/components/GoalSelector";
import OnboardingOptionGrid from "@/modules/meal-planning/presentation/components/OnboardingOptionGrid";
import OnboardingStepShell from "@/modules/meal-planning/presentation/components/OnboardingStepShell";
import PeopleSlider from "@/modules/meal-planning/presentation/components/PeopleSlider";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { COOKING_TIMES } from "@/modules/meal-planning/domain/value-objects/CookingTime";
import { DIETARY_NEEDS } from "@/modules/meal-planning/domain/value-objects/DietaryNeed";
import { FOOD_VIBES } from "@/modules/meal-planning/domain/value-objects/FoodVibe";
import { GROCERY_SHOPS } from "@/modules/meal-planning/domain/value-objects/GroceryShop";
import { MEAL_GOALS } from "@/modules/meal-planning/domain/value-objects/MealGoal";
import { KITCHEN_ITEMS } from "@/shared/onboardingConstants";
import { getProductCopy } from "@/shared/seraProductCopy";

const FIRST_STEP = 2;
const LAST_STEP = 9;

export default function NewWeekPage() {
  const router = useRouter();
  const [step, setStep] = useState(FIRST_STEP);
  const store = useDinneroStore();
  const copy = getProductCopy(store.appLanguage).onboarding;

  useEffect(() => {
    if (!store.hasHydrated) return;
    if (!store.user && !store.activePlan) router.replace("/onboarding");
  }, [router, store.activePlan, store.hasHydrated, store.user]);

  const goBack = () => {
    if (step === FIRST_STEP) {
      router.push("/dashboard");
      return;
    }
    setStep((current) => current - 1);
  };

  const goNext = async () => {
    if (step < LAST_STEP) {
      setStep((current) => current + 1);
      return;
    }

    setStep(10);
    await store.generatePlan();
    router.push("/results");
  };

  return (
    <div className="flex h-svh flex-col justify-between overflow-hidden bg-background p-5">
      <header className="flex shrink-0 items-center justify-center pt-2">
        <span className="editorial-kicker">{copy.progress} {Math.min(step - 1, 8)} / 8</span>
      </header>

      <Progress step={step} />

      <div className="flex min-h-0 flex-1 flex-col justify-center">
        {step === 2 && (
          <OnboardingStepShell icon={<Store />} title={copy.shopTitle} body={copy.shopBody} kicker={copy.kicker}>
            <OnboardingOptionGrid values={GROCERY_SHOPS} selected={[store.onboardingShop]} onSelect={(shop) => store.setOnboardingField("onboardingShop", shop)} />
          </OnboardingStepShell>
        )}

        {step === 3 && (
          <OnboardingStepShell icon={<Wallet />} title={copy.budgetTitle} body={copy.budgetBody} kicker={copy.kicker}>
            <div className="rounded-[1.8rem] border border-warm-stone/60 bg-card p-6 shadow-md">
              <BudgetSlider
                max={store.onboardingBudgetMax}
                label={copy.budgetLabel}
                helper={copy.budgetHelper}
                onChange={(max) => {
                  store.setOnboardingField("onboardingBudgetMin", 15);
                  store.setOnboardingField("onboardingBudgetMax", max);
                }}
              />
            </div>
          </OnboardingStepShell>
        )}

        {step === 4 && (
          <OnboardingStepShell icon={<Users />} title={copy.peopleTitle} body={copy.peopleBody} kicker={copy.kicker}>
            <PeopleSlider value={store.onboardingPeople} person={copy.person} people={copy.people} onChange={(value) => store.setOnboardingField("onboardingPeople", value)} />
          </OnboardingStepShell>
        )}

        {step === 5 && (
          <OnboardingStepShell icon={<Target />} title={copy.goalTitle} body={copy.goalBody} kicker={copy.kicker}>
            <GoalSelector goals={MEAL_GOALS} selected={store.onboardingGoal} copy={copy.goalCards} onSelect={(goal) => store.setOnboardingField("onboardingGoal", goal)} />
          </OnboardingStepShell>
        )}

        {step === 6 && (
          <OnboardingStepShell icon={<Compass />} title={copy.vibeTitle} body={copy.vibeBody.replace("{count}", String(store.onboardingVibes.length))} kicker={copy.kicker}>
            <OnboardingOptionGrid values={FOOD_VIBES} selected={store.onboardingVibes} onSelect={toggleVibe} disabled={(vibe) => store.onboardingVibes.length >= 3 && !store.onboardingVibes.includes(vibe)} />
          </OnboardingStepShell>
        )}

        {step === 7 && (
          <OnboardingStepShell icon={<Heart />} title={copy.dietTitle} body={copy.dietBody} kicker={copy.kicker}>
            <OnboardingOptionGrid values={DIETARY_NEEDS} selected={store.onboardingDietaryNeeds} onSelect={toggleDiet} />
          </OnboardingStepShell>
        )}

        {step === 8 && (
          <OnboardingStepShell icon={<Clock />} title={copy.timeTitle} body={copy.timeBody} kicker={copy.kicker}>
            <CookingTimeCards times={COOKING_TIMES} selected={store.onboardingCookingTime} copy={copy.cookingTimeCards} onSelect={(time) => store.setOnboardingField("onboardingCookingTime", time)} />
          </OnboardingStepShell>
        )}

        {step === 9 && (
          <OnboardingStepShell icon={<CookingPot />} title={copy.kitchenTitle} body={copy.kitchenBody} kicker={copy.kicker}>
            <OnboardingOptionGrid values={KITCHEN_ITEMS} selected={store.onboardingKitchenItems} onSelect={toggleKitchenItem} compact />
          </OnboardingStepShell>
        )}

        {step === 10 && (
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="h-20 w-20 rounded-full border border-warm-stone border-t-primary animate-spin" />
            <h2 className="font-serif text-[36px] leading-[39px] text-foreground">{copy.loadingTitle}</h2>
          </div>
        )}
      </div>

      {step < 10 && (
        <div className="mt-4 flex shrink-0 gap-3">
          <button onClick={goBack} className="flex h-14 w-14 items-center justify-center rounded-full bg-card text-foreground shadow-sm" aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={goNext} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-white shadow-md">
            <span>{step === LAST_STEP ? copy.compose : copy.continue}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );

  function toggleVibe(vibe: (typeof FOOD_VIBES)[number]) {
    const current = store.onboardingVibes;
    store.setOnboardingField("onboardingVibes", current.includes(vibe) ? current.filter((item) => item !== vibe) : current.length < 3 ? [...current, vibe] : current);
  }

  function toggleDiet(diet: (typeof DIETARY_NEEDS)[number]) {
    if (diet === "None") {
      store.setOnboardingField("onboardingDietaryNeeds", ["None"]);
      return;
    }
    const withoutNone = store.onboardingDietaryNeeds.filter((item) => item !== "None");
    const next = withoutNone.includes(diet) ? withoutNone.filter((item) => item !== diet) : [...withoutNone, diet];
    store.setOnboardingField("onboardingDietaryNeeds", next.length ? next : ["None"]);
  }

  function toggleKitchenItem(item: string) {
    const current = store.onboardingKitchenItems;
    store.setOnboardingField("onboardingKitchenItems", current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  }
}

function Progress({ step }: { step: number }) {
  return (
    <div className="mb-4 flex w-full gap-1.5 px-6 pt-4">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className={`h-1 flex-1 rounded-full ${idx < Math.min(step - 1, 8) ? "bg-primary" : "bg-border"}`} />
      ))}
    </div>
  );
}
