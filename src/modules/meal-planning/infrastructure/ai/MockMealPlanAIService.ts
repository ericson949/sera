import {
  GenerateMealPlanInput,
  GeneratedMealDTO,
  GeneratedMealPlanDTO,
  MealPlanAIService,
  SwapMealInput,
  EnrichMealInput,
  EnrichedMealDTO,
} from "../../domain/services/MealPlanAIService";
import { WeekDay } from "../../domain/value-objects/WeekDay";
import { MockRecipe, RECIPE_LIBRARY } from "./mockRecipeLibrary";

type ShoppingAccumulator = {
  name: string;
  category: string;
  totalPrice: number;
  qtySum: number;
  qtyUnit: string;
  usedIn: string[];
};

const WEEKDAYS: WeekDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockMealPlanAIService implements MealPlanAIService {
  private getStoreMultiplier(shop: string): number {
    switch (shop) {
      case "Eurospin":
        return 0.8;
      case "Lidl":
      case "MD":
        return 0.85;
      case "Aldi":
        return 0.9;
      case "Conad":
      case "Coop":
        return 1.0;
      case "Esselunga":
      case "Carrefour":
        return 1.1;
      default:
        return 1.0;
    }
  }

  private filterRecipes(dietaryNeeds: string[], maxTime: string): MockRecipe[] {
    return RECIPE_LIBRARY.filter((recipe) => {
      if (dietaryNeeds.includes("Vegetarian") && !recipe.isVegetarian) return false;
      if (dietaryNeeds.includes("Vegan") && !recipe.isVegan) return false;
      if (dietaryNeeds.includes("Gluten-free") && !recipe.isGlutenFree) return false;
      if (dietaryNeeds.includes("Lactose-free") && !recipe.isLactoseFree) return false;
      if (dietaryNeeds.includes("Halal") && !recipe.isHalal) return false;
      if (dietaryNeeds.includes("Pescatarian") && !recipe.isPescatarian) return false;
      if (maxTime === "15 min" && recipe.prepTime > 15) return false;
      if (maxTime === "30 min" && recipe.prepTime > 30) return false;
      if (maxTime === "45 min" && recipe.prepTime > 45) return false;
      if (maxTime === "60 min" && recipe.prepTime > 60) return false;
      return true;
    });
  }

  async generateMealPlan(input: GenerateMealPlanInput): Promise<GeneratedMealPlanDTO> {
    await delay(2000);

    const shopMultiplier = this.getStoreMultiplier(input.shop);
    const peopleMultiplier = this.getPeopleMultiplier(input.numberOfPeople);
    const availableRecipes = [...this.getAvailableRecipes(input)].sort(() => Math.random() - 0.5);
    const meals = WEEKDAYS.map((day, index) =>
      this.createMeal(day, availableRecipes[index % availableRecipes.length], input, shopMultiplier, peopleMultiplier)
    );
    const estimatedTotal = meals.reduce((sum, meal) => sum + meal.estimatedCost, 0);
    const finalTotal = Math.round(estimatedTotal * 0.9 * 100) / 100;
    const confidence = this.getBudgetConfidence(finalTotal, input);

    return {
      estimatedTotal: finalTotal,
      estimatedMin: Math.round(finalTotal * 0.9 * 100) / 100,
      estimatedMax: Math.round(finalTotal * 1.1 * 100) / 100,
      budgetConfidence: confidence.value,
      budgetMessage: confidence.message,
      meals: meals.map((meal) => ({ ...meal, ingredients: [], recipeSteps: [] })),
      shoppingList: [],
    };
  }

  async swapMeal(input: SwapMealInput): Promise<GeneratedMealDTO> {
    await delay(1000);

    const shopMultiplier = this.getStoreMultiplier(input.shop);
    const peopleMultiplier = this.getPeopleMultiplier(input.numberOfPeople);
    const candidateRecipes = this.filterRecipes(input.dietaryNeeds, input.maxCookingTime).filter(
      (recipe) => {
        const id = `mock_recipe_${recipe.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        return (!input.excludeIds || !input.excludeIds.includes(id)) && !input.excludeTitles.includes(recipe.title);
      }
    );
    const recipe = this.pickRecipe(candidateRecipes.length > 0 ? candidateRecipes : RECIPE_LIBRARY);

    return { ...this.createMeal(undefined, recipe, input, shopMultiplier, peopleMultiplier), ingredients: [], recipeSteps: [] };
  }

  async generateMealImage(mealTitle: string): Promise<string> {
    void mealTitle;
    await delay(500);
    return "";
  }

  async enrichMeal(input: EnrichMealInput): Promise<EnrichedMealDTO> {
    await delay(1000);
    const recipe = RECIPE_LIBRARY.find((r) => r.title.toLowerCase() === input.mealTitle.toLowerCase()) ?? RECIPE_LIBRARY[0];
    const shopMultiplier = this.getStoreMultiplier(input.shop);
    const peopleMultiplier = this.getPeopleMultiplier(input.numberOfPeople);

    return {
      ingredients: recipe.ingredients.map((ingredient) =>
        ({ ...this.scaleIngredient(ingredient, shopMultiplier, peopleMultiplier), category: ingredient.category })
      ),
      recipeSteps: recipe.steps,
    };
  }

  private getAvailableRecipes(input: GenerateMealPlanInput): MockRecipe[] {
    const filteredRecipes = this.filterRecipes(input.dietaryNeeds, input.maxCookingTime);
    return filteredRecipes.length > 0 ? filteredRecipes : RECIPE_LIBRARY;
  }

  private getPeopleMultiplier(numberOfPeople: number): number {
    return 0.7 + 0.3 * numberOfPeople;
  }

  private pickRecipe(recipes: MockRecipe[]): MockRecipe {
    return recipes[Math.floor(Math.random() * recipes.length)];
  }

  private createMeal(
    day: WeekDay,
    recipe: MockRecipe,
    input: GenerateMealPlanInput | SwapMealInput,
    shopMultiplier: number,
    peopleMultiplier: number
  ): GeneratedMealDTO & { day: WeekDay };

  private createMeal(
    day: undefined,
    recipe: MockRecipe,
    input: GenerateMealPlanInput | SwapMealInput,
    shopMultiplier: number,
    peopleMultiplier: number
  ): GeneratedMealDTO;

  private createMeal(
    day: WeekDay | undefined,
    recipe: MockRecipe,
    input: GenerateMealPlanInput | SwapMealInput,
    shopMultiplier: number,
    peopleMultiplier: number
  ): GeneratedMealDTO & { day?: WeekDay } {
    const meal = {
      title: recipe.title,
      description: recipe.description,
      estimatedCost: Math.round(recipe.baseCost * shopMultiplier * peopleMultiplier * 100) / 100,
      calories: recipe.calories,
      prepTimeMinutes: recipe.prepTime,
      ingredients: recipe.ingredients.map((ingredient) =>
        this.scaleIngredient(ingredient, shopMultiplier, peopleMultiplier)
      ),
      recipeSteps: recipe.steps,
      whyThisMeal: this.createMealReasons(recipe, input),
      recipeId: `mock_recipe_${recipe.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
    };

    return day ? { day, ...meal } : meal;
  }

  private scaleIngredient(
    ingredient: MockRecipe["ingredients"][number],
    shopMultiplier: number,
    peopleMultiplier: number
  ): GeneratedMealDTO["ingredients"][number] {
    return {
      name: ingredient.name,
      estimatedPrice: Math.round(ingredient.basePrice * shopMultiplier * peopleMultiplier * 100) / 100,
      quantity: this.scaleQuantity(ingredient.baseQty, peopleMultiplier),
    };
  }

  private scaleQuantity(baseQty: string, peopleMultiplier: number): string {
    if (baseQty.endsWith("g")) return `${Math.round(parseInt(baseQty) * peopleMultiplier)}g`;
    if (baseQty.endsWith("ml")) return `${Math.round(parseInt(baseQty) * peopleMultiplier)}ml`;

    const count = parseFloat(baseQty);
    return Number.isNaN(count) ? baseQty : `${Math.max(1, Math.round(count * peopleMultiplier))}`;
  }

  private createMealReasons(recipe: MockRecipe, input: GenerateMealPlanInput | SwapMealInput): string[] {
    const inventoryReasons = recipe.reasons.map((reason) => {
      const item = input.kitchenItems.find((kitchenItem) =>
        reason.toLowerCase().includes(kitchenItem.toLowerCase())
      );
      return item ? `Uses ${item} already in your kitchen` : reason;
    });

    return "excludeTitles" in input
      ? [...inventoryReasons, `Ready in under ${recipe.prepTime} minutes`]
      : inventoryReasons;
  }

  private createShoppingList(meals: (GeneratedMealDTO & { day?: WeekDay })[]) {
    const shoppingMap = new Map<string, ShoppingAccumulator>();

    meals.forEach((meal) => {
      meal.ingredients.forEach((ingredient) => {
        const recipeIngredient = RECIPE_LIBRARY.flatMap((recipe) => recipe.ingredients).find(
          (item) => item.name.toLowerCase() === ingredient.name.toLowerCase()
        );
        const accumulator = this.getShoppingAccumulator(
          shoppingMap.get(ingredient.name.toLowerCase()),
          ingredient,
          recipeIngredient?.category ?? "Pantry",
          meal.day ?? "Monday"
        );
        shoppingMap.set(ingredient.name.toLowerCase(), accumulator);
      });
    });

    return Array.from(shoppingMap.values()).map((item) => ({
      name: item.name,
      category: item.category,
      quantity: this.formatQuantity(item.qtySum, item.qtyUnit),
      estimatedPrice: Math.round(item.totalPrice * 0.85 * 100) / 100,
      usedInMeals: item.usedIn,
    }));
  }

  private getShoppingAccumulator(
    existing: ShoppingAccumulator | undefined,
    ingredient: GeneratedMealDTO["ingredients"][number],
    category: string,
    day: WeekDay
  ): ShoppingAccumulator {
    const quantity = this.parseQuantity(ingredient.quantity);

    if (!existing) {
      return {
        name: ingredient.name,
        category,
        totalPrice: ingredient.estimatedPrice,
        qtySum: quantity.value,
        qtyUnit: quantity.unit,
        usedIn: [day],
      };
    }

    return {
      ...existing,
      totalPrice: existing.totalPrice + ingredient.estimatedPrice,
      qtySum: existing.qtySum + quantity.value,
      usedIn: existing.usedIn.includes(day) ? existing.usedIn : [...existing.usedIn, day],
    };
  }

  private parseQuantity(quantity: string): { value: number; unit: string } {
    const match = quantity.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
    return match ? { value: parseFloat(match[1]), unit: match[2] } : { value: 1, unit: "" };
  }

  private formatQuantity(value: number, unit: string): string {
    if (unit === "g" && value >= 1000) return `${(value / 1000).toFixed(1)}kg`;
    if (unit === "ml" && value >= 1000) return `${(value / 1000).toFixed(1)}L`;
    return `${value.toFixed(0)}${unit ? ` ${unit}` : ""}`;
  }

  private getBudgetConfidence(finalTotal: number, input: GenerateMealPlanInput) {
    let message = "This plan should stay within your selected budget range.";
    let value = 86 + Math.floor(Math.random() * 10);

    if (finalTotal > input.budgetMax) {
      message = `This plan may slightly exceed your budget due to scaling for ${input.numberOfPeople} people.`;
      value = Math.max(50, value - 25);
    } else if (finalTotal < input.budgetMin) {
      message = "Great! This plan is extremely cheap and stays under your minimum budget.";
    }

    return { message, value };
  }
}
