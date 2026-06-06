"use client";

import React, { useState } from "react";
import { useDinneroStore } from "../hooks/useDinneroStore";
import { X, Crown, Check, Loader2, Sparkles, ShieldCheck } from "lucide-react";

export default function PaywallModal() {
  const { showPaywall, closePaywall, simulateProUpgrade, triggerUpgradeCheckout } = useDinneroStore();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingSim, setLoadingSim] = useState(false);

  if (!showPaywall) return null;

  const handleSimulateUpgrade = async () => {
    setLoadingSim(true);
    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    await simulateProUpgrade();
    setLoadingSim(false);
    closePaywall();
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

  const benefits = [
    "Piani cene settimanali illimitati",
    "Cambi pasto istantanei illimitati (Swaps)",
    "Salva e organizza i tuoi menu preferiti",
    "Esporta la lista della spesa per SMS/WhatsApp",
    "Statistiche e storico del budget spesa",
    "Ottimizzazione per famiglie e calorie personalizzate",
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-[400px] bg-card rounded-[28px] border border-border overflow-hidden shadow-2xl animate-scale-in">
        
        {/* Crown Accent Header */}
        <div className="bg-gradient-to-br from-amber-500 via-primary to-orange-600 px-6 py-8 text-center text-white relative">
          <button
            onClick={closePaywall}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/15 flex items-center justify-center hover:bg-black/25 transition-colors tap-highlight"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Crown className="w-7 h-7 text-yellow-300 fill-yellow-300" />
          </div>
          
          <h3 className="text-2xl font-black tracking-tight">Sblocca Dinnero Pro</h3>
          <p className="text-white/80 text-xs font-medium mt-1">
            Risparmia sulla spesa con la pianificazione intelligente.
          </p>
        </div>

        {/* Benefits Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-muted font-semibold text-center uppercase tracking-widest">
            COSA INCLUDE IL PIANO PRO
          </p>

          <div className="space-y-3">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-foreground/90 font-medium leading-tight">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 text-center">
            <span className="text-3xl font-black text-foreground">€4.99</span>
            <span className="text-muted text-sm font-semibold"> / mese</span>
            <p className="text-[10px] text-muted mt-1">Nessun vincolo, disdici quando vuoi con un click.</p>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
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
                  <span>Attiva Dinnero Pro</span>
                </>
              )}
            </button>

            {/* Sandbox Simulation button for local testing */}
            <button
              onClick={handleSimulateUpgrade}
              disabled={loadingCheckout || loadingSim}
              className="w-full py-3 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 tap-highlight"
            >
              {loadingSim ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span>[Sandbox] Simula Upgrade Pro gratis</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
