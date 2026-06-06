import { MealPlanRepository } from "../../domain/repositories/MealPlanRepository";
import { SubscriptionService } from "@/modules/subscriptions/domain/services/SubscriptionService";
import { MealPlan } from "../../domain/entities/MealPlan";

export class SaveMealPlanUseCase {
  constructor(
    private mealPlanRepo: MealPlanRepository,
    private subService: SubscriptionService
  ) {}

  async execute(userId: string, planId: string): Promise<MealPlan> {
    const canSave = await this.subService.canSavePlan(userId);
    if (!canSave) {
      throw new Error("Saving meal plans is a premium feature. Please upgrade to Pro.");
    }

    const plan = await this.mealPlanRepo.findById(planId);
    if (!plan) {
      throw new Error("Meal plan not found.");
    }

    const updatedPlan: MealPlan = {
      ...plan,
      saved: true,
    };

    await this.mealPlanRepo.save(updatedPlan);
    return updatedPlan;
  }
}
