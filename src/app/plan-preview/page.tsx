"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Link from "next/link";
import { Check, RefreshCw, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { formatMoney } from "@/modules/meal-planning/domain/value-objects/Money";
import { getProductCopy } from "@/shared/seraProductCopy";
import { getSeraMealImagePosition, getSeraMealImageUrl } from "@/shared/seraVisuals";

export default function PlanPreviewPage() {
  const router = useRouter();
  const { activePlan, appLanguage, regeneratePlan } = useDinneroStore();
  const [isRegenerating, setIsRegenerating] = useState(false);
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

  const acceptPlan = () => {
    localStorage.setItem("sera_preview_accepted_plan_id", activePlan.id);
    router.push("/post-onboarding");
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await regeneratePlan();
    setIsRegenerating(false);
  };

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

      <section className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          {activePlan.days.map((meal) => (
            <article key={meal.id} className="grid grid-cols-[84px_1fr] gap-3 rounded-[1.4rem] bg-card p-3 shadow-sm">
              <div
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
              <div className="min-w-0 py-1">
                <p className="editorial-kicker">{meal.day}</p>
                <h2 className="mt-1 line-clamp-2 font-serif text-[24px] leading-[26px] text-foreground">{meal.title}</h2>
                <p className="mt-2 text-xs text-muted">{meal.prepTimeMinutes} min - {formatMoney(meal.estimatedCost)}</p>
              </div>
            </article>
          ))}
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
    </div>
  );
}
