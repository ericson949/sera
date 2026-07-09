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
  ratings: number;
  ratingsCount: number;
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
    
    // Map candidate meals with a small random jitter to ratings to vary the search order on each generation
    const sortedMeals = [...candidateMeals]
      .map((meal) => ({
        meal,
        score: meal.ratings + (Math.random() - 0.5) * 0.4, // Jitter of ±0.2 stars
      }))
      .sort((a, b) => b.score - a.score || b.meal.ratingsCount - a.meal.ratingsCount)
      .map((item) => item.meal);

    // 1. Try to find a plan within the top 15 highest-rated meals first
    const top15Pool = sortedMeals.slice(0, Math.min(sortedMeals.length, 15));
    let bestUnderBudget = this.findBestUnderBudgetPlan(top15Pool, preferences.weeklyBudget);

    // 2. If that fails, expand pool to the top 25 highest-rated meals
    if (!bestUnderBudget && sortedMeals.length > 15) {
      const top25Pool = sortedMeals.slice(0, Math.min(sortedMeals.length, 25));
      bestUnderBudget = this.findBestUnderBudgetPlan(top25Pool, preferences.weeklyBudget);
    }

    // 3. If that also fails, fall back to searching all candidates
    if (!bestUnderBudget && sortedMeals.length > 25) {
      bestUnderBudget = this.findBestUnderBudgetPlan(sortedMeals, preferences.weeklyBudget);
    }

    // 4. If budget solving still fails, pick the 7 cheapest meals to respect budget as much as possible
    const meals = bestUnderBudget ?? [...candidateMeals].sort((a, b) => a.estimatedCost - b.estimatedCost).slice(0, 7);
    const totalCalculatedCost = this.calculatePlanCheckoutCost(meals);

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
      ratings: recipe.ratings || 0,
      ratingsCount: recipe.ratingsCount || 0,
    };
  }

  private findBestUnderBudgetPlan(meals: PlannedMeal[], weeklyBudget: number): PlannedMeal[] | null {
    const targetLength = 7;
    const validPlans: PlannedMeal[][] = [];

    // Keep the incoming jittered sort order
    const sorted = [...meals];

    const backtrack = (startIndex: number, currentSelection: PlannedMeal[]): boolean => {
      if (currentSelection.length === targetLength) {
        validPlans.push([...currentSelection]);
        return validPlans.length >= 10; // Stop searching once we have 10 valid plans
      }

      for (let i = startIndex; i < sorted.length; i++) {
        const meal = sorted[i];
        currentSelection.push(meal);

        const cost = this.calculatePlanCheckoutCost(currentSelection);
        if (cost <= weeklyBudget) {
          const stop = backtrack(i + 1, currentSelection);
          if (stop) return true;
        }

        currentSelection.pop();
      }
      return false;
    };

    backtrack(0, []);

    if (validPlans.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * validPlans.length);
    return validPlans[randomIndex];
  }

  private calculatePlanCheckoutCost(meals: PlannedMeal[]): number {
    const groupedQuantities = new Map<string, { quantity: number; unitPrice: number }>();
    
    for (const meal of meals) {
      for (const ing of meal.scaledIngredients) {
        if (ing.isInPantry) continue;
        const ref = this.ingredientRefById.get(ing.id);
        if (!ref) continue;
        
        const existing = groupedQuantities.get(ing.id);
        if (existing) {
          existing.quantity += ing.quantityValue;
        } else {
          groupedQuantities.set(ing.id, {
            quantity: ing.quantityValue,
            unitPrice: ref.unitPrice
          });
        }
      }
    }
    
    let totalCost = 0;
    for (const [_, item] of groupedQuantities) {
      const unitsToBuy = Math.ceil(item.quantity);
      totalCost += unitsToBuy * item.unitPrice;
    }
    
    return roundMoney(totalCost);
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
