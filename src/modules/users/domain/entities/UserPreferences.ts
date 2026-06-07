import { GroceryShop } from "@/modules/meal-planning/domain/value-objects/GroceryShop";
import { BudgetRange } from "@/modules/meal-planning/domain/value-objects/BudgetRange";
import { MealGoal } from "@/modules/meal-planning/domain/value-objects/MealGoal";
import { FoodVibe } from "@/modules/meal-planning/domain/value-objects/FoodVibe";
import { DietaryNeed } from "@/modules/meal-planning/domain/value-objects/DietaryNeed";
import { CookingTime } from "@/modules/meal-planning/domain/value-objects/CookingTime";

export type UserPreferences = {
  userId: string;
  shop: GroceryShop;
  weeklyBudget: BudgetRange;
  numberOfPeople: number;
  goal: MealGoal;
  vibes: FoodVibe[];
  dietaryNeeds: DietaryNeed[];
  maxCookingTime: CookingTime;
  kitchenItems: string[];
  batchCooking: boolean;
};
