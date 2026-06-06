import {
  MealPlanAIService,
  GenerateMealPlanInput,
  GeneratedMealPlanDTO,
  GeneratedMealDTO,
  SwapMealInput,
} from "../../domain/services/MealPlanAIService";

export class OpenAIMealPlanAIService implements MealPlanAIService {
  async generateMealPlan(input: GenerateMealPlanInput): Promise<GeneratedMealPlanDTO> {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to generate meal plan");
    }

    return res.json();
  }

  async swapMeal(input: SwapMealInput): Promise<GeneratedMealDTO> {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, action: "swap" }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to swap meal");
    }

    return res.json();
  }
}
