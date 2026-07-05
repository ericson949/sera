import { AppLanguage } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";

export const LANGUAGE_OPTIONS: { value: AppLanguage; label: string }[] = [
  { value: "en", label: "English" },
];

export const BETA_RESET_STORAGE_KEYS = [
  "dinnero_users",
  "dinnero_user_preferences",
  "dinnero_meal_plans",
  "dinnero_usage_counters",
  "sera_meal_executions",
  "sera_onboarding_draft",
  "sera_welcome_page",
];
