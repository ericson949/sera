"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Link from "next/link";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import MealCard from "@/modules/meal-planning/presentation/components/MealCard";
import MealDetailModal from "@/modules/meal-planning/presentation/components/MealDetailModal";
import PaywallModal from "@/modules/meal-planning/presentation/components/PaywallModal";
import { formatBudgetRange } from "@/modules/meal-planning/domain/value-objects/BudgetRange";
import { formatMoney } from "@/modules/meal-planning/domain/value-objects/Money";
import { SERA_IMAGES } from "@/shared/seraVisuals";
import { ArrowRight, Bookmark, BookmarkCheck, Loader2, RefreshCw, ShoppingBag } from "lucide-react";

export default function ResultsPage() {
  const { activePlan, isGenerating, saveCurrentPlan, regeneratePlan, selectMeal } = useDinneroStore();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  if (!activePlan && !isGenerating) {
    return (
      <div className="flex min-h-[calc(100svh-5rem)] flex-col justify-center bg-background px-6 text-center">
        <p className="editorial-kicker">Sera Journal</p>
        <h1 className="mt-3 font-serif text-[40px] leading-[43px] text-foreground">Your table is still empty.</h1>
        <p className="mx-auto mt-4 max-w-[300px] text-sm leading-6 text-muted">
          Begin with your tastes and budget. Sera will compose the week.
        </p>
        <Link
          href="/onboarding"
          className="mt-7 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-md"
        >
          Start planning
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center bg-background px-6 text-center">
        <div className="h-16 w-16 rounded-full border border-warm-stone border-t-primary animate-spin" />
        <h1 className="mt-6 font-serif text-[36px] leading-[39px] text-foreground">Composing your week.</h1>
        <p className="mt-3 text-sm leading-6 text-muted">A calmer menu is being assembled.</p>
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

  const handleRegenerate = async () => {
    await regeneratePlan();
  };

  return (
    <div className="flex h-[calc(100svh-5rem)] flex-col bg-background">
      <header className="shrink-0 px-5 pb-4 pt-5">
        <div
          className="editorial-photo relative h-36 overflow-hidden rounded-[2rem] px-5 py-4 shadow-md"
          style={{ "--editorial-image": `url(${SERA_IMAGES.table})` } as CSSProperties}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/55" />
          <div className="relative flex h-full flex-col justify-between text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Sera weekly journal</p>
            <div>
              <h1 className="font-serif text-[34px] leading-[35px]">Dinner, curated.</h1>
              <p className="mt-1 text-xs text-white/85">
                {plan.peopleCount} {plan.peopleCount === 1 ? "guest" : "guests"} · {plan.shop}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[1.2fr_0.8fr] gap-3">
          <div className="rounded-[1.5rem] bg-surface-container-low p-4">
            <p className="editorial-kicker">Estimated market</p>
            <p className="mt-1 font-serif text-3xl leading-none text-foreground">{formatMoney(plan.estimatedTotal)}</p>
            <p className="mt-2 text-xs text-muted">{formatBudgetRange(plan.budget)}</p>
          </div>
          <div className="rounded-[1.5rem] bg-secondary p-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">Budget</p>
            <p className="mt-2 text-sm font-semibold">{withinBudget ? "In range" : "Watch list"}</p>
            <p className="mt-1 text-2xl font-semibold">{plan.budgetConfidence}%</p>
          </div>
        </div>
      </header>

      <div className="flex shrink-0 gap-2 px-5 pb-4">
        <Link
          href="/shopping-list"
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background"
        >
          <ShoppingBag className="h-4 w-4" />
          Market list
        </Link>
        <button
          onClick={handleRegenerate}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-sm"
          aria-label="Regenerate menu"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <button
          disabled={loadingSave}
          onClick={handleSavePlan}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-sm disabled:opacity-60"
          aria-label="Save plan"
        >
          {loadingSave ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : plan.saved || savedSuccess ? (
            <BookmarkCheck className="h-4 w-4 text-secondary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </button>
      </div>

      <section className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        <p className="editorial-kicker mb-5">Seven evenings</p>
        <div className="space-y-8">
          {plan.days.map((meal) => (
            <MealCard key={meal.id} meal={meal} onClick={() => selectMeal(meal)} />
          ))}
        </div>
      </section>

      <MealDetailModal />
      <PaywallModal />
    </div>
  );
}
