"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { formatMoney } from "@/modules/meal-planning/domain/value-objects/Money";
import { SERA_IMAGES } from "@/shared/seraVisuals";
import SeraNotificationCard from "@/shared/presentation/components/SeraNotificationCard";
import { ArrowRight, Calendar, Crown, ShoppingBag } from "lucide-react";

export default function DashboardPage() {
  const { user, activePlan, dashboard, simulateProUpgrade, simulateProDowngrade } = useDinneroStore();
  const isPro = user?.subscriptionStatus === "pro";
  const savedCount = dashboard?.savedPlans.length ?? 0;

  const handleToggleSub = async () => {
    if (isPro) {
      await simulateProDowngrade();
      return;
    }

    await simulateProUpgrade();
  };

  return (
    <div className="flex h-[calc(100svh-5rem)] flex-col bg-background">
      <section
        className="editorial-photo mx-5 mt-5 flex h-[42svh] min-h-[300px] shrink-0 flex-col justify-between rounded-[2.25rem] p-5 shadow-md"
        style={{ "--editorial-image": `url(${SERA_IMAGES.table})` } as CSSProperties}
      >
        <div className="flex justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white">Sera</p>
          <button
            onClick={handleToggleSub}
            className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-foreground"
          >
            <Crown className="h-3.5 w-3.5 stroke-[1.6]" />
            {isPro ? "Pro" : "Free"}
          </button>
        </div>

        <div className="text-white">
          <p className="text-xs uppercase tracking-[0.18em] text-white/80">Italian dinner journal</p>
          <h1 className="mt-2 font-serif text-[44px] leading-[45px] tracking-tight">
            A quieter way to plan the week.
          </h1>
        </div>
      </section>

      <section className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5 no-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/onboarding" className="rounded-[1.6rem] bg-primary p-5 text-white shadow-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">Compose</p>
            <h2 className="mt-8 font-serif text-[28px] leading-[30px]">New week</h2>
            <ArrowRight className="mt-4 h-5 w-5 stroke-[1.5]" />
          </Link>

          <Link href="/results" className="rounded-[1.6rem] bg-card p-5 shadow-sm">
            <Calendar className="h-5 w-5 stroke-[1.5] text-secondary" />
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Current journal</p>
            <h2 className="mt-1 font-serif text-[26px] leading-[28px] text-foreground">
              {activePlan ? activePlan.shop : "No plan"}
            </h2>
          </Link>
        </div>

        <div className="mt-5 rounded-[1.8rem] bg-surface-container-low p-5">
          <p className="editorial-kicker">This week</p>
          {activePlan ? (
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="font-serif text-2xl text-foreground">{activePlan.days.length}</p>
                <p className="mt-1 text-[11px] text-muted">dinners</p>
              </div>
              <div>
                <p className="font-serif text-2xl text-foreground">{formatMoney(activePlan.estimatedTotal)}</p>
                <p className="mt-1 text-[11px] text-muted">market</p>
              </div>
              <div>
                <p className="font-serif text-2xl text-foreground">{savedCount}</p>
                <p className="mt-1 text-[11px] text-muted">saved</p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted">
              Start with a few preferences. Sera will turn them into a full dinner week.
            </p>
          )}
        </div>

        <Link
          href="/shopping-list"
          className="mt-4 flex items-center justify-between rounded-[1.8rem] border border-warm-stone/70 p-5"
        >
          <span>
            <span className="editorial-kicker">Market</span>
            <span className="mt-1 block font-serif text-[28px] leading-[30px] text-foreground">Shopping guide</span>
          </span>
          <ShoppingBag className="h-5 w-5 stroke-[1.5] text-secondary" />
        </Link>

        <SeraNotificationCard />
      </section>
    </div>
  );
}
