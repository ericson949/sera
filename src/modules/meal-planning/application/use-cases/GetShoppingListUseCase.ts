import { MealPlanRepository } from "../../domain/repositories/MealPlanRepository";
import { ShoppingItem } from "../../domain/entities/ShoppingItem";

export class GetShoppingListUseCase {
  constructor(private mealPlanRepo: MealPlanRepository) {}

  async execute(userId: string): Promise<ShoppingItem[]> {
    const plan = await this.mealPlanRepo.findCurrentByUserId(userId);
    return plan ? plan.shoppingList : [];
  }
}
