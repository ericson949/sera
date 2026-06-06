"use client";

import { useDinneroStore } from "../hooks/useDinneroStore";
import { formatMoney } from "../../domain/value-objects/Money";
import { X, Clock, Flame, RefreshCw, ChefHat, CheckSquare, Info, Loader2 } from "lucide-react";

export default function MealDetailModal() {
  const { selectedMeal, selectMeal, swapMeal, isSwapping } = useDinneroStore();

  if (!selectedMeal) return null;

  const handleSwap = async () => {
    try {
      await swapMeal(selectedMeal.day);
    } catch {
      // handled by store error
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-fade-in">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={() => selectMeal(null)} />

      {/* Slide-up Drawer Container */}
      <div className="relative w-full max-w-[480px] bg-card rounded-t-[32px] border-t border-border shadow-2xl z-10 max-h-[88vh] flex flex-col animate-slide-left overflow-hidden">
        
        {/* Drag handle / Accent line */}
        <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto my-3 shrink-0" />

        {/* Modal Header */}
        <div className="px-6 pb-4 border-b border-border/80 flex justify-between items-start gap-4">
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded-full mb-1">
              {selectedMeal.day}
            </span>
            <h3 className="text-xl font-extrabold text-foreground leading-tight">
              {selectedMeal.title}
            </h3>
          </div>
          <button
            onClick={() => selectMeal(null)}
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors tap-highlight"
          >
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 no-scrollbar pb-24">
          
          {/* Cover gradient card (acts as image placeholder) */}
          <div className="w-full h-32 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 p-6 flex flex-col justify-end text-white shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full w-max">
              Dinnero AI Selection
            </span>
            <span className="text-lg font-black mt-1 line-clamp-1">{selectedMeal.title}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-foreground/80 leading-relaxed italic">
            "{selectedMeal.description}"
          </p>

          {/* Core Stats Row */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-stone-50 border border-border/50 rounded-xl p-3 text-center">
              <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-muted block">PREPARAZIONE</span>
              <span className="text-sm font-bold text-foreground">{selectedMeal.prepTimeMinutes} min</span>
            </div>
            <div className="bg-stone-50 border border-border/50 rounded-xl p-3 text-center">
              <Flame className="w-4 h-4 text-primary mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-muted block">CALORIE</span>
              <span className="text-sm font-bold text-foreground">{selectedMeal.calories} kcal</span>
            </div>
            <div className="bg-stone-50 border border-border/50 rounded-xl p-3 text-center">
              <span className="text-xs font-bold text-secondary block mb-1">€</span>
              <span className="text-[10px] font-semibold text-muted block">COSTO STIMATO</span>
              <span className="text-sm font-bold text-secondary">{formatMoney(selectedMeal.estimatedCost)}</span>
            </div>
          </div>

          {/* Why We Picked This */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Info className="w-4 h-4 text-secondary" /> Perché l'IA l'ha scelto
            </h4>
            <div className="bg-secondary/5 border border-secondary/10 rounded-2xl p-4 space-y-2">
              {selectedMeal.whyThisMeal.map((reason, idx) => (
                <div key={idx} className="flex gap-2 items-start text-xs text-foreground/90 font-medium">
                  <span className="text-secondary font-bold">•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-stone-500" /> Ingredienti per porzione
            </h4>
            <div className="divide-y divide-border/60 bg-stone-50/50 border border-border/60 rounded-2xl px-4 py-2">
              {selectedMeal.ingredients.map((ing, idx) => (
                <div key={idx} className="flex justify-between items-center py-2.5 text-xs">
                  <span className="font-semibold text-foreground">{ing.name}</span>
                  <div className="flex gap-2 text-stone-500 font-medium">
                    <span>{ing.quantity}</span>
                    <span className="text-stone-300 font-light">|</span>
                    <span className="text-secondary font-bold">{formatMoney(ing.estimatedPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recipe Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-stone-500" /> Preparazione passo dopo passo
            </h4>
            <div className="space-y-4 pl-1">
              {selectedMeal.recipeSteps.map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/80 font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Swaps & Action Panel Sticky footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border/80 p-4 px-6 flex gap-3 z-20">
          <button
            onClick={() => selectMeal(null)}
            className="flex-1 py-3.5 bg-stone-100 hover:bg-stone-200 text-foreground font-bold text-sm rounded-xl transition-colors tap-highlight"
          >
            Chiudi
          </button>
          
          <button
            onClick={handleSwap}
            disabled={isSwapping}
            className="flex-1 py-3.5 bg-secondary hover:bg-secondary-hover disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 tap-highlight"
          >
            {isSwapping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Aggiorno...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Cambia pasto</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
