import { AppLanguage } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";

export const LANGUAGE_OPTIONS: { value: AppLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "Francais" },
  { value: "it", label: "Italiano" },
];
