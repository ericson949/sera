"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { useDinneroStore } from "../hooks/useDinneroStore";
import { getProductCopy } from "@/shared/seraProductCopy";
import { isStagingEnv } from "@/shared/env";

export default function PaywallModal() {
  const { showPaywall, closePaywall, simulateProUpgrade, triggerUpgradeCheckout, appLanguage } = useDinneroStore();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingSim, setLoadingSim] = useState(false);
  const productCopy = getProductCopy(appLanguage);
  const copy = productCopy.paywall;

  if (!showPaywall) return null;

  const handleSimulateUpgrade = async () => {
    setLoadingSim(true);
    await simulateProUpgrade();
    setLoadingSim(false);
    closePaywall();
  };

  const handleStripeCheckout = async () => {
    if (isStagingEnv()) {
      await handleSimulateUpgrade();
      return;
    }

    setLoadingCheckout(true);
    const checkoutUrl = await triggerUpgradeCheckout(window.location.origin);
    setLoadingCheckout(false);
    if (checkoutUrl) window.location.href = checkoutUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1E1E1E]/60 px-4 pb-4">
      <article className="ph-no-capture relative w-full max-w-[440px] rounded-[2.25rem] bg-background p-6 shadow-lg">
        <button onClick={closePaywall} className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low" aria-label={productCopy.common.close}>
          <X className="h-4 w-4" />
        </button>
        <p className="editorial-kicker">{copy.kicker}</p>
        <h2 className="mt-3 max-w-[280px] font-serif text-[38px] leading-[40px] text-foreground">{copy.title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{copy.body}</p>
        <div className="my-6 border-y border-warm-stone/60 py-4">
          <span className="font-serif text-4xl text-foreground">EUR 4.99</span>
          <span className="ml-1 text-sm text-muted">{copy.perMonth}</span>
        </div>
        <div className="space-y-3">
          {copy.benefits.map((benefit) => (
            <div key={benefit} className="flex gap-3 text-sm leading-6 text-muted">
              <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
        <div className="mt-7 space-y-2">
          <button onClick={handleStripeCheckout} disabled={loadingCheckout || loadingSim} className="flex h-14 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-md disabled:opacity-60">
            {loadingCheckout ? <Loader2 className="h-4 w-4 animate-spin" /> : productCopy.common.continue}
          </button>
          <button onClick={handleSimulateUpgrade} disabled={loadingCheckout || loadingSim} className="flex h-12 w-full items-center justify-center rounded-full bg-surface-container-low text-xs font-semibold text-foreground disabled:opacity-60">
            {loadingSim ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.unlock}
          </button>
        </div>
      </article>
    </div>
  );
}
