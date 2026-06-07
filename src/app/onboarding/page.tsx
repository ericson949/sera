"use client";

import { ChevronLeft, ChevronRight, Clock, Compass, CookingPot, Heart, Store, Target, Users, Wallet } from "lucide-react";
import BudgetSlider from "@/modules/meal-planning/presentation/components/BudgetSlider";
import CookingTimeCards from "@/modules/meal-planning/presentation/components/CookingTimeCards";
import GoalSelector from "@/modules/meal-planning/presentation/components/GoalSelector";
import OnboardingOptionGrid from "@/modules/meal-planning/presentation/components/OnboardingOptionGrid";
import OnboardingStepShell from "@/modules/meal-planning/presentation/components/OnboardingStepShell";
import PeopleSlider from "@/modules/meal-planning/presentation/components/PeopleSlider";
import SeraPreOnboarding from "@/modules/meal-planning/presentation/components/SeraPreOnboarding";
import { useOnboardingFlow } from "@/modules/meal-planning/presentation/hooks/useOnboardingFlow";
import { COOKING_TIMES } from "@/modules/meal-planning/domain/value-objects/CookingTime";
import { DIETARY_NEEDS } from "@/modules/meal-planning/domain/value-objects/DietaryNeed";
import { FOOD_VIBES } from "@/modules/meal-planning/domain/value-objects/FoodVibe";
import { GROCERY_SHOPS } from "@/modules/meal-planning/domain/value-objects/GroceryShop";
import { MEAL_GOALS } from "@/modules/meal-planning/domain/value-objects/MealGoal";
import { KITCHEN_ITEMS } from "@/shared/onboardingConstants";

export default function OnboardingPage() {
  const { store, copy, onboardingCopy, loadingStepIdx, startQuestions, toggleVibe, toggleDiet, toggleKitchenItem } = useOnboardingFlow();
  const {
    appCountry,
    onboardingStep,
    onboardingShop,
    onboardingBudgetMax,
    onboardingPeople,
    onboardingGoal,
    onboardingVibes,
    onboardingDietaryNeeds,
    onboardingCookingTime,
    onboardingKitchenItems,
    onboardingBatchCooking,
    error,
    setOnboardingField,
    nextStep,
    prevStep,
  } = store;

  return (
    <div className="flex h-svh flex-col justify-between overflow-hidden bg-background p-5">
      {onboardingStep > 1 && onboardingStep < 10 && (
        <div className="flex shrink-0 items-center justify-center pt-2">
          <span className="editorial-kicker">{onboardingCopy.progress} {onboardingStep - 1} / 8</span>
        </div>
      )}

      <OnboardingProgress step={onboardingStep} />

      <div className="flex min-h-0 flex-1 flex-col justify-center">
        {onboardingStep === 1 && (
          <SeraPreOnboarding appCountry={appCountry} copy={copy} setOnboardingField={setOnboardingField} onStart={startQuestions} />
        )}

        {onboardingStep === 2 && (
          <OnboardingStepShell icon={<Store />} title={onboardingCopy.shopTitle} body={onboardingCopy.shopBody} kicker={onboardingCopy.kicker}>
            <OnboardingOptionGrid values={GROCERY_SHOPS} selected={[onboardingShop]} onSelect={(shop) => setOnboardingField("onboardingShop", shop)} />
          </OnboardingStepShell>
        )}

        {onboardingStep === 3 && (
          <OnboardingStepShell icon={<Wallet />} title={onboardingCopy.budgetTitle} body={onboardingCopy.budgetBody} kicker={onboardingCopy.kicker}>
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
          </OnboardingStepShell>
        )}

        {onboardingStep === 4 && (
          <OnboardingStepShell icon={<Users />} title={onboardingCopy.peopleTitle} body={onboardingCopy.peopleBody} kicker={onboardingCopy.kicker}>
            <PeopleSlider value={onboardingPeople} person={onboardingCopy.person} people={onboardingCopy.people} onChange={(value) => setOnboardingField("onboardingPeople", value)} />
          </OnboardingStepShell>
        )}

        {onboardingStep === 5 && (
          <OnboardingStepShell icon={<Target />} title={onboardingCopy.goalTitle} body={onboardingCopy.goalBody} kicker={onboardingCopy.kicker}>
            <GoalSelector goals={MEAL_GOALS} selected={onboardingGoal} copy={onboardingCopy.goalCards} onSelect={(goal) => setOnboardingField("onboardingGoal", goal)} />
          </OnboardingStepShell>
        )}

        {onboardingStep === 6 && (
          <OnboardingStepShell icon={<Compass />} title={onboardingCopy.vibeTitle} body={onboardingCopy.vibeBody.replace("{count}", String(onboardingVibes.length))} kicker={onboardingCopy.kicker}>
            <OnboardingOptionGrid values={FOOD_VIBES} selected={onboardingVibes} onSelect={toggleVibe} disabled={(vibe) => onboardingVibes.length >= 3 && !onboardingVibes.includes(vibe)} />
          </OnboardingStepShell>
        )}

        {onboardingStep === 7 && (
          <OnboardingStepShell icon={<Heart />} title={onboardingCopy.dietTitle} body={onboardingCopy.dietBody} kicker={onboardingCopy.kicker}>
            <OnboardingOptionGrid values={DIETARY_NEEDS} selected={onboardingDietaryNeeds} onSelect={toggleDiet} />
          </OnboardingStepShell>
        )}

        {onboardingStep === 8 && (
          <OnboardingStepShell icon={<Clock />} title={onboardingCopy.timeTitle} body={onboardingCopy.timeBody} kicker={onboardingCopy.kicker}>
            <div className="space-y-3">
              <CookingTimeCards times={COOKING_TIMES} selected={onboardingCookingTime} copy={onboardingCopy.cookingTimeCards} onSelect={(time) => setOnboardingField("onboardingCookingTime", time)} />
              <button onClick={() => setOnboardingField("onboardingBatchCooking", !onboardingBatchCooking)} className={`w-full rounded-[1.4rem] border p-4 text-left text-sm font-semibold ${onboardingBatchCooking ? "border-primary bg-primary text-white" : "border-warm-stone/60 bg-card text-foreground"}`}>
                {onboardingCopy.batchCooking}
              </button>
            </div>
          </OnboardingStepShell>
        )}

        {onboardingStep === 9 && (
          <OnboardingStepShell icon={<CookingPot />} title={onboardingCopy.kitchenTitle} body={onboardingCopy.kitchenBody} kicker={onboardingCopy.kicker}>
            <OnboardingOptionGrid values={KITCHEN_ITEMS} selected={onboardingKitchenItems} onSelect={toggleKitchenItem} compact />
          </OnboardingStepShell>
        )}

        {onboardingStep === 10 && <LoadingStep phrases={onboardingCopy.loadingPhrases} title={onboardingCopy.loadingTitle} activeIndex={loadingStepIdx} error={error} />}
      </div>

      {onboardingStep > 1 && onboardingStep < 10 && (
        <div className="mt-4 flex shrink-0 gap-3">
          <button onClick={prevStep} className="flex h-14 w-14 items-center justify-center rounded-full bg-card text-foreground shadow-sm" aria-label={copy.common.back}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={nextStep} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-white shadow-md">
            <span>{onboardingStep === 9 ? onboardingCopy.compose : onboardingCopy.continue}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function OnboardingProgress({ step }: { step: number }) {
  if (step === 1 || step === 10) return null;
  return (
    <div className="mb-4 flex w-full gap-1.5 px-6 pt-4">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className={`h-1 flex-1 rounded-full ${idx < step - 1 ? "bg-primary" : "bg-border"}`} />
      ))}
    </div>
  );
}

function LoadingStep({ phrases, title, activeIndex, error }: { phrases: readonly string[]; title: string; activeIndex: number; error?: string | null }) {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="h-20 w-20 rounded-full border border-warm-stone border-t-primary animate-spin" />
      <div>
        <h2 className="font-serif text-[36px] leading-[39px] text-foreground">{title}</h2>
        <div className="mt-6 space-y-2 text-left">
          {phrases.map((phrase, idx) => (
            <p key={phrase} className={`text-sm ${idx <= activeIndex ? "text-foreground" : "text-muted/45"}`}>{phrase}</p>
          ))}
        </div>
      </div>
      {error && <p className="rounded-2xl bg-card p-4 text-sm text-muted">{error}</p>}
    </div>
  );
}
