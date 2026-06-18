"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChefHat, Clock3, Shuffle, ShoppingBag } from "lucide-react";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import MealDetailModal from "@/modules/meal-planning/presentation/components/MealDetailModal";
import PaywallModal from "@/modules/meal-planning/presentation/components/PaywallModal";
import { useWeeklyMealState } from "@/modules/meal-planning/presentation/hooks/useWeeklyMealState";
import { formatMoney } from "@/modules/meal-planning/domain/value-objects/Money";
import { getProductCopy } from "@/shared/seraProductCopy";
import { useMealPlanEnrichment } from "@/modules/meal-planning/presentation/hooks/useMealPlanEnrichment";

export default function DashboardPage() {
  useMealPlanEnrichment();
  const router = useRouter();
  const { activePlan, user, userId, selectMeal, openPaywall, appLanguage } = useDinneroStore();
  const copy = getProductCopy(appLanguage).tonight;
  const weekState = useWeeklyMealState(activePlan, userId);
  const meal = weekState.todayMeal;

  useEffect(() => {
    if (!activePlan) return;
    const acceptedPlanId = localStorage.getItem("sera_preview_accepted_plan_id");
    if (acceptedPlanId !== activePlan.id) router.replace("/plan-preview");
  }, [activePlan, router]);

  if (!activePlan || !meal) {
    return (
      <div className="flex h-[calc(100svh-5rem)] flex-col justify-center bg-background px-6 text-center">
        <p className="editorial-kicker">{copy.kicker}</p>
        <h1 className="mt-3 font-serif text-[44px] leading-[46px] text-foreground">{copy.noPlan}</h1>
        <Link href="/new-week" className="mt-8 flex h-14 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-md">
          {copy.startWeek}
        </Link>
      </div>
    );
  }

  const mealState = weekState.getState(meal);
  const status = mealState?.status ?? "planned";
  const quickMeal = weekState.scheduledMeals.filter((item) => item.canSwap).map((item) => item.meal).sort((a, b) => a.prepTimeMinutes - b.prepTimeMinutes)[0];
  const openMeal = (targetMeal: typeof meal) => (user?.subscriptionStatus === "pro" ? selectMeal(targetMeal) : openPaywall());

  return (
    <div className="flex h-[calc(100svh-5rem)] flex-col bg-background">
      <section className="mx-5 mt-5 rounded-[2.25rem] bg-card p-5 shadow-md">
        <p className="editorial-kicker">{copy.kicker}</p>
        <h1 className="mt-3 font-serif text-[36px] leading-[40px] text-foreground">{copy.title}</h1>
        <button onClick={() => openMeal(meal)} className="mt-6 w-full text-left">
          <p className="font-serif text-[26px] leading-[30px] text-primary">{meal.title}</p>
          {mealState && <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{mealState.dateLabel}</p>}
          <p className="mt-3 text-sm leading-6 text-muted">{meal.description}</p>
        </button>
        <div className="mt-5 flex gap-3 text-sm font-semibold text-muted">
          <span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{meal.prepTimeMinutes} min</span>
          <span>{formatMoney(meal.estimatedCost)}</span>
          <span>{status === "cooked" ? copy.cooked : status === "skipped" ? copy.skipped : ""}</span>
        </div>
      </section>

      <section className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5 no-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => openMeal(meal)} className="rounded-[1.6rem] bg-primary p-5 text-left text-white shadow-md">
            <ChefHat className="h-5 w-5" />
            <p className="mt-8 font-serif text-[22px] leading-[26px]">{copy.start}</p>
          </button>
          <Link href="/week" className="rounded-[1.6rem] bg-card p-5 text-left shadow-sm block transition-colors hover:bg-surface-container-low">
            <ArrowRight className="h-5 w-5 text-primary" />
            <p className="mt-8 font-serif text-[22px] leading-[26px] text-foreground">{copy.week}</p>
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={() => quickMeal && openMeal(quickMeal)} className="rounded-[1.6rem] border border-warm-stone/70 p-5 text-left transition-colors hover:bg-card">
            <Shuffle className="h-5 w-5 text-primary" />
            <p className="mt-6 font-serif text-[20px] leading-[24px] text-foreground">{copy.tired}</p>
            <p className="mt-2 text-xs leading-5 text-muted">{copy.backupBody}</p>
          </button>
          <Link href="/shopping-list" className="rounded-[1.6rem] border border-warm-stone/70 p-5 text-left transition-colors hover:bg-card block">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <p className="mt-6 font-serif text-[20px] leading-[24px] text-foreground">{copy.market}</p>
            <p className="mt-2 text-xs leading-5 text-muted">{copy.marketBody}</p>
          </Link>
        </div>
      </section>

      <MealDetailModal />
      <PaywallModal />
    </div>
  );
}
