import { create } from "zustand";
import { GroceryShop } from "../../domain/value-objects/GroceryShop";
import { MealGoal } from "../../domain/value-objects/MealGoal";
import { FoodVibe } from "../../domain/value-objects/FoodVibe";
import { DietaryNeed } from "../../domain/value-objects/DietaryNeed";
import { CookingTime } from "../../domain/value-objects/CookingTime";
import { WeekDay } from "../../domain/value-objects/WeekDay";
import { MealPlan } from "../../domain/entities/MealPlan";
import { Meal } from "../../domain/entities/Meal";
import { User } from "@/modules/users/domain/entities/User";
import { UserPreferences } from "@/modules/users/domain/entities/UserPreferences";

// Infrastructure instantiations
import { LocalUserRepository } from "@/modules/users/infrastructure/persistence/LocalUserRepository";
import { LocalUserPreferencesRepository } from "@/modules/users/infrastructure/persistence/LocalUserPreferencesRepository";
import { LocalMealPlanRepository } from "@/modules/meal-planning/infrastructure/persistence/LocalMealPlanRepository";
import { OpenAIMealPlanAIService } from "@/modules/meal-planning/infrastructure/ai/OpenAIMealPlanAIService";
import { MockSubscriptionService } from "@/modules/subscriptions/infrastructure/payments/MockSubscriptionService";

// Use cases
import { StartOnboardingUseCase } from "@/modules/users/application/use-cases/StartOnboardingUseCase";
import { SaveUserPreferencesUseCase } from "@/modules/users/application/use-cases/SaveUserPreferencesUseCase";
import { GenerateMealPlanUseCase } from "../../application/use-cases/GenerateMealPlanUseCase";
import { RegenerateMealPlanUseCase } from "../../application/use-cases/RegenerateMealPlanUseCase";
import { SwapMealUseCase } from "../../application/use-cases/SwapMealUseCase";
import { GetCurrentMealPlanUseCase } from "../../application/use-cases/GetCurrentMealPlanUseCase";
import { ToggleShoppingItemUseCase } from "../../application/use-cases/ToggleShoppingItemUseCase";
import { SaveMealPlanUseCase } from "../../application/use-cases/SaveMealPlanUseCase";
import { GetDashboardUseCase, DashboardDTO } from "../../application/use-cases/GetDashboardUseCase";
import { CreateCheckoutSessionUseCase } from "@/modules/subscriptions/application/use-cases/CreateCheckoutSessionUseCase";

const userRepo = new LocalUserRepository();
const prefsRepo = new LocalUserPreferencesRepository();
const mealPlanRepo = new LocalMealPlanRepository();
const aiService = new OpenAIMealPlanAIService();
const subService = new MockSubscriptionService(userRepo);

const startOnboardingUseCase = new StartOnboardingUseCase(prefsRepo);
const savePrefsUseCase = new SaveUserPreferencesUseCase(prefsRepo);
const generatePlanUseCase = new GenerateMealPlanUseCase(mealPlanRepo, prefsRepo, aiService, subService);
const regeneratePlanUseCase = new RegenerateMealPlanUseCase(mealPlanRepo, prefsRepo, aiService, subService);
const swapMealUseCase = new SwapMealUseCase(mealPlanRepo, prefsRepo, aiService, subService);
const getCurrentPlanUseCase = new GetCurrentMealPlanUseCase(mealPlanRepo);
const toggleShoppingItemUseCase = new ToggleShoppingItemUseCase(mealPlanRepo);
const saveMealPlanUseCase = new SaveMealPlanUseCase(mealPlanRepo, subService);
const getDashboardUseCase = new GetDashboardUseCase(mealPlanRepo, prefsRepo);
const createCheckoutUseCase = new CreateCheckoutSessionUseCase(subService);

const DEFAULT_USER_ID = "guest_italy_user";

interface DinneroState {
  // Authentication & Profile
  user: User | null;
  userId: string;
  preferences: UserPreferences | null;

  // Onboarding Form Wizard State
  onboardingStep: number;
  onboardingShop: GroceryShop;
  onboardingBudgetMin: number;
  onboardingBudgetMax: number;
  onboardingPeople: number;
  onboardingGoal: MealGoal;
  onboardingVibes: FoodVibe[];
  onboardingDietaryNeeds: DietaryNeed[];
  onboardingCookingTime: CookingTime;
  onboardingKitchenItems: string[];

  // Active Plan & UI States
  activePlan: MealPlan | null;
  selectedMeal: Meal | null;
  dashboard: DashboardDTO | null;
  isGenerating: boolean;
  isSwapping: boolean;
  error: string | null;

  // Paywall UI Trigger
  showPaywall: boolean;

  // Actions
  initStore: () => Promise<void>;
  setOnboardingField: (key: string, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetOnboarding: () => void;
  generatePlan: () => Promise<void>;
  regeneratePlan: () => Promise<void>;
  swapMeal: (day: WeekDay) => Promise<void>;
  toggleShoppingItem: (itemId: string) => Promise<void>;
  saveCurrentPlan: () => Promise<void>;
  loadDashboard: () => Promise<void>;
  simulateProUpgrade: () => Promise<void>;
  simulateProDowngrade: () => Promise<void>;
  triggerUpgradeCheckout: (origin: string) => Promise<string | null>;
  closePaywall: () => void;
  openPaywall: () => void;
  selectMeal: (meal: Meal | null) => void;
}

export const useDinneroStore = create<DinneroState>((set, get) => ({
  user: null,
  userId: DEFAULT_USER_ID,
  preferences: null,

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
      
      // Ensure user entity exists
      let userObj = await userRepo.findById(uId);
      if (!userObj) {
        userObj = {
          id: uId,
          email: "ciao@dinnero.it",
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
    set({ [key]: value } as any);
  },

  nextStep: () => {
    set((state) => ({ onboardingStep: state.onboardingStep + 1 }));
  },

  prevStep: () => {
    set((state) => ({ onboardingStep: Math.max(1, state.onboardingStep - 1) }));
  },

  resetOnboarding: () => {
    set({
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
        localStorage.removeItem("dinnero_usage_counters");
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
      const email = userObj?.email || "user@dinnero.it";
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
