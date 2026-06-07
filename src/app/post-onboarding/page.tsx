"use client";

import Link from "next/link";
import { Check, Crown, X } from "lucide-react";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import SeraNotificationCard from "@/shared/presentation/components/SeraNotificationCard";
import { getProductCopy } from "@/shared/seraProductCopy";

export default function PostOnboardingPage() {
  const { appLanguage, simulateProUpgrade } = useDinneroStore();
  const productCopy = getProductCopy(appLanguage);
  const copy = productCopy.paywall;

  return (
    <div className="flex h-svh flex-col bg-background p-5">
      <section className="rounded-[2rem] bg-card p-6 shadow-md">
        <p className="editorial-kicker">{copy.kicker}</p>
        <h1 className="mt-3 font-serif text-[42px] leading-[43px] text-foreground">{copy.title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{copy.body}</p>
        <div className="mt-5 space-y-3">
          {copy.benefits.map((benefit) => (
            <div key={benefit} className="flex gap-3 text-sm leading-6 text-muted">
              <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
        <button onClick={simulateProUpgrade} className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white shadow-md">
          <Crown className="h-4 w-4" />
          {copy.unlock}
        </button>
        <Link href="/week" className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-surface-container-low text-sm font-semibold text-foreground">
          <X className="h-4 w-4" />
          {productCopy.common.close}
        </Link>
      </section>

      <div className="mt-4">
        <SeraNotificationCard />
      </div>

      <Link href="/week" className="mt-auto flex h-14 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-md">
        {productCopy.common.continue}
      </Link>
    </div>
  );
}
