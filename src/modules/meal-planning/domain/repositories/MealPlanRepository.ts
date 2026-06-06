import { MealPlan } from "../entities/MealPlan";

export interface MealPlanRepository {
  save(plan: MealPlan): Promise<void>;
  findById(id: string): Promise<MealPlan | null>;
  findCurrentByUserId(userId: string): Promise<MealPlan | null>;
  findSavedByUserId(userId: string): Promise<MealPlan[]>;
}
