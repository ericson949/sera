import { MealPlanRepository } from "../../domain/repositories/MealPlanRepository";
import { MealPlan } from "../../domain/entities/MealPlan";

export class GetCurrentMealPlanUseCase {
  constructor(private mealPlanRepo: MealPlanRepository) {}

  async execute(userId: string): Promise<MealPlan | null> {
    return this.mealPlanRepo.findCurrentByUserId(userId);
  }
}
