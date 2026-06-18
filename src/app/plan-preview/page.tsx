"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Link from "next/link";
import { Check, GripVertical, RefreshCw, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import MealDetailModal from "@/modules/meal-planning/presentation/components/MealDetailModal";
import { useMealPlanDragSwap } from "@/modules/meal-planning/presentation/hooks/useMealPlanDragSwap";
import { useWeeklyMealState } from "@/modules/meal-planning/presentation/hooks/useWeeklyMealState";
import { useFeatureFlag } from "@/shared/presentation/hooks/useFeatureFlag";
import { formatMoney } from "@/modules/meal-planning/domain/value-objects/Money";
import { getProductCopy } from "@/shared/seraProductCopy";
import { getSeraMealImagePosition, getSeraMealImageUrl } from "@/shared/seraVisuals";
import { useMealPlanEnrichment } from "@/modules/meal-planning/presentation/hooks/useMealPlanEnrichment";

export default function PlanPreviewPage() {
  useMealPlanEnrichment();
  const router = useRouter();
  const { activePlan, appLanguage, regeneratePlan, selectMeal, swapPlannedMeals, userId } = useDinneroStore();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const copy = getProductCopy(appLanguage).results;
  const weekCopy = getProductCopy(appLanguage).weekView;
  const onboardingCopy = getProductCopy(appLanguage).onboarding;
  const weekState = useWeeklyMealState(activePlan, userId);
  const dragAndDropV2 = useFeatureFlag("flag-drag-and-drop-v2", true);
  const { draggedMealId, dragPosition, hoverMealId, startDrag } = useMealPlanDragSwap({ enabled: dragAndDropV2, canSwapPair: weekState.canSwapPair, swapMeals: swapPlannedMeals });

  if (!activePlan) {
    return (
      <div className="flex h-svh flex-col justify-center bg-background px-6 text-center">
        <p className="editorial-kicker">{copy.emptyKicker}</p>
        <h1 className="mt-3 font-serif text-[42px] leading-[44px] text-foreground">{copy.emptyTitle}</h1>
        <Link href="/onboarding" className="mt-8 flex h-14 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-md">
          {copy.start}
        </Link>
      </div>
    );
  }

  const acceptPlan = () => {
    localStorage.setItem("sera_preview_accepted_plan_id", activePlan.id);
    router.push("/post-onboarding");
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await regeneratePlan();
    setIsRegenerating(false);
  };

  const draggedMeal = activePlan.days.find((meal) => meal.id === draggedMealId);

  if (isRegenerating) {
    return (
      <div className="flex h-svh flex-col items-center justify-center bg-background px-6 text-center">
        <div className="h-16 w-16 animate-spin rounded-full border border-warm-stone border-t-primary" />
        <h1 className="mt-6 font-serif text-[34px] leading-[36px] text-foreground">{onboardingCopy.loadingTitle}</h1>
        <div className="mt-6 space-y-2 text-left">
          {onboardingCopy.loadingPhrases.map((phrase) => (
            <p key={phrase} className="text-sm text-muted">{phrase}</p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-svh flex-col bg-background p-5">
      <header className="shrink-0 pb-4 pt-2">
        <p className="editorial-kicker">{copy.journal}</p>
        <h1 className="mt-2 font-serif text-[44px] leading-[45px] text-foreground">{copy.title}</h1>
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
          <Link href="/plan-preview/shopping-list" className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-md">
            <ShoppingBag className="h-4 w-4" />
            {copy.marketList}
          </Link>
          <div className="flex h-12 min-w-28 flex-col justify-center rounded-full bg-card px-4 text-right shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{copy.estimated}</p>
            <p className="font-serif text-lg leading-none text-foreground">{formatMoney(activePlan.estimatedTotal)}</p>
          </div>
        </div>
      </header>

      <section data-drag-scroll className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          {weekState.scheduledMeals.map((item) => {
            const { meal } = item;
            return (
              <article
                key={meal.id}
                data-meal-id={meal.id}
                className={`grid grid-cols-[1fr_auto] gap-2 rounded-[1.4rem] bg-card p-3 shadow-sm transition duration-200 ${draggedMealId === meal.id ? "scale-[0.98] opacity-25" : ""} ${hoverMealId === meal.id ? "translate-y-1 ring-1 ring-primary/30" : ""}`}
              >
                <button onClick={() => selectMeal(meal)} className="grid min-w-0 grid-cols-[84px_1fr] gap-3 text-left">
                  <span
                    className="editorial-photo h-24 rounded-[1.1rem]"
                    style={
                      {
                        "--editorial-image": `url(${getSeraMealImageUrl(meal.imageUrl)})`,
                        "--editorial-position": getSeraMealImagePosition(meal.day),
                        backgroundImage: `url(${getSeraMealImageUrl(meal.imageUrl)})`,
                        backgroundPosition: getSeraMealImagePosition(meal.day),
                        backgroundSize: "cover",
                      } as CSSProperties
                    }
                  />
                  <span className="min-w-0 py-1">
                    <span className="editorial-kicker">{item.isToday ? `${weekCopy.today} - ${item.dateLabel}` : item.dateLabel}</span>
                    <span className="mt-1 line-clamp-2 font-serif text-[24px] leading-[26px] text-foreground">{meal.title}</span>
                    <span className="mt-2 block text-xs text-muted">{meal.prepTimeMinutes} min - {formatMoney(meal.estimatedCost)}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onPointerDown={(event) => startDrag(event, meal.id, item.canDrag)}
                  className="mt-1 flex h-9 w-9 shrink-0 touch-none items-center justify-center rounded-full bg-surface-container-low text-muted"
                  aria-label={weekCopy.dragHint}
                >
                  <GripVertical className="h-5 w-5" />
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <div className="mt-4 grid grid-cols-[auto_1fr] gap-3">
        <button onClick={handleRegenerate} disabled={isRegenerating} className="flex h-14 w-14 items-center justify-center rounded-full bg-card text-foreground shadow-sm disabled:opacity-50" aria-label={copy.regenerate}>
          <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
        </button>
        <button onClick={acceptPlan} className="flex h-14 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white shadow-md">
          <Check className="h-4 w-4" />
          {copy.save}
        </button>
      </div>
      {draggedMeal && dragPosition && (
        <div
          className="pointer-events-none fixed z-[60] w-[280px] -translate-x-10 -translate-y-10 rounded-[1.4rem] bg-card p-3 shadow-2xl ring-1 ring-primary/20"
          style={{ left: dragPosition.x, top: dragPosition.y }}
        >
          <div className="grid grid-cols-[78px_1fr] gap-3">
            <div
              className="editorial-photo h-20 rounded-[1rem]"
              style={
                {
                  "--editorial-image": `url(${getSeraMealImageUrl(draggedMeal.imageUrl)})`,
                  "--editorial-position": getSeraMealImagePosition(draggedMeal.day),
                  backgroundImage: `url(${getSeraMealImageUrl(draggedMeal.imageUrl)})`,
                  backgroundPosition: getSeraMealImagePosition(draggedMeal.day),
                  backgroundSize: "cover",
                } as CSSProperties
              }
            />
            <div className="min-w-0 py-1">
              <p className="editorial-kicker">{draggedMeal.day}</p>
              <p className="mt-1 line-clamp-2 font-serif text-[22px] leading-[24px] text-foreground">{draggedMeal.title}</p>
              <p className="mt-2 text-xs text-muted">{formatMoney(draggedMeal.estimatedCost)}</p>
            </div>
          </div>
        </div>
      )}
      <MealDetailModal />
    </div>
  );
}
