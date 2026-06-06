"use client";

import { useState } from "react";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { Crown, Check, Loader2, Sparkles, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export default function PricingPage() {
  const { user, simulateProUpgrade, simulateProDowngrade, triggerUpgradeCheckout } = useDinneroStore();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingSim, setLoadingSim] = useState(false);

  const isPro = user?.subscriptionStatus === "pro";

  const handleSimulateUpgrade = async () => {
    setLoadingSim(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    await simulateProUpgrade();
    setLoadingSim(false);
  };

  const handleSimulateDowngrade = async () => {
    setLoadingSim(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    await simulateProDowngrade();
    setLoadingSim(false);
  };

  const handleStripeCheckout = async () => {
    setLoadingCheckout(true);
    const origin = window.location.origin;
    const checkoutUrl = await triggerUpgradeCheckout(origin);
    setLoadingCheckout(false);
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  const proFeatures = [
    "Pianificazioni cene settimanali illimitate (invece di 1)",
    "Cambi pasto istantanei illimitati (invece di 1)",
    "Salvataggio menu e ricette preferite nel database",
    "Esportazione lista spesa ottimizzata (WhatsApp, SMS, PDF)",
    "Grafico dello storico budget per monitorare le spese",
    "Ottimizzazione automatica calorie e porzioni familiari",
    "Riuso avanzato degli ingredienti per zero sprechi"
  ];

  return (
    <div className="flex-1 flex flex-col bg-background p-6 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2 pt-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500 mb-2">
          <Crown className="w-6 h-6 fill-amber-500 text-amber-500" />
        </div>
        <h1 className="text-2xl font-black text-foreground tracking-tight leading-none">
          Piani e Abbonamenti
        </h1>
        <p className="text-xs text-muted max-w-xs mx-auto">
          Scegli la soluzione perfetta per azzerare lo spreco alimentare e risparmiare sulla spesa.
        </p>
      </div>

      {/* Subscription Status Card */}
      <div className={cn(
        "p-5 rounded-3xl border flex gap-4 items-center animate-fade-in shadow-sm",
        isPro
          ? "bg-amber-500/5 border-amber-500/20 text-amber-600"
          : "bg-card border-border/80 text-foreground"
      )}>
        {isPro ? (
          <ShieldCheck className="w-8 h-8 shrink-0 text-amber-500" />
        ) : (
          <ShieldAlert className="w-8 h-8 shrink-0 text-stone-400" />
        )}
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-wider leading-none">
            {isPro ? "Abbonamento Pro Attivo!" : "Profilo Dinnero Free"}
          </h3>
          <p className="text-xs text-muted leading-normal font-medium">
            {isPro
              ? "Hai accesso a tutte le funzionalità premium di Dinnero. Grazie per il supporto!"
              : "Stai utilizzando la versione gratuita con limiti di generazione cene e cambi pasto."}
          </p>
        </div>
      </div>

      {/* Detailed comparison plan cards */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Cost Pricing header */}
        <div className="text-center space-y-1">
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Dinnero Pro</span>
          <div className="flex justify-center items-baseline gap-1">
            <span className="text-4xl font-black text-foreground">€4.99</span>
            <span className="text-muted text-sm font-semibold">/ mese</span>
          </div>
          <p className="text-[10px] text-muted font-medium">Cancella online in qualsiasi momento.</p>
        </div>

        {/* Benefits list */}
        <div className="space-y-3.5 border-t border-border/60 pt-5">
          {proFeatures.map((feat, idx) => (
            <div key={idx} className="flex gap-3 items-start text-xs">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-foreground/90 font-semibold leading-tight">
                {feat}
              </span>
            </div>
          ))}
        </div>

        {/* CTA upgrades */}
        <div className="space-y-2 pt-2">
          {isPro ? (
            <button
              onClick={handleSimulateDowngrade}
              disabled={loadingSim}
              className="w-full py-4 bg-stone-100 hover:bg-stone-200 text-foreground border border-border rounded-2xl font-black text-sm transition-colors flex items-center justify-center gap-1.5 tap-highlight"
            >
              {loadingSim ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Annulla abbonamento Pro (Sandbox)</span>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handleStripeCheckout}
                disabled={loadingCheckout || loadingSim}
                className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-sm transition-colors shadow-md flex items-center justify-center gap-2 tap-highlight"
              >
                {loadingCheckout ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connessione a Stripe...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                    <span>Attiva Pro con Stripe</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSimulateUpgrade}
                disabled={loadingCheckout || loadingSim}
                className="w-full py-3.5 bg-secondary/15 hover:bg-secondary/25 border border-secondary/20 text-secondary rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 tap-highlight"
              >
                {loadingSim ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Simula upgrade Pro immediato (Sandbox)</span>
              </button>
            </>
          )}
        </div>

      </div>

      {/* Disclaimers */}
      <p className="text-[10px] text-muted text-center max-w-[320px] mx-auto leading-relaxed">
        L'abbonamento viene fatturato tramite Stripe per garantire la massima sicurezza nei pagamenti. Puoi gestire e annullare l'iscrizione in autonomia.
      </p>

    </div>
  );
}
