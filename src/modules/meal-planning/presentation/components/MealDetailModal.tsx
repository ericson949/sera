"use client";

import type { CSSProperties } from "react";
import { Check, Loader2, RefreshCw, X } from "lucide-react";
import { useDinneroStore } from "../hooks/useDinneroStore";
import { useWeeklyMealState } from "../hooks/useWeeklyMealState";
import { formatMoney } from "../../domain/value-objects/Money";
import { SERA_IMAGES } from "@/shared/seraVisuals";
import { getProductCopy } from "@/shared/seraProductCopy";

export default function MealDetailModal() {
  const { selectedMeal, activePlan, userId, selectMeal, swapMeal, isSwapping, appLanguage } = useDinneroStore();
  const weekState = useWeeklyMealState(activePlan, userId);
  const productCopy = getProductCopy(appLanguage);
  const copy = productCopy.meal;

  if (!selectedMeal) return null;
  const canSwap = weekState.canSwapMeal(selectedMeal);

  const handleSwap = async () => {
    if (!canSwap) return;
    await swapMeal(selectedMeal.day);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1E1E1E]/55">
      <button className="absolute inset-0 cursor-default" onClick={() => selectMeal(null)} aria-label={productCopy.common.close} />
      <article className="relative z-10 flex max-h-[92svh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-[2.25rem] bg-background shadow-lg">
        <div className="editorial-photo h-52 shrink-0 px-5 py-4" style={{ "--editorial-image": `url(${SERA_IMAGES.table})` } as CSSProperties}>
          <div className="flex h-full flex-col justify-between text-white">
            <div className="flex justify-end">
              <button onClick={() => selectMeal(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-foreground" aria-label={productCopy.common.close}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">{selectedMeal.day}</p>
              <h2 className="mt-1 font-serif text-[34px] leading-[36px]">{selectedMeal.title}</h2>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 no-scrollbar">
          <p className="text-base leading-7 text-muted">{selectedMeal.description}</p>
          <div className="mt-5 grid grid-cols-3 border-y border-warm-stone/70 py-4 text-center">
            <Metric label={copy.time} value={`${selectedMeal.prepTimeMinutes} min`} />
            <Metric label={copy.energy} value={`${selectedMeal.calories} kcal`} />
            <Metric label={copy.cost} value={formatMoney(selectedMeal.estimatedCost)} />
          </div>

          <section className="mt-6">
            <h3 className="font-serif text-[28px] leading-[30px] text-foreground">{copy.why}</h3>
            <div className="mt-3 space-y-2">
              {selectedMeal.whyThisMeal.map((reason) => (
                <div key={reason} className="flex gap-3 text-sm leading-6 text-muted">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-7">
            <h3 className="font-serif text-[28px] leading-[30px] text-foreground">{copy.ingredients}</h3>
            <div className="mt-3 divide-y divide-warm-stone/50">
              {selectedMeal.ingredients.map((ingredient) => (
                <div key={`${ingredient.name}-${ingredient.quantity}`} className="flex justify-between gap-4 py-3 text-sm">
                  <span className="font-medium text-foreground">{ingredient.name}</span>
                  <span className="text-right text-muted">{ingredient.quantity} - {formatMoney(ingredient.estimatedPrice)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-7 pb-24">
            <h3 className="font-serif text-[28px] leading-[30px] text-foreground">{copy.method}</h3>
            <div className="mt-4 space-y-4">
              {selectedMeal.recipeSteps.map((step, index) => (
                <div key={step} className="grid grid-cols-[2rem_1fr] gap-3">
                  <span className="font-serif text-xl text-primary">{index + 1}</span>
                  <p className="text-sm leading-6 text-muted">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex gap-3 border-t border-warm-stone/60 bg-background/95 px-5 py-4">
          <button onClick={() => selectMeal(null)} className="h-12 flex-1 rounded-full bg-surface-container-low text-sm font-semibold text-foreground">
            {productCopy.common.close}
          </button>
          <button title={!canSwap ? copy.cookedLocked : undefined} onClick={handleSwap} disabled={isSwapping || !canSwap} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white disabled:opacity-60 shadow-md">
            {isSwapping ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {canSwap ? productCopy.common.swap : copy.cookedLocked}
          </button>
        </div>
      </article>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="editorial-kicker">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
