"use client";

import { useState } from "react";
import { useDinneroStore } from "../hooks/useDinneroStore";
import { Check, Loader2, X } from "lucide-react";

export default function PaywallModal() {
  const { showPaywall, closePaywall, simulateProUpgrade, triggerUpgradeCheckout } = useDinneroStore();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingSim, setLoadingSim] = useState(false);

  if (!showPaywall) return null;

  const handleSimulateUpgrade = async () => {
    setLoadingSim(true);
    await simulateProUpgrade();
    setLoadingSim(false);
    closePaywall();
  };

  const handleStripeCheckout = async () => {
    setLoadingCheckout(true);
    const checkoutUrl = await triggerUpgradeCheckout(window.location.origin);
    setLoadingCheckout(false);
    if (checkoutUrl) window.location.href = checkoutUrl;
  };

  const benefits = [
    "Unlimited weekly dinner journals",
    "Unlimited refined meal swaps",
    "Saved menus for future Sundays",
    "Exportable market lists",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1E1E1E]/60 px-4 pb-4">
      <article className="relative w-full max-w-[440px] rounded-[2.25rem] bg-background p-6 shadow-lg">
        <button
          onClick={closePaywall}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="editorial-kicker">Sera membership</p>
        <h2 className="mt-3 max-w-[280px] font-serif text-[38px] leading-[40px] text-foreground">
          Keep the week beautifully planned.
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Designed for households that want a calmer table, a clearer market list, and fewer last-minute decisions.
        </p>

        <div className="my-6 border-y border-warm-stone/60 py-4">
          <span className="font-serif text-4xl text-foreground">€4.99</span>
          <span className="ml-1 text-sm text-muted">/ month</span>
        </div>

        <div className="space-y-3">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex gap-3 text-sm leading-6 text-muted">
              <Check className="mt-1 h-4 w-4 shrink-0 text-secondary" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        <div className="mt-7 space-y-2">
          <button
            onClick={handleStripeCheckout}
            disabled={loadingCheckout || loadingSim}
            className="flex h-14 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-md disabled:opacity-60"
          >
            {loadingCheckout ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue with Sera"}
          </button>
          <button
            onClick={handleSimulateUpgrade}
            disabled={loadingCheckout || loadingSim}
            className="flex h-12 w-full items-center justify-center rounded-full bg-surface-container-low text-xs font-semibold text-foreground disabled:opacity-60"
          >
            {loadingSim ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sandbox: unlock membership"}
          </button>
        </div>
      </article>
    </div>
  );
}
