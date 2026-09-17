import { Money } from "../value-objects/Money";
import { WeekDay } from "../value-objects/WeekDay";
import { PantryTier } from "../value-objects/PantryTier";

export type Ingredient = {
  name: string;
  quantity: string;
  estimatedPrice: Money;
  category?: string;
  pantryTier?: PantryTier;
};

export type EnrichmentStatus = "pending" | "processing" | "ready" | "failed";

export type Meal = {
  id: string;
  day: WeekDay;
  title: string;
  description: string;
  estimatedCost: Money;
  calories: number;
  prepTimeMinutes: number;
  ingredients: Ingredient[];
  recipeSteps: string[];
  whyThisMeal: string[];
  imageUrl?: string;
  recipeId?: string;
  ratings?: number;
  ratingsCount?: number;
  enrichmentStatus?: EnrichmentStatus;
  imageStatus?: EnrichmentStatus;
  category?: string;
};
