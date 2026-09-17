import { PantryTier } from "@/modules/meal-planning/domain/value-objects/PantryTier";

export type { PantryTier };

export type Category =
  | "Butcher"
  | "Seafood"
  | "Produce"
  | "Dairy & Alternatives"
  | "Bakery"
  | "Pantry - Staples & Grains"
  | "Pantry - Condiments & Sauces"
  | "Pantry - Spices & Baking"
  | "Other";

export interface UserPreferences {
  householdSize: number;
  weeklyBudget: number;
  currency: "EUR" | "USD";
  dietaryRestrictions: string[];
  allergens: string[];
  cookingTimeLimit: number;
  knownPantryItems: string[];
  vibes: string[];
}

export interface ScaledIngredient {
  id: string;
  name: string;
  category: Category;
  quantityValue: number;
  unit: string;
  estimatedCost: number;
  isInPantry: boolean;
  pantryTier: PantryTier;
}

export interface PlannedMeal {
  recipeId: string;
  title: string;
  imageUrl: string;
  totalTime: number;
  estimatedCost: number;
  scaledIngredients: ScaledIngredient[];
  ratings: number;
  ratingsCount: number;
  vibes: string[];
}

export interface GeneratedPlan {
  meals: PlannedMeal[];
  targetBudget: number;
  totalCalculatedCost: number;
  currency: "EUR" | "USD";
  isOverBudget: boolean;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantityValue: number;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  imageUrl: string;
  totalTime: number;
  defaultServings: number;
  diet: string[];
  allergens: string[];
  vibes: string[];
  ingredients: RecipeIngredient[];
  ratings: number;
  ratingsCount: number;
}

export interface IngredientRef {
  id: string;
  name: string;
  category: Category;
  unitPrice: number;
  unit: string;
  pantryTier: PantryTier;
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function roundQuantity(value: number): number {
  return Math.round(value * 1000) / 1000;
}

