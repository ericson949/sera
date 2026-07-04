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
}

export interface PlannedMeal {
  recipeId: string;
  title: string;
  imageUrl: string;
  totalTime: number;
  estimatedCost: number;
  scaledIngredients: ScaledIngredient[];
}

export interface GeneratedPlan {
  meals: PlannedMeal[];
  targetBudget: number;
  totalCalculatedCost: number;
  currency: string;
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
}

export interface IngredientRef {
  id: string;
  name: string;
  category: Category;
  unitPrice: number;
  unit: string;
}

export class MealPlanEngine {
  private ingredientRefById: Map<string, IngredientRef>;

  constructor(
    private recipes: Recipe[],
    ingredientsRefList: IngredientRef[]
  ) {
    this.ingredientRefById = new Map(ingredientsRefList.map((ingredient) => [ingredient.id, ingredient]));
  }

  generatePlan(preferences: UserPreferences): GeneratedPlan {
    const candidateRecipes = this.recipes.filter((recipe) => this.matchesStrictFilters(recipe, preferences));
    if (candidateRecipes.length < 7) {
      throw new Error("Not enough candidate recipes to generate a weekly meal plan.");
    }

    const candidateMeals = candidateRecipes.map((recipe) => this.calculateRecipeCost(recipe, preferences));
    const bestUnderBudget = this.findBestUnderBudgetPlan(candidateMeals, preferences.weeklyBudget);
    const meals = bestUnderBudget ?? candidateMeals.sort((a, b) => a.estimatedCost - b.estimatedCost).slice(0, 7);
    const totalCalculatedCost = roundMoney(meals.reduce((sum, meal) => sum + meal.estimatedCost, 0));

    return {
      meals,
      targetBudget: preferences.weeklyBudget,
      totalCalculatedCost,
      currency: preferences.currency,
      isOverBudget: totalCalculatedCost > preferences.weeklyBudget,
    };
  }

  private matchesStrictFilters(recipe: Recipe, preferences: UserPreferences) {
    if (recipe.totalTime > preferences.cookingTimeLimit) return false;
    if (!preferences.dietaryRestrictions.every((restriction) => recipe.diet.includes(restriction))) return false;
    return !recipe.allergens.some((allergen) => preferences.allergens.includes(allergen));
  }

  private calculateRecipeCost(recipe: Recipe, preferences: UserPreferences): PlannedMeal {
    const scaleFactor = preferences.householdSize / recipe.defaultServings;

    const scaledIngredients = recipe.ingredients.map((ingredient) => {
      const reference = this.ingredientRefById.get(ingredient.ingredientId);
      if (!reference) {
        throw new Error(`Missing ingredient reference for ${ingredient.ingredientId}.`);
      }

      const quantityValue = roundQuantity(ingredient.quantityValue * scaleFactor);
      const isInPantry = preferences.knownPantryItems.includes(ingredient.ingredientId);
      const estimatedCost = isInPantry ? 0 : roundMoney(quantityValue * reference.unitPrice);

      return {
        id: ingredient.ingredientId,
        name: reference.name,
        category: reference.category,
        quantityValue,
        unit: ingredient.unit || reference.unit,
        estimatedCost,
        isInPantry,
      };
    });

    return {
      recipeId: recipe.id,
      title: recipe.title,
      imageUrl: recipe.imageUrl,
      totalTime: recipe.totalTime,
      estimatedCost: roundMoney(scaledIngredients.reduce((sum, ingredient) => sum + ingredient.estimatedCost, 0)),
      scaledIngredients,
    };
  }

  private findBestUnderBudgetPlan(meals: PlannedMeal[], weeklyBudget: number) {
    let bestPlan: PlannedMeal[] | null = null;
    let bestTotal = -1;

    for (let attempt = 0; attempt < 100; attempt++) {
      const selected: PlannedMeal[] = [];
      let total = 0;

      for (const meal of shuffle(meals)) {
        if (selected.length === 7) break;
        const nextTotal = total + meal.estimatedCost;
        if (nextTotal <= weeklyBudget) {
          selected.push(meal);
          total = nextTotal;
        }
      }

      if (selected.length === 7 && total > bestTotal) {
        bestPlan = selected;
        bestTotal = total;
      }
    }

    return bestPlan;
  }
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function roundQuantity(value: number) {
  return Math.round(value * 1000) / 1000;
}
