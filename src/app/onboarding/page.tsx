"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AppCountry, AppLanguage, useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { getCopy } from "@/shared/i18n";
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

const SERA_COUNTRIES: { value: AppCountry; label: string; flag: string; defaultShop: string; language: AppLanguage }[] = [
  { value: "UK", label: "UK", flag: "🇬🇧", defaultShop: "Aldi", language: "en" },
  { value: "France", label: "France", flag: "🇫🇷", defaultShop: "Carrefour", language: "fr" },
  { value: "Italy", label: "Italy", flag: "🇮🇹", defaultShop: "Lidl", language: "it" },
  { value: "US", label: "US", flag: "🇺🇸", defaultShop: "Aldi", language: "en" },
];

const SAVINGS_STEPS = [0, 12, 28, 41, 57];
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKLY_MEALS = [
  "Pasta al pomodoro",
  "Chicken risotto",
  "Lentil soup",
  "Veggie frittata",
  "Pesto pasta",
  "Tuna salad",
  "Chickpea stew",
];
const SHOPPING_ITEMS = ["Pasta", "Tomatoes", "Eggs", "Olive oil", "Rice", "Chicken"];

const screenVariants = {
  enter: { opacity: 0, y: 24, scale: 0.98 },
  center: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -18, scale: 0.98 },
};

const staggerContainer = {
  center: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const itemVariants = {
  enter: { opacity: 0, y: 14 },
  center: { opacity: 1, y: 0 },
};

const detectCountry = (): AppCountry => {
  if (typeof navigator === "undefined") return "Italy";

  const locale = navigator.language.toLowerCase();
  if (locale.includes("fr")) return "France";
  if (locale.includes("it")) return "Italy";
  if (locale.includes("gb") || locale.includes("en-gb")) return "UK";
  if (locale.includes("us") || locale.includes("en-us")) return "US";
  return "Italy";
};

const getCountryConfig = (country: AppCountry) =>
  SERA_COUNTRIES.find((item) => item.value === country) ?? SERA_COUNTRIES[2];

const COUNTRIES: { value: AppCountry; label: string; flag: string; defaultShop: string }[] = [
  { value: "UK", label: "UK", flag: "GB", defaultShop: "Aldi" },
  { value: "France", label: "France", flag: "FR", defaultShop: "Carrefour" },
  { value: "Italy", label: "Italy", flag: "IT", defaultShop: "Lidl" },
  { value: "US", label: "US", flag: "US", defaultShop: "Aldi" },
];

const LANGUAGES: { value: AppLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "it", label: "Italiano" },
];

export default function OnboardingPage() {
  const router = useRouter();
  
  // Zustand store bindings
  const {
    onboardingStep,
    appLanguage,
    appCountry,
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

  const copy = getCopy(appLanguage);
  const [welcomePage, setWelcomePage] = useState(0);
  const [savingsValue, setSavingsValue] = useState(0);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const selectedCountry = getCountryConfig(appCountry);

  // Local state for loading animation
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const loadingPhrases = [
    "Analisi del budget settimanale...",
    "Verifica delle intolleranze e preferenze...",
    "Elaborazione del ricettario personalizzato...",
    "Compilazione della lista della spesa per categoria...",
    "Ottimizzazione ingredienti per ridurre lo spreco..."
  ];

  useEffect(() => {
    const detected = detectCountry();
    const config = getCountryConfig(detected);
    setOnboardingField("appCountry", config.value);
    setOnboardingField("appLanguage", config.language);
    setOnboardingField("onboardingShop", config.defaultShop);
  }, [setOnboardingField]);

  useEffect(() => {
    if (welcomePage !== 0) return;

    setSavingsValue(0);
    const timers = SAVINGS_STEPS.map((value, index) =>
      setTimeout(() => setSavingsValue(value), index * 520)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [welcomePage]);

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

  const handleWelcomePrimary = () => {
    if (welcomePage < 2) {
      setCountryPickerOpen(false);
      setWelcomePage((page) => page + 1);
      return;
    }

    handleStart();
  };

  const handleWelcomeBack = () => {
    setWelcomePage((page) => Math.max(0, page - 1));
  };

  const handleCountrySelect = (country: AppCountry, defaultShop: string) => {
    const config = getCountryConfig(country);
    setOnboardingField("appCountry", country);
    setOnboardingField("appLanguage", config.language);
    setOnboardingField("onboardingShop", defaultShop);
    setCountryPickerOpen(false);
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
    <div className={`${onboardingStep === 1 ? "h-svh overflow-hidden" : "min-h-svh"} flex flex-col justify-between bg-background p-5 animate-fade-in`}>
      
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
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        
        {/* STEP 1: WELCOME SCREEN */}
        {onboardingStep === 1 && (
          <div className="flex min-h-0 flex-1 flex-col justify-between gap-3 overflow-hidden pb-[env(safe-area-inset-bottom)]">
            <AnimatePresence mode="wait">
              {welcomePage === 0 && (
                <motion.div
                  key="savings"
                  variants={screenVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-full flex-col justify-between gap-3"
                >
                  <div className="pt-2 text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.86 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-primary text-3xl font-black text-white shadow-lg"
                    >
                      S
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12, duration: 0.45 }}
                      className="mt-2 font-serif text-3xl font-semibold tracking-tight text-foreground"
                    >
                      Sera
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18, duration: 0.5 }}
                      className="mt-3 rounded-[1.6rem] bg-card px-5 py-4 shadow-md"
                    >
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">Monthly savings</p>
                      <motion.div
                        key={savingsValue}
                        initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.35 }}
                        className="mt-1 font-serif text-5xl font-semibold tracking-tight text-foreground"
                      >
                        €{savingsValue}
                      </motion.div>
                    </motion.div>
                  </div>

                  <div className="space-y-2 text-center">
                    <h1 className="font-serif text-[31px] font-semibold leading-[34px] tracking-tight text-foreground">
                      {copy.welcome.savingsTitle}
                    </h1>
                    <p className="mx-auto max-w-[320px] text-sm leading-5 text-muted">
                      {copy.welcome.savingsSubtitle}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setCountryPickerOpen((open) => !open)}
                      className="flex w-full items-center justify-between rounded-full bg-card px-5 py-3 text-left shadow-sm tap-highlight"
                    >
                      <span className="text-base font-black text-foreground">
                        {selectedCountry.flag} {selectedCountry.label}
                      </span>
                      <span className="text-xs font-bold text-muted">
                        {countryPickerOpen ? "Close" : "Change"}
                      </span>
                    </button>
                    <AnimatePresence>
                      {countryPickerOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: 10, height: 0 }}
                          transition={{ duration: 0.28 }}
                          className="grid grid-cols-2 gap-2 overflow-hidden"
                        >
                          {SERA_COUNTRIES.map((country) => (
                            <button
                              key={country.value}
                              onClick={() => handleCountrySelect(country.value, country.defaultShop)}
                              className={`rounded-2xl px-4 py-2.5 text-left text-sm font-black shadow-sm tap-highlight ${
                                appCountry === country.value
                                  ? "bg-secondary text-white"
                                  : "bg-card text-foreground"
                              }`}
                            >
                              {country.flag} {country.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <p className="text-center text-xs font-semibold text-muted">
                      {copy.welcome.wrongCountry}
                    </p>
                  </div>
                </motion.div>
              )}

              {welcomePage === 1 && (
                <motion.div
                  key="planner"
                  variants={screenVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-full flex-col justify-center gap-5"
                >
                  <motion.div
                    variants={staggerContainer}
                    initial="enter"
                    animate="center"
                    className="space-y-1.5 rounded-[1.6rem] bg-card p-3 shadow-md"
                  >
                    {WEEK_DAYS.map((day, index) => (
                      <motion.div
                        key={day}
                        variants={itemVariants}
                        transition={{ duration: 0.38, delay: index * 0.08 }}
                        className="flex items-center gap-3 rounded-[1.1rem] bg-surface-container-low px-3 py-2.5"
                      >
                        <span className="w-9 text-xs font-black uppercase text-muted">{day}</span>
                        <AnimatePresence>
                          <motion.span
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.55 + index * 0.2, duration: 0.35 }}
                            className="flex items-center gap-2 text-sm font-black text-foreground"
                          >
                            <Check className="h-4 w-4 text-secondary" />
                            {WEEKLY_MEALS[index]}
                          </motion.span>
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="space-y-2 text-center">
                    <h1 className="font-serif text-[31px] font-semibold leading-[34px] tracking-tight text-foreground">
                      {copy.welcome.plannerTitle}
                    </h1>
                    <p className="mx-auto max-w-[320px] text-sm leading-5 text-muted">
                      {copy.welcome.plannerSubtitle}
                    </p>
                  </div>
                </motion.div>
              )}

              {welcomePage === 2 && (
                <motion.div
                  key="shopping"
                  variants={screenVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-full flex-col justify-center gap-5"
                >
                  <motion.div
                    variants={staggerContainer}
                    initial="enter"
                    animate="center"
                    className="rounded-[1.6rem] bg-card p-4 shadow-md"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-black text-foreground">Sera list</span>
                      <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-black text-secondary">
                        ⏱ {copy.welcome.timeBadge}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {SHOPPING_ITEMS.map((item, index) => (
                        <motion.div
                          key={item}
                          variants={itemVariants}
                          transition={{ duration: 0.38, delay: index * 0.16 }}
                          className="flex items-center gap-3 rounded-[1.1rem] bg-surface-container-low px-4 py-2.5 text-base font-semibold text-foreground"
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-white">
                            <Check className="h-4 w-4" />
                          </span>
                          {item}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <div className="space-y-2 text-center">
                    <h1 className="font-serif text-[31px] font-semibold leading-[34px] tracking-tight text-foreground">
                      {copy.welcome.listTitle}
                    </h1>
                    <p className="mx-auto max-w-[320px] text-sm leading-5 text-muted">
                      {copy.welcome.listSubtitle}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((page) => (
                <span
                  key={page}
                  className={`h-2 rounded-full transition-all ${page === welcomePage ? "w-8 bg-primary" : "w-2 bg-surface-container-high"}`}
                />
              ))}
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
        <div className={`${onboardingStep === 1 ? "mt-3" : "mt-8"} select-none`}>
          {onboardingStep === 1 ? (
            <div className="flex gap-3">
              {welcomePage > 0 && (
                <button
                  onClick={handleWelcomeBack}
                  className="h-14 w-14 rounded-full bg-card text-foreground shadow-sm flex items-center justify-center tap-highlight"
                  aria-label={copy.common.back}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleWelcomePrimary}
                className="h-14 flex-1 rounded-full bg-primary hover:bg-primary-hover text-white font-extrabold text-base transition-colors shadow-md flex items-center justify-center gap-2 tap-highlight"
              >
                <span>{welcomePage === 2 ? copy.welcome.startPlanning : copy.common.continue}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
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
