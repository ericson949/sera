import { MealPlanRepository } from "../../domain/repositories/MealPlanRepository";
import { MealPlan } from "../../domain/entities/MealPlan";

export class GetMealPlanDetailsUseCase {
  constructor(private mealPlanRepo: MealPlanRepository) {}

  async execute(planId: string): Promise<MealPlan | null> {
    return this.mealPlanRepo.findById(planId);
  }
}
