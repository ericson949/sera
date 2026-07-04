"use client";

import { create } from "zustand";
import { WeekDay } from "../../domain/value-objects/WeekDay";
import { UserPreferences } from "@/modules/users/domain/entities/UserPreferences";
import { DinneroState, AppCountry, AppLanguage } from "./useDinneroStore.types";
import { clearOnboardingDraft, createOnboardingDraft, getOnboardingDraft, getSavedLocale, LOCALE_STORAGE_KEY, saveOnboardingDraft, USAGE_STORAGE_KEY } from "./seraStoreConfig";
import { seraUseCases } from "./seraUseCases";
import { SERA_INITIAL_STATE } from "./seraInitialState";

export type { AppCountry, AppLanguage };

const { userRepo, startOnboardingUseCase, savePrefsUseCase, generatePlanUseCase, regeneratePlanUseCase, swapMealUseCase, getCurrentPlanUseCase, toggleShoppingItemUseCase, saveMealPlanUseCase, getDashboardUseCase, swapPlannedMealsUseCase, createCheckoutUseCase } = seraUseCases;

export const useDinneroStore = create<DinneroState>((set, get) => ({
  ...SERA_INITIAL_STATE,

  initStore: async () => {
    if (get().isInitializing || get().hasHydrated) return;
    set({ isInitializing: true });

    try {
      const uId = get().userId;
      const savedLocale = getSavedLocale();
      const onboardingDraft = getOnboardingDraft();
      let userObj = await userRepo.findById(uId);
      if (!userObj) {
        userObj = {
          id: uId,
          email: "ciao@sera.menu",
          subscriptionStatus: "free",
          createdAt: new Date(),
        };
        await userRepo.save(userObj);
      }
      const prefs = await startOnboardingUseCase.execute(uId);
      const currentPlan = await getCurrentPlanUseCase.execute(uId);

      set({
        user: userObj,
        preferences: prefs,
        activePlan: currentPlan,
        appLanguage: onboardingDraft?.appLanguage || savedLocale?.appLanguage || get().appLanguage,
        appCountry: onboardingDraft?.appCountry || savedLocale?.appCountry || get().appCountry,
        onboardingStep: currentPlan ? 1 : onboardingDraft?.onboardingStep || get().onboardingStep,
        onboardingShop: onboardingDraft?.onboardingShop || prefs.shop,
        onboardingBudgetMin: onboardingDraft?.onboardingBudgetMin || prefs.weeklyBudget.min,
        onboardingBudgetMax: onboardingDraft?.onboardingBudgetMax || prefs.weeklyBudget.max,
        onboardingPeople: onboardingDraft?.onboardingPeople || prefs.numberOfPeople,
        onboardingGoal: onboardingDraft?.onboardingGoal || prefs.goal,
        onboardingVibes: onboardingDraft?.onboardingVibes || prefs.vibes,
        onboardingDietaryNeeds: onboardingDraft?.onboardingDietaryNeeds || prefs.dietaryNeeds,
        onboardingCookingTime: onboardingDraft?.onboardingCookingTime || prefs.maxCookingTime,
        onboardingKitchenItems: onboardingDraft?.onboardingKitchenItems || prefs.kitchenItems,
        onboardingBatchCooking: onboardingDraft?.onboardingBatchCooking ?? prefs.batchCooking,
        hasHydrated: true,
        isInitializing: false,
      });

      await get().loadDashboard();
    } catch (err: any) {
      set({ error: err.message, hasHydrated: true, isInitializing: false });
    }
  },

  setOnboardingField: (key, value) => {
    if (typeof window !== "undefined" && (key === "appLanguage" || key === "appCountry")) {
      const nextLocale = {
        appLanguage: key === "appLanguage" ? value : get().appLanguage,
        appCountry: key === "appCountry" ? value : get().appCountry,
      };
      localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify(nextLocale));
    }

    set({ [key]: value } as any);

    if (key.startsWith("onboarding") || key === "appLanguage" || key === "appCountry") {
      saveOnboardingDraft(createOnboardingDraft(get()));
    }
  },

  nextStep: () => {
    set((state) => ({ onboardingStep: state.onboardingStep + 1 }));
    saveOnboardingDraft(createOnboardingDraft(get()));
  },

  prevStep: () => {
    set((state) => ({ onboardingStep: Math.max(1, state.onboardingStep - 1) }));
    saveOnboardingDraft(createOnboardingDraft(get()));
  },

  resetOnboarding: () => {
    const { appLanguage, appCountry, onboardingShop } = get();

    set({
      onboardingStep: 1,
      appLanguage,
      appCountry,
      onboardingShop,
      onboardingBudgetMin: 35,
      onboardingBudgetMax: 50,
      onboardingPeople: 2,
      onboardingGoal: "Save money",
      onboardingVibes: [],
      onboardingDietaryNeeds: ["None"],
      onboardingCookingTime: "30 min",
      onboardingKitchenItems: [],
      onboardingBatchCooking: false,
      error: null,
    });
    saveOnboardingDraft(createOnboardingDraft(get()));
  },

  generatePlan: async () => {
    set({ isGenerating: true, error: null });
    try {
      const uId = get().userId;
      const prefData: UserPreferences = {
        userId: uId,
        shop: get().onboardingShop,
        weeklyBudget: {
          min: get().onboardingBudgetMin,
          max: get().onboardingBudgetMax,
          currency: "EUR",
        },
        numberOfPeople: get().onboardingPeople,
        goal: get().onboardingGoal,
        vibes: get().onboardingVibes,
        dietaryNeeds: get().onboardingDietaryNeeds,
        maxCookingTime: get().onboardingCookingTime,
        kitchenItems: get().onboardingKitchenItems,
        batchCooking: get().onboardingBatchCooking,
      };
      await savePrefsUseCase.execute(prefData);
      const plan = await generatePlanUseCase.execute(uId);

      set({ activePlan: plan, isGenerating: false, preferences: prefData });
      clearOnboardingDraft();
      await get().loadDashboard();
    } catch (err: any) {
      set({ isGenerating: false, error: err.message });
      if (err.message.includes("limit reached") || err.message.includes("upgrade")) {
        set({ showPaywall: true, paywallTrigger: "default" });
      }
    }
  },

  regeneratePlan: async () => {
    set({ isGenerating: true, error: null });
    try {
      const uId = get().userId;
      console.log("Regenerating plan for user:", uId);
      const plan = await regeneratePlanUseCase.execute(uId);
      set({ activePlan: plan, isGenerating: false });
      await get().loadDashboard();
    } catch (err: any) {
      set({ isGenerating: false, error: err.message });
      if (err.message.includes("limit reached") || err.message.includes("upgrade")) {
        set({ showPaywall: true, paywallTrigger: "regenerate" });
      }
    }
  },

  swapMeal: async (day: WeekDay) => {
    set({ isSwapping: true, error: null });
    try {
      const uId = get().userId;
      const updatedPlan = await swapMealUseCase.execute(uId, day);
      const currentSelected = get().selectedMeal;
      if (currentSelected && currentSelected.day === day) {
        const newMeal = updatedPlan.days.find((m) => m.day === day);
        set({ selectedMeal: newMeal || null });
      }

      set({ activePlan: updatedPlan, isSwapping: false });
      await get().loadDashboard();
    } catch (err: any) {
      set({ isSwapping: false, error: err.message });
      if (err.message.includes("limit") || err.message.includes("upgrade")) {
        set({ showPaywall: true, paywallTrigger: "default" });
      }
    }
  },

  toggleShoppingItem: async (itemId: string) => {
    try {
      const uId = get().userId;
      const updatedPlan = await toggleShoppingItemUseCase.execute(uId, itemId);
      set({ activePlan: updatedPlan });
      await get().loadDashboard();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  saveCurrentPlan: async () => {
    try {
      const uId = get().userId;
      const active = get().activePlan;
      if (!active) return;
      const updatedPlan = await saveMealPlanUseCase.execute(uId, active.id);
      set({ activePlan: updatedPlan });
      await get().loadDashboard();
    } catch (err: any) {
      set({ error: err.message });
      if (err.message.includes("limit") || err.message.includes("upgrade")) {
        set({ showPaywall: true, paywallTrigger: "default" });
      }
    }
  },

  swapPlannedMeals: async (sourceMealId, targetMealId) => {
    try {
      const active = get().activePlan;
      if (!active || sourceMealId === targetMealId) return;
      const updatedPlan = await swapPlannedMealsUseCase.execute(active.id, sourceMealId, targetMealId);
      set({ activePlan: updatedPlan });
      await get().loadDashboard();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  activatePlan: (plan) => set({ activePlan: plan }),

  loadDashboard: async () => {
    try {
      const uId = get().userId;
      const userObj = get().user;
      const status = userObj?.subscriptionStatus || "free";
      const dash = await getDashboardUseCase.execute(uId, status);
      set({ dashboard: dash });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  simulateProUpgrade: async () => {
    try {
      const uId = get().userId;
      const userObj = await userRepo.findById(uId);
      if (userObj) {
        userObj.subscriptionStatus = "pro";
        await userRepo.save(userObj);
        set({ user: userObj });
        await get().loadDashboard();
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  simulateProDowngrade: async () => {
    try {
      const uId = get().userId;
      const userObj = await userRepo.findById(uId);
      if (userObj) {
        userObj.subscriptionStatus = "free";
        await userRepo.save(userObj);
        set({ user: userObj });
        localStorage.removeItem(USAGE_STORAGE_KEY);
        await get().loadDashboard();
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  triggerUpgradeCheckout: async (origin: string): Promise<string | null> => {
    try {
      const uId = get().userId;
      const userObj = get().user;
      const email = userObj?.email || "user@sera.menu";
      const result = await createCheckoutUseCase.execute(uId, email, origin);
      return result.url;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

  closePaywall: () => set({ showPaywall: false, paywallTrigger: "default" }),
  openPaywall: () => set({ showPaywall: true, paywallTrigger: "default" }),
  selectMeal: (meal) => {
    set({ selectedMeal: meal });
  },
}));
