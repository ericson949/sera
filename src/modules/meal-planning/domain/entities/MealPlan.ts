import { GroceryShop } from "../value-objects/GroceryShop";
import { BudgetRange } from "../value-objects/BudgetRange";
import { Money } from "../value-objects/Money";
import { Meal } from "./Meal";
import { ShoppingItem } from "./ShoppingItem";

export type MealPlan = {
  id: string;
  userId: string;
  shop: GroceryShop;
  budget: BudgetRange;
  estimatedTotal: Money;
  estimatedMin: Money;
  estimatedMax: Money;
  budgetConfidence: number;
  peopleCount: number;
  days: Meal[];
  shoppingList: ShoppingItem[];
  saved?: boolean;
  createdAt: Date;
};
