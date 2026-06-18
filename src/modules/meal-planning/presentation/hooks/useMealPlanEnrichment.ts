"use client";

import { useEffect, useRef } from "react";
import { useDinneroStore } from "./useDinneroStore";

const ENRICHMENT_START_DELAY_MS = 300;

export function useMealPlanEnrichment() {
  const activePlan = useDinneroStore((state) => state.activePlan);
  const appLanguage = useDinneroStore((state) => state.appLanguage);
  const enrichPlan = useDinneroStore((state) => state.enrichPlan);
  const startedPlanId = useRef<string | null>(null);

  useEffect(() => {
    if (!activePlan || startedPlanId.current === activePlan.id) return;
    startedPlanId.current = activePlan.id;
    const timeoutId = window.setTimeout(() => {
      enrichPlan(activePlan);
    }, ENRICHMENT_START_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [activePlan, appLanguage, enrichPlan]);
}
