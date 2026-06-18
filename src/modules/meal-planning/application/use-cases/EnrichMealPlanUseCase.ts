import { MealPlan } from "../../domain/entities/MealPlan";
import { Meal } from "../../domain/entities/Meal";
import { MealPlanRepository } from "../../domain/repositories/MealPlanRepository";
import { MealPlanAIService } from "../../domain/services/MealPlanAIService";
import { createMoney } from "../../domain/value-objects/Money";

type JobQueuePort = {
  enqueue(id: string, task: () => Promise<void>, priority?: boolean): void;
};

export class EnrichMealPlanUseCase {
  constructor(
    private readonly repository: MealPlanRepository,
    private readonly aiService: MealPlanAIService,
    private readonly queue: JobQueuePort
  ) {}

  execute(plan: MealPlan, appLanguage: string, onUpdate: (plan: MealPlan) => void) {
    const pendingDetails = plan.days.filter((meal) => meal.enrichmentStatus !== "ready");
    const pendingImages = plan.days.filter((meal) => meal.imageStatus !== "ready" && !meal.imageUrl);

    pendingDetails.forEach((meal) => {
      this.enqueueDetails(plan, meal, appLanguage, onUpdate);
    });

    pendingImages.forEach((meal) => {
      this.queue.enqueue(`${plan.id}:${meal.id}:image`, async () => {
        await this.repository.updateMeal(plan.id, meal.id, { imageStatus: "processing" });
        try {
          const imageUrl = await this.aiService.generateMealImage(meal.title);
          const updated = await this.repository.updateMeal(plan.id, meal.id, { imageUrl, imageStatus: "ready" });
          onUpdate(updated);
        } catch {
          const updated = await this.repository.updateMeal(plan.id, meal.id, { imageStatus: "failed" });
          onUpdate(updated);
        }
      });
    });
  }

  executeMeal(plan: MealPlan, mealId: string, appLanguage: string, onUpdate: (plan: MealPlan) => void) {
    const meal = plan.days.find((candidate) => candidate.id === mealId);
    if (!meal || meal.enrichmentStatus === "ready") return;
    this.enqueueDetails(plan, meal, appLanguage, onUpdate, true);
  }

  private enqueueDetails(
    plan: MealPlan,
    meal: Meal,
    appLanguage: string,
    onUpdate: (plan: MealPlan) => void,
    priority = false
  ) {
    this.queue.enqueue(`${plan.id}:${meal.id}:details`, async () => {
        await this.repository.updateMeal(plan.id, meal.id, { enrichmentStatus: "processing" });

        try {
          const details = await this.aiService.enrichMeal({
            mealTitle: meal.title,
            mealDescription: meal.description,
            shop: plan.shop,
            numberOfPeople: plan.peopleCount,
            appLanguage,
          });

          const updated = await this.repository.updateMeal(plan.id, meal.id, {
            ingredients: details.ingredients.map((ingredient) => ({
              ...ingredient,
              estimatedPrice: createMoney(ingredient.estimatedPrice),
            })),
            recipeSteps: details.recipeSteps,
            enrichmentStatus: "ready",
          });
          onUpdate(updated);
        } catch (error) {
          const updated = await this.repository.updateMeal(plan.id, meal.id, { enrichmentStatus: "failed" });
          onUpdate(updated);
          throw error;
        }
      }, priority);
  }
}
