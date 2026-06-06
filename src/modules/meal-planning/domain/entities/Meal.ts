import { Money } from "../value-objects/Money";
import { WeekDay } from "../value-objects/WeekDay";

export type Ingredient = {
  name: string;
  quantity: string;
  estimatedPrice: Money;
};

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
};
