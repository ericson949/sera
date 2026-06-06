"use client";

import { useState } from "react";
import Link from "next/link";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import MealCard from "@/modules/meal-planning/presentation/components/MealCard";
import MealDetailModal from "@/modules/meal-planning/presentation/components/MealDetailModal";
import PaywallModal from "@/modules/meal-planning/presentation/components/PaywallModal";
import { formatBudgetRange } from "@/modules/meal-planning/domain/value-objects/BudgetRange";
import { formatMoney } from "@/modules/meal-planning/domain/value-objects/Money";
import { Calendar, Check, AlertCircle, ShoppingBag, RefreshCw, Bookmark, BookmarkCheck, ArrowRight, Loader2 } from "lucide-react";

export default function ResultsPage() {
  const {
    activePlan,
    isGenerating,
    saveCurrentPlan,
    regeneratePlan,
    selectMeal
  } = useDinneroStore();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  // Fallback if no active plan is generated yet
  if (!activePlan && !isGenerating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-background">
        <Calendar className="w-12 h-12 text-muted mb-4" />
        <h2 className="text-xl font-bold">Nessun piano cene attivo</h2>
        <p className="text-sm text-muted mt-2 mb-6">
          Completa l'onboarding in 60 secondi per generare il tuo piano pasti personalizzato.
        </p>
        <Link
          href="/onboarding"
          className="py-3 px-6 bg-primary text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 hover:bg-primary-hover transition-colors tap-highlight"
        >
          <span>Pianifica cene</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Loader if regenerating from result buttons
  if (isGenerating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-background">
        <div className="relative w-20 h-20 flex items-center justify-center mb-6">
          <div className="absolute w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Calendar className="w-6 h-6 text-primary animate-pulse" />
        </div>
        <h2 className="text-xl font-extrabold">Aggiorno il menu...</h2>
        <p className="text-sm text-muted mt-2">
          Ricalcolo i prezzi e assemblo le nuove ricette.
        </p>
      </div>
    );
  }

  const plan = activePlan!;
  const withinBudget = plan.estimatedTotal.amount <= plan.budget.max;

  const handleSavePlan = async () => {
    setLoadingSave(true);
    try {
      await saveCurrentPlan();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // Handled by paywall trigger or store error
    } finally {
      setLoadingSave(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      await regeneratePlan();
    } catch {
      // Handled by store error
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background p-6 space-y-6">
      
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-1">
          Menu AI Dinnero
        </span>
        <h1 className="text-2xl font-black text-foreground tracking-tight leading-none">
          Cene della Settimana
        </h1>
        <p className="text-xs text-muted mt-1.5">
          Creato per {plan.peopleCount} {plan.peopleCount === 1 ? "persona" : "persone"} con spesa da <span className="font-bold text-foreground">{plan.shop}</span>.
        </p>
      </div>

      {/* Compliance banner */}
      <div className={`p-4 rounded-2xl border flex gap-3 items-start animate-fade-in ${
        withinBudget
          ? "bg-secondary/5 border-secondary/20 text-secondary"
          : "bg-amber-500/5 border-amber-500/20 text-amber-600"
      }`}>
        {withinBudget ? (
          <Check className="w-5 h-5 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider leading-none">
            {withinBudget ? "Budget Rispettato!" : "Budget Superato"}
          </h4>
          <p className="text-xs text-foreground/80 leading-normal">
            {withinBudget
              ? "Ottimo! Il costo stimato delle cene è inferiore al tuo budget massimo."
              : "Il costo del piano potrebbe superare leggermente il budget massimo prefissato."}
          </p>
        </div>
      </div>

      {/* Budget Summary Cards Grid */}
      <div className="grid grid-cols-2 gap-3.5 select-none">
        
        {/* Card: Total Cost */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Costo Totale Stimato</span>
          <span className="text-3xl font-black text-foreground">{formatMoney(plan.estimatedTotal)}</span>
          <span className="text-[10px] text-muted font-medium">Intervallo: {formatMoney(plan.estimatedMin)}–{formatMoney(plan.estimatedMax)}</span>
          {/* Subtle decoration background icon */}
          <div className="absolute right-[-10px] bottom-[-10px] text-stone-100/30 opacity-15">
            <span className="text-7xl font-bold">€</span>
          </div>
        </div>

        {/* Card: Confidence & Limits */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-28">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Affidabilità Budget</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-secondary">{plan.budgetConfidence}%</span>
          </div>
          <span className="text-[10px] text-muted font-medium leading-tight line-clamp-2">
            Target: {formatBudgetRange(plan.budget)}
          </span>
        </div>

      </div>

      {/* WeekDays Menu Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted px-1">
          Pasti dal lunedì alla domenica
        </h3>
        
        <div className="space-y-3">
          {plan.days.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onClick={() => selectMeal(meal)}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons sticky panel */}
      <div className="space-y-2.5 pt-4">
        
        {/* View shopping list */}
        <Link
          href="/shopping-list"
          className="w-full py-4 bg-foreground hover:bg-zinc-800 text-background rounded-2xl font-extrabold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 tap-highlight"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Vedi la lista della spesa</span>
        </Link>

        {/* Save and Regenerate row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Regenerate */}
          <button
            onClick={handleRegenerate}
            className="py-3.5 bg-card border border-border/80 hover:bg-stone-50 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 tap-highlight text-foreground"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rigenera menu</span>
          </button>

          {/* Save plan */}
          <button
            disabled={loadingSave}
            onClick={handleSavePlan}
            className={`py-3.5 border rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 tap-highlight ${
              plan.saved || savedSuccess
                ? "bg-secondary/10 border-secondary/20 text-secondary"
                : "bg-card border-border/80 text-foreground hover:bg-stone-50"
            }`}
          >
            {loadingSave ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : plan.saved || savedSuccess ? (
              <BookmarkCheck className="w-3.5 h-3.5 fill-secondary" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
            <span>{plan.saved || savedSuccess ? "Piano Salvato" : "Salva piano"}</span>
          </button>
        </div>

      </div>

      {/* Details drawer Overlay */}
      <MealDetailModal />

      {/* Premium limits paywall */}
      <PaywallModal />

    </div>
  );
}
