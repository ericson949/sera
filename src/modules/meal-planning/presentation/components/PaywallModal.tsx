"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { Check, Crown, Loader2, X } from "lucide-react";
import { useDinneroStore } from "../hooks/useDinneroStore";
import { getProductCopy } from "@/shared/seraProductCopy";
import { isStagingEnv } from "@/shared/env";
import { SERA_IMAGES } from "@/shared/seraVisuals";

export default function PaywallModal() {
  const { showPaywall, closePaywall, simulateProUpgrade, triggerUpgradeCheckout, appLanguage } = useDinneroStore();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingSim, setLoadingSim] = useState(false);
  const productCopy = getProductCopy(appLanguage);
  const copy = productCopy.paywall;
  const isStaging = isStagingEnv();

  if (!showPaywall) return null;

  const handleSimulateUpgrade = async () => {
    setLoadingSim(true);
    await simulateProUpgrade();
    setLoadingSim(false);
    closePaywall();
  };

  const handleCheckout = async () => {
    if (isStaging) {
      await handleSimulateUpgrade();
      return;
    }

    setLoadingCheckout(true);
    const checkoutUrl = await triggerUpgradeCheckout(window.location.origin);
    setLoadingCheckout(false);
    if (checkoutUrl) window.location.href = checkoutUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1E1E1E]/65 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
      <article className="ph-no-capture relative max-h-[calc(100svh-2rem)] w-full max-w-[440px] overflow-hidden rounded-[2rem] bg-background shadow-2xl">
        <button onClick={closePaywall} className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm" aria-label={productCopy.common.close}>
          <X className="h-4 w-4" />
        </button>

        <div className="editorial-photo relative h-40" style={{ "--editorial-image": `url(${SERA_IMAGES.table})` } as CSSProperties}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/65" />
          <div className="relative flex h-full flex-col justify-end p-5 text-white">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm">
              <Crown className="h-4 w-4" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">{copy.kicker}</p>
            <h2 className="mt-1 max-w-[310px] font-serif text-[34px] leading-[35px]">{copy.title}</h2>
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm leading-6 text-muted">{copy.body}</p>

          <div className="my-5 flex items-end justify-between border-y border-warm-stone/60 py-4">
            <div>
              <p className="editorial-kicker">{productCopy.pricing.monthly}</p>
              <span className="font-serif text-[42px] leading-none text-foreground">EUR 4.99</span>
              <span className="ml-1 text-sm text-muted">{copy.perMonth}</span>
            </div>
            <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-primary">{productCopy.pricing.pro}</span>
          </div>

          <div className="grid gap-2">
            {copy.benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 rounded-[1.1rem] bg-surface-container-low px-3 py-2.5 text-sm leading-5 text-muted">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-3 w-3" />
                </span>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            <button onClick={handleCheckout} disabled={loadingCheckout || loadingSim} className="flex h-14 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-md disabled:opacity-60">
            {loadingCheckout ? <Loader2 className="h-4 w-4 animate-spin" /> : productCopy.common.continue}
          </button>
          {isStaging && (
            <button onClick={handleSimulateUpgrade} disabled={loadingCheckout || loadingSim} className="flex h-12 w-full items-center justify-center rounded-full bg-surface-container-low text-xs font-semibold text-foreground disabled:opacity-60">
              {loadingSim ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.unlock}
            </button>
          )}
          </div>
        </div>
      </article>
    </div>
  );
}
