import type { DinneroState } from "./useDinneroStore.types";

export const DEFAULT_USER_ID = "guest_italy_user";
export const LOCALE_STORAGE_KEY = "sera_locale";
export const ONBOARDING_DRAFT_STORAGE_KEY = "sera_onboarding_draft";
export const USAGE_STORAGE_KEY = "dinnero_usage_counters";

export type OnboardingDraft = Partial<Pick<
  DinneroState,
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
  | "appLanguage"
  | "appCountry"
>>;

export const getSavedLocale = (): Partial<Pick<DinneroState, "appLanguage" | "appCountry">> | null => {
  if (typeof window === "undefined") return null;

  try {
    const current = localStorage.getItem(LOCALE_STORAGE_KEY);
    const legacy = localStorage.getItem("dinnero_locale");
    return JSON.parse(current || legacy || "null");
  } catch {
    return null;
  }
};

export const getOnboardingDraft = (): OnboardingDraft | null => {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
};

export const saveOnboardingDraft = (draft: OnboardingDraft) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_DRAFT_STORAGE_KEY, JSON.stringify(draft));
};

export const clearOnboardingDraft = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
};

export const createOnboardingDraft = (state: DinneroState): OnboardingDraft => ({
  onboardingStep: state.onboardingStep,
  onboardingShop: state.onboardingShop,
  onboardingBudgetMin: state.onboardingBudgetMin,
  onboardingBudgetMax: state.onboardingBudgetMax,
  onboardingPeople: state.onboardingPeople,
  onboardingGoal: state.onboardingGoal,
  onboardingVibes: state.onboardingVibes,
  onboardingDietaryNeeds: state.onboardingDietaryNeeds,
  onboardingCookingTime: state.onboardingCookingTime,
  onboardingKitchenItems: state.onboardingKitchenItems,
  onboardingBatchCooking: state.onboardingBatchCooking,
  appLanguage: state.appLanguage,
  appCountry: state.appCountry,
});
