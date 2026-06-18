import { MealPlan } from "../entities/MealPlan";
import { Meal } from "../entities/Meal";

export interface MealPlanRepository {
  save(plan: MealPlan): Promise<void>;
  findById(id: string): Promise<MealPlan | null>;
  findCurrentByUserId(userId: string): Promise<MealPlan | null>;
  findSavedByUserId(userId: string): Promise<MealPlan[]>;
  updateMeal(planId: string, mealId: string, update: Partial<Meal>): Promise<MealPlan>;
}
