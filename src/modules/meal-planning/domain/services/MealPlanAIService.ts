import { GroceryShop } from "../value-objects/GroceryShop";
import { MealGoal } from "../value-objects/MealGoal";
import { FoodVibe } from "../value-objects/FoodVibe";
import { DietaryNeed } from "../value-objects/DietaryNeed";
import { CookingTime } from "../value-objects/CookingTime";
import { WeekDay } from "../value-objects/WeekDay";

export type GenerateMealPlanInput = {
  userId?: string;
  shop: GroceryShop;
  budgetMin: number;
  budgetMax: number;
  numberOfPeople: number;
  goal: MealGoal;
  vibes: FoodVibe[];
  dietaryNeeds: DietaryNeed[];
  maxCookingTime: CookingTime;
  kitchenItems: string[];
  batchCooking: boolean;
};

export type GeneratedIngredientDTO = {
  name: string;
  quantity: string;
  estimatedPrice: number;
};

export type GeneratedMealDTO = {
  title: string;
  description: string;
  imageUrl?: string;
  estimatedCost: number;
  calories: number;
  prepTimeMinutes: number;
  ingredients: GeneratedIngredientDTO[];
  recipeSteps: string[];
  whyThisMeal: string[];
};

export type GeneratedShoppingItemDTO = {
  name: string;
  category: string;
  quantity: string;
  estimatedPrice: number;
  usedInMeals: string[];
};

export type GeneratedMealPlanDTO = {
  estimatedTotal: number;
  estimatedMin: number;
  estimatedMax: number;
  budgetConfidence: number;
  budgetMessage: string;
  meals: (GeneratedMealDTO & { day: WeekDay })[];
  shoppingList: GeneratedShoppingItemDTO[];
};

export type SwapMealInput = {
  userId?: string;
  shop: GroceryShop;
  budgetMin: number;
  budgetMax: number;
  numberOfPeople: number;
  goal: MealGoal;
  vibes: FoodVibe[];
  dietaryNeeds: DietaryNeed[];
  maxCookingTime: CookingTime;
  kitchenItems: string[];
  batchCooking: boolean;
  dayToSwap: WeekDay;
  excludeTitles: string[];
};

export interface MealPlanAIService {
  generateMealPlan(input: GenerateMealPlanInput): Promise<GeneratedMealPlanDTO>;
  swapMeal(input: SwapMealInput): Promise<GeneratedMealDTO>;
}
