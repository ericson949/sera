"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { formatMoney } from "@/modules/meal-planning/domain/value-objects/Money";
import { formatBudgetRange } from "@/modules/meal-planning/domain/value-objects/BudgetRange";
import { Home, Calendar, Sparkles, Star, ChevronRight, Layers, Heart, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export default function DashboardPage() {
  const router = useRouter();
  const {
    user,
    activePlan,
    dashboard,
    loadDashboard,
    simulateProUpgrade,
    simulateProDowngrade
  } = useDinneroStore();

  useEffect(() => {
    loadDashboard();
  }, [activePlan, user, loadDashboard]);

  const handleToggleSub = async () => {
    if (user?.subscriptionStatus === "pro") {
      await simulateProDowngrade();
    } else {
      await simulateProUpgrade();
    }
  };

  if (!dashboard) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-background">
        <Home className="w-10 h-10 text-muted mb-4 animate-pulse" />
        <p className="text-sm text-muted">Caricamento cruscotto...</p>
      </div>
    );
  }

  const isPro = user?.subscriptionStatus === "pro";

  return (
    <div className="flex-1 flex flex-col bg-background p-6 space-y-6">
      
      {/* Upper header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-1">
            Dinnero Dashboard
          </span>
          <h1 className="text-2xl font-black text-foreground tracking-tight leading-none">
            Ciao, Buongustaio!
          </h1>
          <p className="text-xs text-muted mt-1.5">
            Ecco il riepilogo del tuo menu settimanale.
          </p>
        </div>

        {/* Subscription Badge toggle (clickable for easy testing!) */}
        <button
          onClick={handleToggleSub}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px] font-bold shadow-sm transition-all active:scale-95 tap-highlight",
            isPro
              ? "bg-amber-500/10 border-amber-500/25 text-amber-600"
              : "bg-stone-100 border-border text-stone-500 hover:bg-stone-200"
          )}
        >
          {isPro ? (
            <>
              <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Dinnero Pro</span>
            </>
          ) : (
            <>
              <span>Dinnero Free</span>
            </>
          )}
        </button>
      </div>

      {/* Subscription Sandbox helper */}
      <div className="p-3 bg-stone-50 border border-border/80 rounded-2xl flex items-center justify-between gap-3 text-[11px] font-medium text-stone-500">
        <div className="flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>[Sandbox] Clicca il badge in alto per alternare Free/Pro.</span>
        </div>
      </div>

      {/* Primary Call to Action Card */}
      <div className="bg-gradient-to-br from-primary to-orange-600 rounded-3xl p-5 text-white shadow-md space-y-4">
        <div>
          <h3 className="text-lg font-black tracking-tight leading-tight">Ottieni un nuovo piano cene</h3>
          <p className="text-white/80 text-xs mt-1 leading-normal">
            Imposta preferenze, budget ed ingredienti in frigo per compilare un menu cene inedito.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 py-3 px-5 bg-white text-primary rounded-xl text-xs font-black shadow hover:bg-stone-50 transition-colors tap-highlight w-max"
        >
          <span>Pianifica nuova settimana</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Section: Current Plan Summary */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted px-1 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-stone-400" /> Menu in corso
        </h3>

        {dashboard.currentPlan ? (
          <Link
            href="/results"
            className="block w-full bg-card border border-border/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 tap-highlight"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded-full mb-1">
                  Menu attivo
                </span>
                <h4 className="text-sm font-black text-foreground">
                  Piano cene {dashboard.currentPlan.shop}
                </h4>
                <p className="text-xs text-muted">
                  Budget: {formatBudgetRange(dashboard.currentPlan.budget)} • Totale stimato: <span className="font-bold text-secondary">{formatMoney(dashboard.currentPlan.estimatedTotal)}</span>
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400" />
            </div>
          </Link>
        ) : (
          <div className="border border-dashed border-border p-5 rounded-2xl text-center text-xs text-muted">
            Non hai ancora generato alcun piano pasti.
          </div>
        )}
      </div>

      {/* Section: Budget History trend (Visual CSS Graph) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted px-1 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-stone-400" /> Storico Spesa Cene
        </h3>
        
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-3.5">
          {dashboard.budgetHistory.length > 0 ? (
            <div className="space-y-3">
              {dashboard.budgetHistory.slice(0, 3).map((item, idx) => {
                const percent = Math.min(100, Math.round((item.estimatedTotal / item.budgetMax) * 100));
                const overBudget = item.estimatedTotal > item.budgetMax;
                
                return (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-stone-500">Menu #{idx + 1} ({new Date(item.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" })})</span>
                      <span className="font-bold">
                        {formatMoney({ amount: item.estimatedTotal, currency: "EUR" })}
                        <span className="text-stone-300 font-light mx-1">/</span>
                        <span className="text-stone-400">€{item.budgetMax}</span>
                      </span>
                    </div>
                    {/* Progress Bar visual indicator */}
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden relative">
                      <div
                        className={cn("h-full rounded-full transition-all duration-300", overBudget ? "bg-primary" : "bg-secondary")}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted text-center py-2">Genera menu per compilare lo storico spesa.</p>
          )}
        </div>
      </div>

      {/* Section: Favorite meals */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted px-1 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-stone-400" /> Cene preferite
        </h3>

        {dashboard.favoriteMeals.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {dashboard.favoriteMeals.slice(0, 4).map((meal, idx) => (
              <div
                key={idx}
                className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-24"
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 mb-2" />
                <span className="text-xs font-bold text-foreground line-clamp-2 leading-tight">
                  {meal.title}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border p-5 rounded-2xl text-center text-xs text-muted">
            I tuoi piatti preferiti compariranno qui quando salverai un menu.
          </div>
        )}
      </div>

      {/* Section: Saved meal plans */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted px-1 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-stone-400" /> Menu salvati ({dashboard.savedPlans.length})
        </h3>

        {dashboard.savedPlans.length > 0 ? (
          <div className="space-y-3.5">
            {dashboard.savedPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex justify-between items-center"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-foreground">
                    Menu {plan.shop} del {new Date(plan.createdAt).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                  </h4>
                  <p className="text-[10px] text-muted font-bold">
                    Costo stimato: <span className="text-secondary">{formatMoney(plan.estimatedTotal)}</span> • Persone: {plan.peopleCount}
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Set as active plan by triggering store load
                    useDinneroStore.setState({ activePlan: plan });
                    router.push("/results");
                  }}
                  className="py-1.5 px-3 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 rounded-xl font-bold text-[10px] transition-colors tap-highlight"
                >
                  Carica
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border p-5 rounded-2xl text-center text-xs text-muted">
            Nessun menu salvato nello storico.
          </div>
        )}
      </div>

    </div>
  );
}
