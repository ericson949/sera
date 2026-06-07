"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, GripVertical, Plus, ShoppingBag, X } from "lucide-react";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import MealDetailModal from "@/modules/meal-planning/presentation/components/MealDetailModal";
import { useMealExecutions } from "@/modules/meal-planning/presentation/hooks/useMealExecutions";
import { formatMoney } from "@/modules/meal-planning/domain/value-objects/Money";
import { getProductCopy } from "@/shared/seraProductCopy";

export default function WeekPage() {
  const [draggedMealId, setDraggedMealId] = useState<string | null>(null);
  const { activePlan, dashboard, userId, selectMeal, swapPlannedMeals, activatePlan, appLanguage } = useDinneroStore();
  const copy = getProductCopy(appLanguage).weekView;
  const executions = useMealExecutions(activePlan?.id, userId);

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
          <Stat value={`${executions.cookedCount}/${activePlan.days.length}`} label={copy.cooked} />
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
        <p className="mb-3 text-center text-xs font-semibold text-muted">{copy.dragHint}</p>
        <div className="space-y-3">
          {activePlan.days.map((meal) => {
            const status = executions.getMealStatus(meal.id);
            return (
              <article
                key={meal.id}
                draggable
                onDragStart={() => setDraggedMealId(meal.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedMealId) void swapPlannedMeals(draggedMealId, meal.id);
                  setDraggedMealId(null);
                }}
                onDragEnd={() => setDraggedMealId(null)}
                className={`rounded-[1.6rem] bg-card p-4 shadow-sm transition ${draggedMealId === meal.id ? "opacity-55" : ""}`}
              >
                <button onClick={() => selectMeal(meal)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-3">
                    <span>
                      <p className="editorial-kicker">{meal.day}</p>
                      <h2 className="mt-1 font-serif text-[28px] leading-[30px] text-foreground">{meal.title}</h2>
                    </span>
                    <GripVertical className="mt-1 h-5 w-5 shrink-0 text-muted" />
                  </div>
                  <p className="mt-2 text-xs text-muted">{meal.prepTimeMinutes} min - {formatMoney(meal.estimatedCost)} - {status === "cooked" ? copy.cooked : status === "skipped" ? copy.skipped : copy.planned}</p>
                </button>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => executions.setMealStatus(meal, "cooked")} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-xs font-semibold text-white">
                    <Check className="h-3.5 w-3.5" />
                    {copy.done}
                  </button>
                  <button onClick={() => executions.setMealStatus(meal, "skipped")} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-surface-container-low text-xs font-semibold text-foreground">
                    <X className="h-3.5 w-3.5" />
                    {copy.skip}
                  </button>
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
