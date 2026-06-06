import { MealPlanRepository } from "../../domain/repositories/MealPlanRepository";
import { MealPlan } from "../../domain/entities/MealPlan";

export class ToggleShoppingItemUseCase {
  constructor(private mealPlanRepo: MealPlanRepository) {}

  async execute(userId: string, itemId: string): Promise<MealPlan> {
    const plan = await this.mealPlanRepo.findCurrentByUserId(userId);
    if (!plan) {
      throw new Error("No active meal plan found.");
    }

    const updatedList = plan.shoppingList.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );

    const updatedPlan: MealPlan = {
      ...plan,
      shoppingList: updatedList,
    };

    await this.mealPlanRepo.save(updatedPlan);
    return updatedPlan;
  }
}
