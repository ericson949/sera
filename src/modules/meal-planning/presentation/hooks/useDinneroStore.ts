import { create } from "zustand";
import { WeekDay } from "../../domain/value-objects/WeekDay";
import { UserPreferences } from "@/modules/users/domain/entities/UserPreferences";
import { DinneroState, AppCountry, AppLanguage } from "./useDinneroStore.types";
import { DEFAULT_USER_ID, getSavedLocale, LOCALE_STORAGE_KEY, USAGE_STORAGE_KEY } from "./seraStoreConfig";
import { seraUseCases } from "./seraUseCases";

export type { AppCountry, AppLanguage };

const {
  userRepo,
  startOnboardingUseCase,
  savePrefsUseCase,
  generatePlanUseCase,
  regeneratePlanUseCase,
  swapMealUseCase,
  getCurrentPlanUseCase,
  toggleShoppingItemUseCase,
  saveMealPlanUseCase,
  getDashboardUseCase,
  createCheckoutUseCase,
} = seraUseCases;

export const useDinneroStore = create<DinneroState>((set, get) => ({
  user: null,
  userId: DEFAULT_USER_ID,
  preferences: null,
  appLanguage: "it",
  appCountry: "Italy",

  onboardingStep: 1,
  onboardingShop: "Lidl",
  onboardingBudgetMin: 35,
  onboardingBudgetMax: 50,
  onboardingPeople: 2,
  onboardingGoal: "Save money",
  onboardingVibes: [],
  onboardingDietaryNeeds: ["None"],
  onboardingCookingTime: "30 min",
  onboardingKitchenItems: [],

  activePlan: null,
  selectedMeal: null,
  dashboard: null,
  isGenerating: false,
  isSwapping: false,
  error: null,
  showPaywall: false,

  initStore: async () => {
    try {
      const uId = get().userId;
      const savedLocale = getSavedLocale();
      
      // Ensure user entity exists
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

      // Initialize default preferences if none exist
      const prefs = await startOnboardingUseCase.execute(uId);
      
      // Fetch current plan
      const currentPlan = await getCurrentPlanUseCase.execute(uId);

      set({
        user: userObj,
        preferences: prefs,
        activePlan: currentPlan,
        appLanguage: savedLocale?.appLanguage || get().appLanguage,
        appCountry: savedLocale?.appCountry || get().appCountry,
        onboardingShop: prefs.shop,
        onboardingBudgetMin: prefs.weeklyBudget.min,
        onboardingBudgetMax: prefs.weeklyBudget.max,
        onboardingPeople: prefs.numberOfPeople,
        onboardingGoal: prefs.goal,
        onboardingVibes: prefs.vibes,
        onboardingDietaryNeeds: prefs.dietaryNeeds,
        onboardingCookingTime: prefs.maxCookingTime,
        onboardingKitchenItems: prefs.kitchenItems,
      });

      await get().loadDashboard();
    } catch (err: any) {
      set({ error: err.message });
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
  },

  nextStep: () => {
    set((state) => ({ onboardingStep: state.onboardingStep + 1 }));
  },

  prevStep: () => {
    set((state) => ({ onboardingStep: Math.max(1, state.onboardingStep - 1) }));
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
      error: null,
    });
  },

  generatePlan: async () => {
    set({ isGenerating: true, error: null });
    try {
      const uId = get().userId;

      // 1. Save preferences first
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
      };

      await savePrefsUseCase.execute(prefData);

      // 2. Generate Plan
      const plan = await generatePlanUseCase.execute(uId);

      set({ activePlan: plan, isGenerating: false, preferences: prefData });
      await get().loadDashboard();
    } catch (err: any) {
      set({ isGenerating: false, error: err.message });
      if (err.message.includes("limit reached") || err.message.includes("upgrade")) {
        set({ showPaywall: true });
      }
    }
  },

  regeneratePlan: async () => {
    set({ isGenerating: true, error: null });
    try {
      const uId = get().userId;
      const plan = await regeneratePlanUseCase.execute(uId);
      set({ activePlan: plan, isGenerating: false });
      await get().loadDashboard();
    } catch (err: any) {
      set({ isGenerating: false, error: err.message });
      if (err.message.includes("limit reached") || err.message.includes("upgrade")) {
        set({ showPaywall: true });
      }
    }
  },

  swapMeal: async (day: WeekDay) => {
    set({ isSwapping: true, error: null });
    try {
      const uId = get().userId;
      const updatedPlan = await swapMealUseCase.execute(uId, day);
      
      // If a meal details drawer is open, update the selectedMeal reference
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
        set({ showPaywall: true });
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
      if (err.message.includes("premium") || err.message.includes("upgrade")) {
        set({ showPaywall: true });
      }
    }
  },

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
        // Reset local counters for demo testing
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

  closePaywall: () => set({ showPaywall: false }),
  openPaywall: () => set({ showPaywall: true }),
  selectMeal: (meal) => set({ selectedMeal: meal }),
}));
