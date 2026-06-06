"use client";

import { useEffect, useState } from "react";
import { AppLanguage } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";

export function useStoredLanguage() {
  const [language, setLanguage] = useState<AppLanguage>("en");

  useEffect(() => {
    const stored = localStorage.getItem("sera_locale") ?? localStorage.getItem("dinnero_locale");
    if (stored) {
      const parsed = JSON.parse(stored) as { appLanguage?: AppLanguage };
      if (parsed.appLanguage) {
        setLanguage(parsed.appLanguage);
        return;
      }
    }

    const browser = navigator.language.toLowerCase();
    setLanguage(browser.startsWith("fr") ? "fr" : browser.startsWith("it") ? "it" : "en");
  }, []);

  return language;
}
