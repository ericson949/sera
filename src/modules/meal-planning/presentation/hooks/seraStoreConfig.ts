import { DinneroState } from "./useDinneroStore.types";

export const DEFAULT_USER_ID = "guest_italy_user";
export const LOCALE_STORAGE_KEY = "sera_locale";
export const USAGE_STORAGE_KEY = "dinnero_usage_counters";

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
