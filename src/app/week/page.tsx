"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Check, GripVertical, Plus, ShoppingBag, X } from "lucide-react";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import MealDetailModal from "@/modules/meal-planning/presentation/components/MealDetailModal";
import PaywallModal from "@/modules/meal-planning/presentation/components/PaywallModal";
import { useMealPlanDragSwap } from "@/modules/meal-planning/presentation/hooks/useMealPlanDragSwap";
import { useWeeklyMealState } from "@/modules/meal-planning/presentation/hooks/useWeeklyMealState";
import { useFeatureFlag } from "@/shared/presentation/hooks/useFeatureFlag";
import { formatMoney } from "@/modules/meal-planning/domain/value-objects/Money";
import { getProductCopy } from "@/shared/seraProductCopy";
import { getSeraMealImagePosition, getSeraMealImageUrl } from "@/shared/seraVisuals";

export default function WeekPage() {
  const { activePlan, dashboard, user, userId, selectMeal, openPaywall, swapPlannedMeals, activatePlan, appLanguage } = useDinneroStore();
  const copy = getProductCopy(appLanguage).weekView;
  const weekState = useWeeklyMealState(activePlan, userId);
  const dragAndDropV2 = useFeatureFlag("flag-drag-and-drop-v2", true);
  const { draggedMealId, startDrag } = useMealPlanDragSwap({ enabled: dragAndDropV2, canSwapPair: weekState.canSwapPair, swapMeals: swapPlannedMeals });
  const openMeal = (meal: NonNullable<typeof activePlan>["days"][number]) => (user?.subscriptionStatus === "pro" ? selectMeal(meal) : openPaywall());

  if (!activePlan) {
    return (
      <div className="flex h-[calc(100svh-5rem)] flex-col justify-center bg-background px-6 text-center">
        <p className="editorial-kicker">{copy.kicker}</p>
        <h1 className="mt-3 font-serif text-[42px] leading-[44px] text-foreground">{copy.empty}</h1>
        <Link href="/new-week" className="mt-8 flex h-14 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-md">
          {copy.newWeek}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100svh-5rem)] flex-col bg-background">
      <header className="shrink-0 px-5 pb-4 pt-5">
        <p className="editorial-kicker">{copy.kicker}</p>
        <h1 className="mt-2 font-serif text-[44px] leading-[45px] text-foreground">{copy.title}</h1>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Stat value={`${weekState.cookedCount}/${activePlan.days.length}`} label={copy.cooked} />
          <Stat value={formatMoney(activePlan.estimatedTotal)} label={copy.market} />
          <Stat value={String(dashboard?.savedPlans.length ?? 0)} label={copy.previous} />
        </div>
      </header>

      <div className="flex shrink-0 gap-2 px-5 pb-4">
        <Link href="/shopping-list" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white shadow-md">
          <ShoppingBag className="h-4 w-4" />
          {copy.market}
        </Link>
        <Link href="/new-week" className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-sm" aria-label={copy.newWeek}>
          <Plus className="h-4 w-4" />
        </Link>
      </div>

      <section className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        {dragAndDropV2 && <p className="mb-3 text-center text-xs font-semibold text-muted">{copy.dragHint}</p>}
        <div className="space-y-3">
          {weekState.scheduledMeals.map((item) => {
            const { meal, status } = item;
            return (
              <article
                key={meal.id}
                data-meal-id={meal.id}
                className={`rounded-[1.6rem] p-3 shadow-sm transition ${item.isToday ? "border border-primary bg-card" : "bg-card"} ${draggedMealId === meal.id ? "opacity-55" : ""} ${!item.canDrag || !dragAndDropV2 ? "cursor-not-allowed" : ""}`}
              >
                <button onClick={() => openMeal(meal)} className="w-full text-left">
                  <div className="grid grid-cols-[86px_1fr_auto] gap-3">
                    <div
                      className="editorial-photo h-24 rounded-[1.2rem]"
                      style={
                        {
                          "--editorial-image": `url(${getSeraMealImageUrl(meal.imageUrl)})`,
                          "--editorial-position": getSeraMealImagePosition(meal.day),
                        } as CSSProperties
                      }
                    />
                    <span className="min-w-0 py-1">
                      <p className="editorial-kicker">{item.isToday ? `${copy.today} - ${item.dateLabel}` : item.dateLabel}</p>
                      <h2 className="mt-1 line-clamp-2 font-serif text-[26px] leading-[28px] text-foreground">{meal.title}</h2>
                      <p className="mt-2 text-xs text-muted">{meal.prepTimeMinutes} min - {formatMoney(meal.estimatedCost)} - {status === "cooked" ? copy.cooked : status === "skipped" ? copy.skipped : copy.planned}</p>
                    </span>
                    <span
                      onPointerDown={(event) => startDrag(event, meal.id, item.canDrag)}
                      className={`mt-1 flex h-9 w-9 shrink-0 touch-none items-center justify-center rounded-full ${item.canDrag && dragAndDropV2 ? "bg-surface-container-low text-muted" : "bg-surface-container-low/50 text-muted/35"}`}
                      role="button"
                      aria-label={copy.dragHint}
                    >
                      <GripVertical className="h-5 w-5" />
                    </span>
                  </div>
                </button>
                <div className="mt-4 flex gap-2">
                  <button disabled={!item.canCook} onClick={() => weekState.setMealStatus(meal, "cooked")} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-xs font-semibold text-white disabled:opacity-40">
                    <Check className="h-3.5 w-3.5" />
                    {copy.done}
                  </button>
                  {item.isToday && (
                    <button disabled={!item.canSkip} onClick={() => weekState.setMealStatus(meal, "skipped")} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-surface-container-low text-xs font-semibold text-foreground disabled:opacity-40">
                      <X className="h-3.5 w-3.5" />
                      {copy.skip}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {(dashboard?.savedPlans.length ?? 0) > 0 && (
          <div className="mt-6">
            <p className="editorial-kicker mb-3">{copy.previous}</p>
            <div className="space-y-2">
              {dashboard?.savedPlans.map((plan) => (
                <button key={plan.id} onClick={() => activatePlan(plan)} className="flex w-full items-center justify-between rounded-[1.4rem] bg-surface-container-low p-4 text-left">
                  <span>
                    <span className="block font-serif text-[24px] leading-[26px] text-foreground">{plan.shop}</span>
                    <span className="mt-1 block text-xs text-muted">{formatMoney(plan.estimatedTotal)} - {plan.days.length} {copy.planned}</span>
                  </span>
                  <span className="text-xs font-semibold text-primary">{copy.open}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <MealDetailModal />
      <PaywallModal />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.4rem] bg-surface-container-low p-3">
      <p className="font-serif text-2xl leading-none text-foreground">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
    </div>
  );
}
