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

    const candidateMeals = candidateRecipes
      .map((recipe) => this.calculateRecipeCost(recipe, preferences))
      .filter((meal): meal is PlannedMeal => meal !== null);
    
    if (candidateMeals.length < 7) {
      throw new Error("Not enough candidate recipes with valid ingredient references to generate a weekly meal plan.");
    }

    // Map candidate meals with a small random jitter and a soft vibe priority bonus to vary the search order
    const sortedMeals = [...candidateMeals]
      .map((meal) => {
        const hasMatchingVibe = preferences.vibes && preferences.vibes.length > 0
          ? meal.vibes.some((vibe) => preferences.vibes.includes(vibe))
          : false;
        const vibeBonus = hasMatchingVibe ? 0.5 : 0.0;

        return {
          meal,
          score: meal.ratings + vibeBonus + (Math.random() - 0.5) * 0.4, // Jitter of ±0.2 stars
        };
      })
      .sort((a, b) => b.score - a.score || b.meal.ratingsCount - a.meal.ratingsCount)
      .map((item) => item.meal);

    // 1. Try to find a plan within the top 30 highest-rated meals first
    const top30Pool = sortedMeals.slice(0, Math.min(sortedMeals.length, 30));
    let bestUnderBudget = this.findBestUnderBudgetPlan(top30Pool, preferences.weeklyBudget);

    // 2. If that fails, expand pool to the top 50 highest-rated meals
    if (!bestUnderBudget && sortedMeals.length > 30) {
      const top50Pool = sortedMeals.slice(0, Math.min(sortedMeals.length, 50));
      bestUnderBudget = this.findBestUnderBudgetPlan(top50Pool, preferences.weeklyBudget);
    }

    // 3. If that also fails, fall back to searching a larger pool capped at 80
    if (!bestUnderBudget && sortedMeals.length > 50) {
      const top80Pool = sortedMeals.slice(0, Math.min(sortedMeals.length, 80));
      bestUnderBudget = this.findBestUnderBudgetPlan(top80Pool, preferences.weeklyBudget);
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

  private calculateRecipeCost(recipe: Recipe, preferences: UserPreferences): PlannedMeal | null {
    const scaleFactor = preferences.householdSize / (recipe.defaultServings || 4);

    const scaledIngredients: ScaledIngredient[] = [];
    for (const ingredient of recipe.ingredients) {
      const reference = this.ingredientRefById.get(ingredient.ingredientId);
      if (!reference) {
        // Safe fallback: exclude the entire recipe from compilation if an ingredient reference is missing
        return null;
      }

      const quantityValue = roundQuantity(ingredient.quantityValue * scaleFactor);
      const isInPantry = preferences.knownPantryItems.includes(ingredient.ingredientId);
      const estimatedCost = isInPantry ? 0 : roundMoney(quantityValue * reference.unitPrice);

      scaledIngredients.push({
        id: ingredient.ingredientId,
        name: reference.name,
        category: reference.category,
        quantityValue,
        unit: ingredient.unit || reference.unit,
        estimatedCost,
        isInPantry,
      });
    }

    return {
      recipeId: recipe.id,
      title: recipe.title,
      imageUrl: recipe.imageUrl,
      totalTime: recipe.totalTime,
      estimatedCost: roundMoney(scaledIngredients.reduce((sum, ingredient) => sum + ingredient.estimatedCost, 0)),
      scaledIngredients,
      ratings: recipe.ratings || 0,
      ratingsCount: recipe.ratingsCount || 0,
      vibes: recipe.vibes || [],
    };
  }

  private findBestUnderBudgetPlan(meals: PlannedMeal[], weeklyBudget: number): PlannedMeal[] | null {
    const targetLength = 7;
    
    // Shuffle the candidate pool using Fisher-Yates shuffle to ensure maximum variety
    const shuffled = shuffle(meals);

    const validPlans: PlannedMeal[][] = [];
    
    // Trackers for incremental cost calculations
    const currentQuantities = new Map<string, number>();
    let currentCost = 0;

    const addMealToCost = (meal: PlannedMeal) => {
      let costDiff = 0;
      for (const ing of meal.scaledIngredients) {
        if (ing.isInPantry) continue;
        const ref = this.ingredientRefById.get(ing.id);
        if (!ref) continue;

        const oldQty = currentQuantities.get(ing.id) || 0;
        const newQty = oldQty + ing.quantityValue;

        const oldPackages = Math.ceil(oldQty > 1e-9 ? oldQty : 0);
        const newPackages = Math.ceil(newQty > 1e-9 ? newQty : 0);

        costDiff += (newPackages - oldPackages) * ref.unitPrice;
        currentQuantities.set(ing.id, newQty);
      }
      currentCost = roundMoney(currentCost + costDiff);
    };

    const removeMealFromCost = (meal: PlannedMeal) => {
      let costDiff = 0;
      for (const ing of meal.scaledIngredients) {
        if (ing.isInPantry) continue;
        const ref = this.ingredientRefById.get(ing.id);
        if (!ref) continue;

        const oldQty = currentQuantities.get(ing.id) || 0;
        let newQty = oldQty - ing.quantityValue;
        if (newQty < 1e-9) {
          newQty = 0;
        }

        const oldPackages = Math.ceil(oldQty > 1e-9 ? oldQty : 0);
        const newPackages = Math.ceil(newQty > 1e-9 ? newQty : 0);

        costDiff += (newPackages - oldPackages) * ref.unitPrice;

        if (newQty === 0) {
          currentQuantities.delete(ing.id);
        } else {
          currentQuantities.set(ing.id, newQty);
        }
      }
      currentCost = roundMoney(currentCost + costDiff);
    };

    let nodesVisited = 0;
    const maxNodes = 5000;

    const backtrack = (startIndex: number, currentSelection: PlannedMeal[]): boolean => {
      nodesVisited++;
      if (nodesVisited > maxNodes) {
        return true; // Exceeded search budget, stop search early to prevent server hang
      }

      if (currentSelection.length === targetLength) {
        validPlans.push([...currentSelection]);
        return validPlans.length >= 30; // Collect up to 30 valid plans
      }

      for (let i = startIndex; i < shuffled.length; i++) {
        const meal = shuffled[i];
        
        currentSelection.push(meal);
        addMealToCost(meal);

        if (currentCost <= weeklyBudget) {
          const stop = backtrack(i + 1, currentSelection);
          if (stop) return true;
        }

        removeMealFromCost(meal);
        currentSelection.pop();
      }
      return false;
    };

    backtrack(0, []);

    if (validPlans.length === 0) return null;

    // Helper to count unique ingredients to buy for a plan
    const getUniqueIngredientCount = (planMeals: PlannedMeal[]): number => {
      const uniqueIds = new Set<string>();
      for (const m of planMeals) {
        for (const ing of m.scaledIngredients) {
          if (!ing.isInPantry) {
            uniqueIds.add(ing.id);
          }
        }
      }
      return uniqueIds.size;
    };

    // Find the plan with the minimum number of unique ingredients to buy
    let bestPlan = validPlans[0];
    let minIngredients = getUniqueIngredientCount(bestPlan);

    for (let i = 1; i < validPlans.length; i++) {
      const plan = validPlans[i];
      const count = getUniqueIngredientCount(plan);
      if (count < minIngredients) {
        minIngredients = count;
        bestPlan = plan;
      }
    }

    return bestPlan;
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
