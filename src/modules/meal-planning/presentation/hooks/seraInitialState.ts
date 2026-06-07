import { DinneroState } from "./useDinneroStore.types";
import { DEFAULT_USER_ID } from "./seraStoreConfig";

export const SERA_INITIAL_STATE: Pick<
  DinneroState,
  | "user"
  | "userId"
  | "preferences"
  | "appLanguage"
  | "appCountry"
  | "onboardingStep"
  | "onboardingShop"
  | "onboardingBudgetMin"
  | "onboardingBudgetMax"
  | "onboardingPeople"
  | "onboardingGoal"
  | "onboardingVibes"
  | "onboardingDietaryNeeds"
  | "onboardingCookingTime"
  | "onboardingKitchenItems"
  | "onboardingBatchCooking"
  | "activePlan"
  | "selectedMeal"
  | "dashboard"
  | "hasHydrated"
  | "isInitializing"
  | "isGenerating"
  | "isSwapping"
  | "error"
  | "showPaywall"
> = {
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
  onboardingBatchCooking: false,
  activePlan: null,
  selectedMeal: null,
  dashboard: null,
  hasHydrated: false,
  isInitializing: false,
  isGenerating: false,
  isSwapping: false,
  error: null,
  showPaywall: false,
};
