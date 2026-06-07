"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { SERA_IMAGES } from "@/shared/seraVisuals";
import { getProductCopy } from "@/shared/seraProductCopy";
import { isStagingEnv } from "@/shared/env";

export default function PricingPage() {
  const { user, simulateProUpgrade, simulateProDowngrade, triggerUpgradeCheckout, appLanguage } = useDinneroStore();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingSim, setLoadingSim] = useState(false);
  const copy = getProductCopy(appLanguage).pricing;
  const isMember = user?.subscriptionStatus === "pro";

  const handleStripeCheckout = async () => {
    if (isStagingEnv()) {
      await handleSandboxToggle();
      return;
    }

    setLoadingCheckout(true);
    const checkoutUrl = await triggerUpgradeCheckout(window.location.origin);
    setLoadingCheckout(false);
    if (checkoutUrl) window.location.href = checkoutUrl;
  };

  const handleSandboxToggle = async () => {
    setLoadingSim(true);
    if (isMember) await simulateProDowngrade();
    else await simulateProUpgrade();
    setLoadingSim(false);
  };

  return (
    <div className="flex h-[calc(100svh-5rem)] flex-col bg-background">
      <section className="editorial-photo mx-5 mt-5 flex h-52 shrink-0 flex-col justify-end rounded-[2.25rem] p-5 shadow-md" style={{ "--editorial-image": `url(${SERA_IMAGES.table})` } as CSSProperties}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85">{copy.kicker}</p>
        <h1 className="mt-2 font-serif text-[42px] leading-[43px] tracking-tight text-white">{copy.title}</h1>
      </section>

      <section className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5 no-scrollbar">
        <div className="ph-no-capture rounded-[2rem] bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="editorial-kicker">{isMember ? copy.active : copy.monthly}</p>
              <p className="mt-2 font-serif text-5xl leading-none text-foreground">EUR 4.99</p>
              <p className="mt-2 text-sm text-muted">{copy.cancel}</p>
            </div>
            <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white">{isMember ? copy.member : copy.pro}</span>
          </div>

          <div className="mt-6 space-y-3 border-t border-warm-stone/60 pt-5">
            {copy.features.map((feature) => (
              <div key={feature} className="flex gap-3 text-sm leading-6 text-muted">
                <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 space-y-2">
            {isMember ? (
              <button onClick={handleSandboxToggle} disabled={loadingSim} className="flex h-14 w-full items-center justify-center rounded-full bg-surface-container-low text-sm font-semibold text-foreground disabled:opacity-60">
                {loadingSim ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.pause}
              </button>
            ) : (
              <>
                <button onClick={handleStripeCheckout} disabled={loadingCheckout || loadingSim} className="flex h-14 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-md disabled:opacity-60">
                  {loadingCheckout ? <Loader2 className="h-4 w-4 animate-spin" /> : getProductCopy(appLanguage).common.continue}
                </button>
                <button onClick={handleSandboxToggle} disabled={loadingCheckout || loadingSim} className="flex h-12 w-full items-center justify-center rounded-full bg-surface-container-low text-xs font-semibold text-foreground disabled:opacity-60">
                  {loadingSim ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.unlock}
                </button>
              </>
            )}
          </div>
        </div>

        <p className="mx-auto mt-4 max-w-[320px] text-center text-xs leading-5 text-muted">{copy.stripe}</p>
        <Link href="/legal" className="mt-2 block text-center text-xs font-semibold text-primary underline underline-offset-4">
          {copy.links}
        </Link>
      </section>
    </div>
  );
}
