import { Meal } from "../entities/Meal";
import { ShoppingItem } from "../entities/ShoppingItem";
import { createMoney } from "../value-objects/Money";
import { ShoppingCategory, SHOPPING_CATEGORIES } from "../value-objects/ShoppingCategory";

function mapDbCategoryToShoppingCategory(dbCat: string | undefined): ShoppingCategory {
  if (!dbCat) return "Other";
  const cat = dbCat.trim().toLowerCase();
  
  if (cat.includes("produce") || cat.includes("vegetable") || cat.includes("fruit")) {
    return "Vegetables";
  }
  if (cat.includes("butcher") || cat.includes("seafood") || cat.includes("meat") || cat.includes("fish") || cat.includes("chicken")) {
    return "Meat & Fish";
  }
  if (cat.includes("dairy") || cat.includes("egg") || cat.includes("cheese") || cat.includes("milk")) {
    return "Dairy";
  }
  if (cat.includes("spice") || cat.includes("herb") || cat.includes("baking")) {
    return "Spices";
  }
  if (cat.includes("frozen")) {
    return "Frozen";
  }
  if (cat.includes("pantry") || cat.includes("grain") || cat.includes("sauce") || cat.includes("staple") || cat.includes("bakery") || cat.includes("bread")) {
    return "Pantry";
  }
  return "Other";
}

function parseQuantity(qStr: string): { value: number; unit: string } {
  const match = qStr.trim().match(/^([\d.]+)\s*(.*)$/);
  if (!match) return { value: 0, unit: "" };
  return { value: parseFloat(match[1]), unit: match[2].trim() };
}

export function buildShoppingList(days: Meal[], previous: ShoppingItem[]): ShoppingItem[] {
  const items = new Map<string, ShoppingItem>();

  days.forEach((meal) => meal.ingredients.forEach((ingredient) => {
    const key = ingredient.name.trim().toLowerCase();
    const existing = items.get(key);
    if (existing) {
      existing.estimatedPrice = createMoney(existing.estimatedPrice.amount + ingredient.estimatedPrice.amount);
      if (!existing.usedInMeals.includes(meal.day)) existing.usedInMeals.push(meal.day);
      
      // Aggregate quantities if units match
      const p1 = parseQuantity(existing.quantity);
      const p2 = parseQuantity(ingredient.quantity);
      if (p1.unit === p2.unit && p1.value > 0 && p2.value > 0) {
        existing.quantity = `${p1.value + p2.value} ${p1.unit}`;
      } else {
        existing.quantity = `${existing.quantity} + ${ingredient.quantity}`;
      }
      return;
    }

    const oldItem = previous.find((item) => item.name.trim().toLowerCase() === key);
    const category = mapDbCategoryToShoppingCategory(ingredient.category);
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
