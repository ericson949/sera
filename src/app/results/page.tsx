"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, BookmarkCheck, GripVertical, Loader2, RefreshCw, ShoppingBag } from "lucide-react";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import MealDetailModal from "@/modules/meal-planning/presentation/components/MealDetailModal";
import PaywallModal from "@/modules/meal-planning/presentation/components/PaywallModal";
import { useWeeklyMealState } from "@/modules/meal-planning/presentation/hooks/useWeeklyMealState";
import { useFeatureFlag } from "@/shared/presentation/hooks/useFeatureFlag";
import { createMoney, formatMoney } from "@/modules/meal-planning/domain/value-objects/Money";
import { getSeraMealImagePosition, getSeraMealImageUrl, SERA_IMAGES } from "@/shared/seraVisuals";
import { getProductCopy } from "@/shared/seraProductCopy";

export default function ResultsPage() {
  const { activePlan, isGenerating, saveCurrentPlan, regeneratePlan, selectMeal, swapPlannedMeals, userId, appLanguage } = useDinneroStore();
  const [draggedMealId, setDraggedMealId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const copy = getProductCopy(appLanguage).results;
  const weekCopy = getProductCopy(appLanguage).weekView;
  const weekState = useWeeklyMealState(activePlan, userId);
  const dragAndDropV2 = useFeatureFlag("flag-drag-and-drop-v2", true);

  useEffect(() => {
    if (!draggedMealId) return;

    const finishDrag = (event: PointerEvent) => {
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-meal-id]");
      const targetMealId = target?.dataset.mealId;

      if (dragAndDropV2 && targetMealId && weekState.canSwapPair(draggedMealId, targetMealId)) {
        void swapPlannedMeals(draggedMealId, targetMealId);
      }

      setDraggedMealId(null);
    };

    const cancelDrag = () => setDraggedMealId(null);

    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", cancelDrag);

    return () => {
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", cancelDrag);
    };
  }, [dragAndDropV2, draggedMealId, swapPlannedMeals, weekState]);

  if (!activePlan && !isGenerating) {
    return (
      <div className="flex min-h-[calc(100svh-5rem)] flex-col justify-center bg-background px-6 text-center">
        <p className="editorial-kicker">{copy.emptyKicker}</p>
        <h1 className="mt-3 font-serif text-[40px] leading-[43px] text-foreground">{copy.emptyTitle}</h1>
        <p className="mx-auto mt-4 max-w-[300px] text-sm leading-6 text-muted">{copy.emptyBody}</p>
        <Link href="/onboarding" className="mt-7 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-md">
          {copy.start}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center bg-background px-6 text-center">
        <div className="h-16 w-16 animate-spin rounded-full border border-warm-stone border-t-primary" />
        <h1 className="mt-6 font-serif text-[36px] leading-[39px] text-foreground">{copy.loadingTitle}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{copy.loadingBody}</p>
      </div>
    );
  }

  const plan = activePlan!;
  const withinBudget = plan.estimatedTotal.amount <= plan.budget.max;

  const handleSavePlan = async () => {
    setLoadingSave(true);
    try {
      await saveCurrentPlan();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="flex h-[calc(100svh-5rem)] flex-col bg-background">
      <header className="shrink-0 px-5 pb-4 pt-5">
        <div className="editorial-photo relative h-36 overflow-hidden rounded-[2rem] px-5 py-4 shadow-md" style={{ "--editorial-image": `url(${SERA_IMAGES.table})` } as CSSProperties}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/55" />
          <div className="relative flex h-full flex-col justify-between text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">{copy.journal}</p>
            <div>
              <h1 className="font-serif text-[34px] leading-[35px]">{copy.title}</h1>
              <p className="mt-1 text-xs text-white/85">
                {plan.peopleCount} {plan.peopleCount === 1 ? copy.guest : copy.guests} - {plan.shop}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[1.2fr_0.8fr] gap-3">
          <div className="rounded-[1.5rem] bg-surface-container-low p-4">
            <p className="editorial-kicker">{copy.estimated}</p>
            <p className="mt-1 font-serif text-3xl leading-none text-foreground">{formatMoney(plan.estimatedTotal)}</p>
            <p className="mt-2 text-xs text-muted">{copy.budgetMax}: {formatMoney(createMoney(plan.budget.max))}</p>
          </div>
          <div className="rounded-[1.5rem] bg-primary p-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">{copy.budget}</p>
            <p className="mt-2 text-sm font-semibold">{withinBudget ? copy.inRange : copy.watch}</p>
            <p className="mt-1 text-2xl font-semibold">{plan.budgetConfidence}%</p>
          </div>
        </div>
      </header>

      <div className="flex shrink-0 gap-2 px-5 pb-4">
        <Link href="/shopping-list" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white shadow-md">
          <ShoppingBag className="h-4 w-4" />
          {copy.marketList}
        </Link>
        <button onClick={regeneratePlan} className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-sm" aria-label={copy.regenerate}>
          <RefreshCw className="h-4 w-4" />
        </button>
        <button disabled={loadingSave} onClick={handleSavePlan} className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-sm disabled:opacity-60" aria-label={copy.save}>
          {loadingSave ? <Loader2 className="h-4 w-4 animate-spin" /> : plan.saved || savedSuccess ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>

      <section className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        <p className="editorial-kicker mb-5">{copy.evenings}</p>
        {dragAndDropV2 && <p className="-mt-2 mb-4 text-center text-xs font-semibold text-muted">{weekCopy.dragHint}</p>}
        <div className="space-y-3">
          {weekState.scheduledMeals.map((item) => {
            const { meal, status } = item;

            return (
              <article
                key={meal.id}
                data-meal-id={meal.id}
                className={`rounded-[1.6rem] bg-card p-3 shadow-sm transition ${item.isToday ? "border border-primary" : ""} ${draggedMealId === meal.id ? "opacity-55" : ""}`}
              >
                <button onClick={() => selectMeal(meal)} className="w-full text-left">
                  <div className="grid grid-cols-[96px_1fr_auto] gap-3">
                    <div
                      className="editorial-photo h-28 rounded-[1.25rem]"
                      style={
                        {
                          "--editorial-image": `url(${getSeraMealImageUrl(meal.imageUrl)})`,
                          "--editorial-position": getSeraMealImagePosition(meal.day),
                        } as CSSProperties
                      }
                    />
                    <div className="min-w-0 py-1">
                      <p className="editorial-kicker">{item.isToday ? `${weekCopy.today} - ${item.dateLabel}` : item.dateLabel}</p>
                      <h2 className="mt-1 line-clamp-2 font-serif text-[26px] leading-[28px] text-foreground">{meal.title}</h2>
                      <p className="mt-2 text-xs text-muted">
                        {meal.prepTimeMinutes} min - {formatMoney(meal.estimatedCost)} - {status === "cooked" ? weekCopy.cooked : status === "skipped" ? weekCopy.skipped : weekCopy.planned}
                      </p>
                    </div>
                    <div
                      onPointerDown={(event) => {
                        if (!item.canDrag || !dragAndDropV2) return;
                        event.preventDefault();
                        setDraggedMealId(meal.id);
                      }}
                      className={`mt-1 flex h-9 w-9 shrink-0 touch-none items-center justify-center rounded-full ${item.canDrag && dragAndDropV2 ? "bg-surface-container-low text-muted" : "bg-surface-container-low/50 text-muted/35"}`}
                      role="button"
                      aria-label={weekCopy.dragHint}
                    >
                      <GripVertical className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted">{meal.description}</p>
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <MealDetailModal />
      <PaywallModal />
    </div>
  );
}
