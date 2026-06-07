"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DietaryNeed } from "../../domain/value-objects/DietaryNeed";
import { FoodVibe } from "../../domain/value-objects/FoodVibe";
import { getCopy } from "@/shared/i18n";
import { getProductCopy } from "@/shared/seraProductCopy";
import { useDinneroStore } from "./useDinneroStore";
import { useSeraLocaleDetection } from "./useSeraLocaleDetection";

export function useOnboardingFlow() {
  const router = useRouter();
  const store = useDinneroStore();
  const copy = getCopy(store.appLanguage);
  const productCopy = getProductCopy(store.appLanguage);
  const onboardingCopy = productCopy.onboarding;
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  const {
    onboardingStep,
    onboardingVibes,
    onboardingDietaryNeeds,
    onboardingKitchenItems,
    setOnboardingField,
    nextStep,
    generatePlan,
    resetOnboarding,
  } = store;

  useSeraLocaleDetection(setOnboardingField);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (onboardingStep === 10) {
      interval = setInterval(() => setLoadingStepIdx((prev) => Math.min(prev + 1, onboardingCopy.loadingPhrases.length - 1)), 700);
    } else {
      setLoadingStepIdx(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [onboardingCopy.loadingPhrases.length, onboardingStep]);

  useEffect(() => {
    if (onboardingStep !== 10) return;
    generatePlan().then(() => router.push("/results"));
  }, [onboardingStep, generatePlan, router]);

  const startQuestions = () => {
    resetOnboarding();
    nextStep();
  };

  const toggleVibe = (vibe: FoodVibe) => {
    const current = [...onboardingVibes];
    setOnboardingField(
      "onboardingVibes",
      current.includes(vibe) ? current.filter((item) => item !== vibe) : current.length < 3 ? [...current, vibe] : current
    );
  };

  const toggleDiet = (diet: DietaryNeed) => {
    if (diet === "None") {
      setOnboardingField("onboardingDietaryNeeds", ["None"]);
      return;
    }
    const withoutNone = onboardingDietaryNeeds.filter((item) => item !== "None");
    const next = withoutNone.includes(diet) ? withoutNone.filter((item) => item !== diet) : [...withoutNone, diet];
    setOnboardingField("onboardingDietaryNeeds", next.length ? next : ["None"]);
  };

  const toggleKitchenItem = (item: string) => {
    setOnboardingField(
      "onboardingKitchenItems",
      onboardingKitchenItems.includes(item) ? onboardingKitchenItems.filter((value) => value !== item) : [...onboardingKitchenItems, item]
    );
  };

  return { store, copy, productCopy, onboardingCopy, loadingStepIdx, startQuestions, toggleVibe, toggleDiet, toggleKitchenItem };
}
