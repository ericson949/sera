import { useEffect } from "react";
import { AppCountry, AppLanguage } from "./useDinneroStore";

export const SERA_COUNTRIES: { value: AppCountry; label: string; flag: string; defaultShop: string; language: AppLanguage }[] = [
  { value: "UK", label: "UK", flag: "🇬🇧", defaultShop: "Aldi", language: "en" },
  { value: "France", label: "France", flag: "🇫🇷", defaultShop: "Carrefour", language: "en" },
  { value: "Italy", label: "Italy", flag: "🇮🇹", defaultShop: "Lidl", language: "en" },
  { value: "US", label: "US", flag: "🇺🇸", defaultShop: "Aldi", language: "en" },
];

export const getCountryConfig = (country: AppCountry) =>
  SERA_COUNTRIES.find((item) => item.value === country) ?? SERA_COUNTRIES[2];

const detectCountry = (): AppCountry => {
  if (typeof navigator === "undefined") return "Italy";

  const locale = navigator.language.toLowerCase();
  if (locale.includes("fr")) return "France";
  if (locale.includes("it")) return "Italy";
  if (locale.includes("gb") || locale.includes("en-gb")) return "UK";
  if (locale.includes("us") || locale.includes("en-us")) return "US";
  return "Italy";
};

export function useSeraLocaleDetection(setOnboardingField: (key: string, value: unknown) => void) {
  useEffect(() => {
    const config = getCountryConfig(detectCountry());
    setOnboardingField("appCountry", config.value);
    setOnboardingField("appLanguage", config.language);
    setOnboardingField("onboardingShop", config.defaultShop);
  }, [setOnboardingField]);
}
