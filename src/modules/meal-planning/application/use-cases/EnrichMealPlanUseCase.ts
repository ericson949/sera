import { MealPlan } from "../../domain/entities/MealPlan";
import { MealPlanRepository } from "../../domain/repositories/MealPlanRepository";
import { MealPlanAIService } from "../../domain/services/MealPlanAIService";
import { createMoney } from "../../domain/value-objects/Money";

type JobQueuePort = {
  enqueue(id: string, task: () => Promise<void>): void;
};

export class EnrichMealPlanUseCase {
  constructor(
    private readonly repository: MealPlanRepository,
    private readonly aiService: MealPlanAIService,
    private readonly queue: JobQueuePort
  ) {}

  execute(plan: MealPlan, appLanguage: string, onUpdate: (plan: MealPlan) => void) {
    plan.days
      .filter((meal) => meal.enrichmentStatus !== "ready")
      .forEach((meal) => {
        this.queue.enqueue(`${plan.id}:${meal.id}`, async () => {
          await this.repository.updateMeal(plan.id, meal.id, { enrichmentStatus: "processing" });

          try {
            const [details, imageUrl] = await Promise.all([
              this.aiService.enrichMeal({
                mealTitle: meal.title,
                mealDescription: meal.description,
                shop: plan.shop,
                numberOfPeople: plan.peopleCount,
                appLanguage,
              }),
              this.aiService.generateMealImage(meal.title).catch(() => ""),
            ]);

            const updated = await this.repository.updateMeal(plan.id, meal.id, {
              ingredients: details.ingredients.map((ingredient) => ({
                ...ingredient,
                estimatedPrice: createMoney(ingredient.estimatedPrice),
              })),
              recipeSteps: details.recipeSteps,
              imageUrl,
              enrichmentStatus: "ready",
            });
            onUpdate(updated);
          } catch (error) {
            const updated = await this.repository.updateMeal(plan.id, meal.id, { enrichmentStatus: "failed" });
            onUpdate(updated);
            throw error;
          }
        });
      });
  }
}
