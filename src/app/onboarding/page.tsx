"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import BudgetSlider from "@/modules/meal-planning/presentation/components/BudgetSlider";
import { ChevronLeft, ChevronRight, Check, Loader2, CookingPot, ShoppingCart, User, Target, Compass, Heart, Clock, Layers } from "lucide-react";
import { GROCERY_SHOPS } from "@/modules/meal-planning/domain/value-objects/GroceryShop";
import { MEAL_GOALS } from "@/modules/meal-planning/domain/value-objects/MealGoal";
import { FOOD_VIBES, FoodVibe } from "@/modules/meal-planning/domain/value-objects/FoodVibe";
import { DIETARY_NEEDS, DietaryNeed } from "@/modules/meal-planning/domain/value-objects/DietaryNeed";
import { COOKING_TIMES } from "@/modules/meal-planning/domain/value-objects/CookingTime";

const KITCHEN_ITEMS = [
  "Pasta", "Rice", "Eggs", "Chicken", "Tuna", "Tomatoes", "Cheese",
  "Potatoes", "Beans", "Lentils", "Olive oil", "Onion", "Garlic",
  "Frozen vegetables", "Spices", "Milk", "Yogurt", "Bread", "Oats"
];

export default function OnboardingPage() {
  const router = useRouter();
  
  // Zustand store bindings
  const {
    onboardingStep,
    onboardingShop,
    onboardingBudgetMin,
    onboardingBudgetMax,
    onboardingPeople,
    onboardingGoal,
    onboardingVibes,
    onboardingDietaryNeeds,
    onboardingCookingTime,
    onboardingKitchenItems,
    error,
    setOnboardingField,
    nextStep,
    prevStep,
    generatePlan,
    resetOnboarding
  } = useDinneroStore();

  // Local state for loading animation
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const loadingPhrases = [
    "Analisi del budget settimanale...",
    "Verifica delle intolleranze e preferenze...",
    "Elaborazione del ricettario personalizzato...",
    "Compilazione della lista della spesa per categoria...",
    "Ottimizzazione ingredienti per ridurre lo spreco..."
  ];

  // Increment loading phrases index
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (onboardingStep === 10) {
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => {
          if (prev < loadingPhrases.length - 1) return prev + 1;
          return prev;
        });
      }, 700);
    } else {
      setLoadingStepIdx(0);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loadingPhrases.length, onboardingStep]);

  // Run the generation API call on step 10
  useEffect(() => {
    if (onboardingStep === 10) {
      const triggerGeneration = async () => {
        try {
          await generatePlan();
          // After generation succeeds, go to results page
          router.push("/results");
        } catch {
          // Stay on step 10 to show error or go back
        }
      };
      triggerGeneration();
    }
  }, [onboardingStep, generatePlan, router]);

  const handleStart = () => {
    resetOnboarding();
    nextStep();
  };

  const handleNext = () => {
    // Vibes validation
    if (onboardingStep === 6 && onboardingVibes.length > 3) {
      return; // blocked by validation
    }
    nextStep();
  };

  // Toggle helpers
  const toggleVibe = (vibe: FoodVibe) => {
    const current = [...onboardingVibes];
    if (current.includes(vibe)) {
      setOnboardingField("onboardingVibes", current.filter(v => v !== vibe));
    } else {
      if (current.length < 3) {
        setOnboardingField("onboardingVibes", [...current, vibe]);
      }
    }
  };

  const toggleDiet = (diet: DietaryNeed) => {
    const current = [...onboardingDietaryNeeds];
    if (diet === "None") {
      setOnboardingField("onboardingDietaryNeeds", ["None"]);
      return;
    }
    
    let nextDiets: DietaryNeed[] = current.filter(d => d !== "None");
    if (nextDiets.includes(diet)) {
      nextDiets = nextDiets.filter(d => d !== diet);
      if (nextDiets.length === 0) nextDiets = ["None"];
    } else {
      nextDiets.push(diet);
    }
    setOnboardingField("onboardingDietaryNeeds", nextDiets);
  };

  const toggleKitchenItem = (item: string) => {
    const current = [...onboardingKitchenItems];
    if (current.includes(item)) {
      setOnboardingField("onboardingKitchenItems", current.filter(i => i !== item));
    } else {
      setOnboardingField("onboardingKitchenItems", [...current, item]);
    }
  };

  // Render specific step progress indicators
  const renderProgress = () => {
    if (onboardingStep === 1 || onboardingStep === 10) return null;
    const totalSteps = 8; // Steps 2 to 9
    const activeProgress = onboardingStep - 1;
    
    return (
      <div className="w-full flex gap-1.5 px-6 pt-4 mb-4 select-none">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              idx < activeProgress ? "bg-secondary" : "bg-border"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-background animate-fade-in">
      
      {/* Upper Navigation Bar */}
      {onboardingStep > 1 && onboardingStep < 10 && (
        <div className="flex justify-between items-center select-none pt-2">
          <button
            onClick={prevStep}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-stone-50 transition-colors tap-highlight"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold text-muted">
            Passo {onboardingStep - 1} di 8
          </span>
          <div className="w-10" /> {/* Spacer */}
        </div>
      )}

      {/* Progress Line */}
      {renderProgress()}

      {/* Main Container Content */}
      <div className="flex-1 flex flex-col justify-center my-auto">
        
        {/* STEP 1: WELCOME SCREEN */}
        {onboardingStep === 1 && (
          <div className="text-center flex flex-col items-center gap-6 animate-scale-in">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-2">
              <CookingPot className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Dinnero
              </h1>
              <p className="text-sm font-semibold text-secondary uppercase tracking-widest mt-1">
                La tua cena in 60 secondi
              </p>
            </div>
            <div className="space-y-3 px-2">
              <p className="text-2xl font-bold text-foreground leading-tight">
                Pianifica le tue cene settimanali in un attimo.
              </p>
              <p className="text-sm text-muted">
                Scegli il tuo supermercato preferito, imposta il budget e lascia che l'intelligenza artificiale crei menu e lista della spesa ottimizzati.
              </p>
            </div>
            
            {/* Value Props Card */}
            <div className="w-full bg-card border border-border rounded-2xl p-4 text-left space-y-3 mt-4">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Spendi meno, mangia meglio</h4>
                  <p className="text-xs text-muted">Mantieni il budget sotto controllo con ricette calibrate sui prezzi.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Zero sprechi alimentari</h4>
                  <p className="text-xs text-muted">L'IA riutilizza gli ingredienti in comune tra i vari giorni.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE SHOP */}
        {onboardingStep === 2 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center space-y-2">
              <ShoppingCart className="w-8 h-8 text-primary mx-auto" />
              <h2 className="text-2xl font-extrabold">Dove fai la spesa di solito?</h2>
              <p className="text-sm text-muted">Lo useremo per fare stime dei prezzi più precise per il tuo carrello.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {GROCERY_SHOPS.map((shop) => (
                <button
                  key={shop}
                  onClick={() => setOnboardingField("onboardingShop", shop)}
                  className={`py-3.5 px-2 rounded-xl text-xs font-bold border transition-all tap-highlight ${
                    onboardingShop === shop
                      ? "border-secondary bg-secondary/5 text-secondary shadow-[0_2px_8px_rgba(45,106,79,0.1)]"
                      : "border-border bg-card text-foreground hover:bg-stone-50"
                  }`}
                >
                  {shop}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: BUDGET RANGE */}
        {onboardingStep === 3 && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="text-center space-y-2">
              <Layers className="w-8 h-8 text-primary mx-auto" />
              <h2 className="text-2xl font-extrabold">Qual è il tuo budget cene?</h2>
              <p className="text-sm text-muted">Cercheremo di mantenere le cene di tutta la settimana dentro questo limite.</p>
            </div>
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
              <BudgetSlider
                min={onboardingBudgetMin}
                max={onboardingBudgetMax}
                onChange={(min, max) => {
                  setOnboardingField("onboardingBudgetMin", min);
                  setOnboardingField("onboardingBudgetMax", max);
                }}
              />
            </div>
            <p className="text-xs text-center text-muted px-4 italic">
              *Nota: la stima tiene conto del costo medio degli ingredienti freschi e secchi in Italia.
            </p>
          </div>
        )}

        {/* STEP 4: NUMBER OF PEOPLE */}
        {onboardingStep === 4 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center space-y-2">
              <User className="w-8 h-8 text-primary mx-auto" />
              <h2 className="text-2xl font-extrabold">Per quante persone cucini?</h2>
              <p className="text-sm text-muted">Adatteremo le porzioni delle ricette e la lista della spesa.</p>
            </div>
            <div className="space-y-2.5 max-w-xs mx-auto w-full">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setOnboardingField("onboardingPeople", num)}
                  className={`w-full py-4 px-6 rounded-2xl border flex justify-between items-center font-bold transition-all tap-highlight ${
                    onboardingPeople === num
                      ? "border-secondary bg-secondary/5 text-secondary shadow-[0_2px_8px_rgba(45,106,79,0.1)]"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  <span className="text-base">
                    {num === 5 ? "5+ Persone" : `${num} Person${num === 1 ? "a" : "e"}`}
                  </span>
                  {onboardingPeople === num && <Check className="w-5 h-5 text-secondary" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: GOAL */}
        {onboardingStep === 5 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center space-y-2">
              <Target className="w-8 h-8 text-primary mx-auto" />
              <h2 className="text-2xl font-extrabold">Qual è il tuo obiettivo principale?</h2>
              <p className="text-sm text-muted">L'IA darà priorità a questa caratteristica nei pasti.</p>
            </div>
            <div className="space-y-2.5 max-w-sm mx-auto w-full">
              {MEAL_GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => setOnboardingField("onboardingGoal", goal)}
                  className={`w-full py-3.5 px-6 rounded-2xl border flex justify-between items-center text-sm font-semibold transition-all tap-highlight ${
                    onboardingGoal === goal
                      ? "border-secondary bg-secondary/5 text-secondary shadow-[0_2px_8px_rgba(45,106,79,0.1)]"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  <span>{goal}</span>
                  {onboardingGoal === goal && <Check className="w-4 h-4 text-secondary" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: FOOD VIBE */}
        {onboardingStep === 6 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center space-y-2">
              <Compass className="w-8 h-8 text-primary mx-auto" />
              <h2 className="text-2xl font-extrabold">Che stile preferisci?</h2>
              <p className="text-sm text-muted">Scegli fino a 3 stili culinari (Selezionati: {onboardingVibes.length}/3).</p>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto w-full">
              {FOOD_VIBES.map((vibe) => {
                const isSelected = onboardingVibes.includes(vibe);
                const isDisabled = onboardingVibes.length >= 3 && !isSelected;
                
                return (
                  <button
                    key={vibe}
                    disabled={isDisabled}
                    onClick={() => toggleVibe(vibe)}
                    className={`py-3.5 px-4 rounded-xl border text-xs font-bold transition-all flex justify-between items-center tap-highlight ${
                      isSelected
                        ? "border-secondary bg-secondary/5 text-secondary shadow-[0_2px_8px_rgba(45,106,79,0.1)]"
                        : isDisabled
                          ? "border-border bg-stone-50/50 text-stone-300 cursor-not-allowed"
                          : "border-border bg-card text-foreground hover:bg-stone-50"
                    }`}
                  >
                    <span>{vibe}</span>
                    {isSelected && <Check className="w-4 h-4 text-secondary" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 7: DIETARY NEEDS */}
        {onboardingStep === 7 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center space-y-2">
              <Heart className="w-8 h-8 text-primary mx-auto" />
              <h2 className="text-2xl font-extrabold">Hai esigenze alimentari?</h2>
              <p className="text-sm text-muted">Seleziona intolleranze o regimi alimentari particolari.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto w-full">
              {DIETARY_NEEDS.map((diet) => {
                const isSelected = onboardingDietaryNeeds.includes(diet);
                return (
                  <button
                    key={diet}
                    onClick={() => toggleDiet(diet)}
                    className={`py-3.5 px-4 rounded-xl border text-xs font-bold transition-all flex justify-between items-center tap-highlight ${
                      isSelected
                        ? "border-secondary bg-secondary/5 text-secondary shadow-[0_2px_8px_rgba(45,106,79,0.1)]"
                        : "border-border bg-card text-foreground hover:bg-stone-50"
                    }`}
                  >
                    <span>{diet}</span>
                    {isSelected && <Check className="w-4 h-4 text-secondary" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 8: COOKING TIME */}
        {onboardingStep === 8 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center space-y-2">
              <Clock className="w-8 h-8 text-primary mx-auto" />
              <h2 className="text-2xl font-extrabold">Quanto tempo hai per cucinare?</h2>
              <p className="text-sm text-muted">Escluderemo le ricette che richiedono cotture troppo lunghe.</p>
            </div>
            <div className="space-y-2.5 max-w-xs mx-auto w-full">
              {COOKING_TIMES.map((time) => (
                <button
                  key={time}
                  onClick={() => setOnboardingField("onboardingCookingTime", time)}
                  className={`w-full py-4 px-6 rounded-2xl border flex justify-between items-center font-bold transition-all tap-highlight ${
                    onboardingCookingTime === time
                      ? "border-secondary bg-secondary/5 text-secondary shadow-[0_2px_8px_rgba(45,106,79,0.1)]"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  <span className="text-base">{time}</span>
                  {onboardingCookingTime === time && <Check className="w-5 h-5 text-secondary" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 9: KITCHEN INVENTORY */}
        {onboardingStep === 9 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center space-y-2">
              <CookingPot className="w-8 h-8 text-primary mx-auto" />
              <h2 className="text-2xl font-extrabold">Cosa c'è già in dispensa?</h2>
              <p className="text-sm text-muted">Seleziona cosa vuoi usare per risparmiare ancora di più sulla spesa.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
              {KITCHEN_ITEMS.map((item) => {
                const isSelected = onboardingKitchenItems.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleKitchenItem(item)}
                    className={`py-2 px-4 rounded-full border text-xs font-medium transition-all tap-highlight flex items-center gap-1.5 ${
                      isSelected
                        ? "border-secondary bg-secondary text-white shadow-[0_2px_8px_rgba(45,106,79,0.2)]"
                        : "border-border bg-card text-foreground hover:bg-stone-50"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 10: LOADING / GENERATING SCREEN */}
        {onboardingStep === 10 && (
          <div className="text-center flex flex-col items-center gap-8 py-10 animate-scale-in">
            {/* Spinning Loader */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute w-20 h-20 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin" />
              <CookingPot className="w-8 h-8 text-secondary animate-pulse" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold text-foreground">
                Creo il tuo menu...
              </h2>
              
              {/* Dynamic steps tracker */}
              <div className="flex flex-col gap-2.5 items-center mt-6 w-full max-w-[280px] mx-auto text-left">
                {loadingPhrases.map((phrase, idx) => {
                  const isPast = idx < loadingStepIdx;
                  const isCurrent = idx === loadingStepIdx;
                  
                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 items-center transition-all duration-300 text-xs ${
                        isPast ? "text-secondary font-medium" : isCurrent ? "text-foreground font-bold" : "text-stone-300"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        isPast ? "bg-secondary text-white" : isCurrent ? "bg-primary/15 text-primary" : "bg-stone-100 text-stone-300"
                      }`}>
                        {isPast ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : isCurrent ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                        )}
                      </div>
                      <span className="flex-1">{phrase}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold max-w-xs mx-auto">
                <p>Errore: {error}</p>
                <button
                  onClick={prevStep}
                  className="mt-2 text-primary underline block mx-auto hover:text-primary-hover"
                >
                  Torna indietro e riprova
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Lower Navigation Controls */}
      {onboardingStep < 10 && (
        <div className="mt-8 select-none">
          {onboardingStep === 1 ? (
            <button
              onClick={handleStart}
              className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-extrabold text-base transition-colors shadow-md flex items-center justify-center gap-2 tap-highlight"
            >
              <span>Inizia a pianificare</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onboardingStep === 9 ? handleNext : handleNext}
              className="w-full py-4 bg-foreground hover:bg-zinc-800 text-background rounded-2xl font-extrabold text-base transition-all flex items-center justify-center gap-1.5 shadow-sm tap-highlight"
            >
              <span>{onboardingStep === 9 ? "Genera il piano cene" : "Continua"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

    </div>
  );
}
