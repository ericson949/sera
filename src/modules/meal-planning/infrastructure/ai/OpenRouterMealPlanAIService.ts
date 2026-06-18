import {
  MealPlanAIService,
  GenerateMealPlanInput,
  GeneratedMealPlanDTO,
  GeneratedMealDTO,
  SwapMealInput,
} from "../../domain/services/MealPlanAIService";

export class OpenRouterMealPlanAIService implements MealPlanAIService {
  async generateMealPlan(input: GenerateMealPlanInput): Promise<GeneratedMealPlanDTO> {
    const locale = getStoredLocale();
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, ...locale }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to generate meal plan");
    }

    return res.json();
  }

  async swapMeal(input: SwapMealInput): Promise<GeneratedMealDTO> {
    const locale = getStoredLocale();
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, ...locale, action: "swap" }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to swap meal");
    }

    return res.json();
  }
}

function getStoredLocale() {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem("sera_locale") ?? localStorage.getItem("dinnero_locale");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}
