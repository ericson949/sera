"use client";

import Link from "next/link";
import { ArrowRight, Check, ShoppingBag } from "lucide-react";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { formatMoney } from "@/modules/meal-planning/domain/value-objects/Money";
import { getProductCopy } from "@/shared/seraProductCopy";

export default function PlanPreviewPage() {
  const { activePlan, appLanguage } = useDinneroStore();
  const copy = getProductCopy(appLanguage).results;

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

  return (
    <div className="flex h-svh flex-col bg-background p-5">
      <header className="shrink-0 pb-4 pt-2">
        <p className="editorial-kicker">{copy.journal}</p>
        <h1 className="mt-2 font-serif text-[44px] leading-[45px] text-foreground">{copy.title}</h1>
        <div className="mt-4 rounded-[1.6rem] bg-primary p-5 text-white shadow-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">{copy.estimated}</p>
          <p className="mt-2 font-serif text-4xl leading-none">{formatMoney(activePlan.estimatedTotal)}</p>
        </div>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          {activePlan.days.map((meal) => (
            <article key={meal.id} className="rounded-[1.4rem] bg-card p-4 shadow-sm">
              <p className="editorial-kicker">{meal.day}</p>
              <h2 className="mt-1 font-serif text-[25px] leading-[27px] text-foreground">{meal.title}</h2>
              <p className="mt-2 text-xs text-muted">{meal.prepTimeMinutes} min - {formatMoney(meal.estimatedCost)}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
        <Link href="/post-onboarding" className="flex h-14 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white shadow-md">
          <Check className="h-4 w-4" />
          {copy.save}
        </Link>
        <Link href="/shopping-list" className="flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-sm" aria-label={copy.marketList}>
          <ShoppingBag className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
