import { Meal } from "../entities/Meal";
import { ShoppingItem } from "../entities/ShoppingItem";
import { createMoney } from "../value-objects/Money";
import { ShoppingCategory, SHOPPING_CATEGORIES } from "../value-objects/ShoppingCategory";

export function buildShoppingList(days: Meal[], previous: ShoppingItem[]): ShoppingItem[] {
  const items = new Map<string, ShoppingItem>();

  days.forEach((meal) => meal.ingredients.forEach((ingredient) => {
    const key = ingredient.name.trim().toLowerCase();
    const existing = items.get(key);
    if (existing) {
      existing.estimatedPrice = createMoney(existing.estimatedPrice.amount + ingredient.estimatedPrice.amount);
      if (!existing.usedInMeals.includes(meal.day)) existing.usedInMeals.push(meal.day);
      return;
    }

    const oldItem = previous.find((item) => item.name.trim().toLowerCase() === key);
    const category = SHOPPING_CATEGORIES.includes(ingredient.category as ShoppingCategory)
      ? ingredient.category as ShoppingCategory
      : "Other";
    items.set(key, {
      id: oldItem?.id ?? `shop-item-${meal.id}-${items.size}`,
      name: ingredient.name,
      category,
      quantity: ingredient.quantity,
      estimatedPrice: ingredient.estimatedPrice,
      usedInMeals: [meal.day],
      checked: oldItem?.checked ?? false,
    });
  }));

  return [...items.values()];
}
