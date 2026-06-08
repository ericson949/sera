"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Crown, Loader2 } from "lucide-react";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { getProductCopy } from "@/shared/seraProductCopy";

export default function PostOnboardingPage() {
  const { appLanguage, triggerUpgradeCheckout } = useDinneroStore();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  
  const productCopy = getProductCopy(appLanguage);
  const copy = productCopy.paywall;

  const handleUpgrade = async () => {
    setLoadingCheckout(true);
    const checkoutUrl = await triggerUpgradeCheckout(window.location.origin);
    setLoadingCheckout(false);
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  return (
    <div className="flex h-svh flex-col bg-background p-5">
      <section className="rounded-[2rem] bg-card p-6 shadow-md">
        <p className="editorial-kicker">{copy.kicker}</p>
        <h1 className="mt-3 font-serif text-[32px] leading-[43px] text-foreground">{copy.title}</h1>
        
        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="font-serif text-[40px] font-semibold leading-none text-foreground">EUR 4.99</span>
          <span className="text-sm text-muted">{copy.perMonth}</span>
        </div>

        <p className="mt-4 text-sm leading-6 text-muted">{copy.body}</p>
        <div className="mt-5 space-y-3">
          {copy.benefits.map((benefit) => (
            <div key={benefit} className="flex gap-3 text-sm leading-6 text-muted">
              <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
        <button 
          onClick={handleUpgrade} 
          disabled={loadingCheckout} 
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white shadow-md disabled:opacity-60"
        >
          {loadingCheckout ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Crown className="h-4 w-4" />
              {copy.subscribe}
            </>
          )}
        </button>
        <Link href="/week" className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-surface-container-low text-sm font-semibold text-foreground hover:bg-surface-container-medium transition-colors">
          {copy.trial}
        </Link>
      </section>
    </div>
  );
}
