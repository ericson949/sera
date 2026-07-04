import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { MealPlanEngine, Recipe, IngredientRef, Category } from "@/domain/services/MealPlanEngine";
import { MockMealPlanAIService } from "@/modules/meal-planning/infrastructure/ai/MockMealPlanAIService";
import { captureServerException } from "@/shared/observability/posthogServer";

const mockAIService = new MockMealPlanAIService();
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const inputSchema = z.object({
  userId: z.string().optional(),
  shop: z.string(),
  budgetMin: z.number(),
  budgetMax: z.number(),
  numberOfPeople: z.number(),
  goal: z.string(),
  vibes: z.array(z.string()).default([]),
  dietaryNeeds: z.array(z.string()).default([]),
  maxCookingTime: z.string(),
  kitchenItems: z.array(z.string()).default([]),
  batchCooking: z.boolean().default(false),
  appCountry: z.string().default("Italy"),
  appLanguage: z.enum(["en", "fr", "it"]).default("it"),
  action: z.enum(["swap"]).optional(),
  dayToSwap: z.enum(weekdays).optional(),
  excludeTitles: z.array(z.string()).default([]),
  excludeIds: z.array(z.string()).default([]),
});

const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  estimatedPrice: z.number(),
  category: z.string().optional(),
});

const mealOverviewSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  estimatedCost: z.number().nonnegative(),
  calories: z.number().int().positive(),
  prepTimeMinutes: z.number().int().positive(),
  whyThisMeal: z.array(z.string().min(1)).min(1),
  imageUrl: z.string().optional().default(""),
  recipeId: z.string().optional().default(""),
  ratings: z.number().optional().default(0.0),
  ratingsCount: z.number().int().optional().default(0),
  ingredients: z.array(ingredientSchema).default([]),
  recipeSteps: z.array(z.string()).default([]),
});

const mealSchema = mealOverviewSchema.transform(toEmptyMealDetails);

function buildShoppingList(meals: any[]): any[] {
  const itemsMap = new Map<string, any>();
  meals.forEach((meal) => {
    (meal.ingredients || []).forEach((ing: any) => {
      const key = ing.name.toLowerCase().trim();
      const existing = itemsMap.get(key);
      if (existing) {
        existing.estimatedPrice = Math.round((existing.estimatedPrice + ing.estimatedPrice) * 100) / 100;
        if (!existing.usedInMeals.includes(meal.day)) {
          existing.usedInMeals.push(meal.day);
        }
      } else {
        itemsMap.set(key, {
          name: ing.name,
          category: ing.category || "Pantry",
          quantity: ing.quantity,
          estimatedPrice: ing.estimatedPrice,
          usedInMeals: [meal.day],
        });
      }
    });
  });
  return Array.from(itemsMap.values());
}

const planSchema = z.object({
  estimatedTotal: z.number().nonnegative(),
  estimatedMin: z.number().nonnegative(),
  estimatedMax: z.number().nonnegative(),
  budgetConfidence: z.number().min(0).max(100),
  budgetMessage: z.string().min(1),
  meals: z.array(mealOverviewSchema.extend({ day: z.enum(weekdays) })).length(7),
}).transform((plan) => {
  const meals = plan.meals.map(toEmptyMealDetails);
  return {
    ...plan,
    meals,
    shoppingList: buildShoppingList(meals),
  };
});

export async function POST(request: Request) {
  let parsedInput: any = null;
  try {
    const bodyJson = await request.json();
    parsedInput = inputSchema.parse(bodyJson);
    const input = parsedInput;
    const validator = input.action === "swap" ? mealSchema : planSchema;

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.warn("Supabase environment configuration missing. Using mock engine fallback.");
      return NextResponse.json(validator.parse(await runMock(input)));
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1. Determine cooking time constraint
    let cookingTimeLimit = 180; // Default: No limit
    const minutesMatch = input.maxCookingTime.match(/^(\d+)/);
    if (minutesMatch) {
      cookingTimeLimit = parseInt(minutesMatch[1]);
    }

    // 2. Map dietary needs to database diet filters and allergen exclusions
    const dbDietFilters: string[] = [];
    const dbAllergensFilters: string[] = [];

    input.dietaryNeeds.forEach((need: string) => {
      if (need === "None") return;
      
      const lower = need.toLowerCase();
      if (lower === "vegetarian") dbDietFilters.push("vegetarian");
      else if (lower === "vegan") dbDietFilters.push("vegan");
      else if (lower === "pescatarian") dbDietFilters.push("pescatarian");
      else if (lower === "low carb") dbDietFilters.push("keto_friendly");
      else if (lower === "high protein") dbDietFilters.push("high_protein");
      else if (lower === "gluten-free") dbAllergensFilters.push("gluten");
      else if (lower === "lactose-free") dbAllergensFilters.push("milk");
    });

    // 3. Query matching recipes from Database
    let query = supabase
      .from("recipes")
      .select("id, title, description, imageUrl, prepTime, cookTime, totalTime, defaultServings, ingredients, steps, allergens, diet, taxonomy, ratings, ratingsCount")
      .lte("totalTime", cookingTimeLimit);

    if (dbDietFilters.length > 0) {
      query = query.contains("diet", dbDietFilters);
    }

    const { data: recipeRows, error: recipeError } = await query;
    if (recipeError) {
      throw new Error(`Unable to fetch recipes: ${recipeError.message}`);
    }

    if (!recipeRows || recipeRows.length === 0) {
      throw new Error("No recipes found matching the constraints.");
    }

    // Filter recipes locally to exclude allergens (PostgreSQL doesn't do "not contains" easily)
    let filteredRecipes = recipeRows.filter((r) => {
      const recipeAllergens = r.allergens as string[] | null;
      if (!recipeAllergens) return true;
      return !recipeAllergens.some((a) => dbAllergensFilters.includes(a));
    });

    // Apply exclusions for recipe IDs and titles with safety thresholds
    let filteredExcludes = filteredRecipes;
    if (input.excludeIds && input.excludeIds.length > 0) {
      filteredExcludes = filteredExcludes.filter((r) => !input.excludeIds.includes(r.id));
    }
    if (input.excludeTitles && input.excludeTitles.length > 0) {
      filteredExcludes = filteredExcludes.filter((r) => !input.excludeTitles.includes(r.title));
    }

    if (input.action === "swap") {
      if (filteredExcludes.length > 0) {
        filteredRecipes = filteredExcludes;
      } else {
        // Fallback for swap: filter out only the target recipe being swapped
        filteredRecipes = filteredRecipes.filter((r) => !input.excludeIds.includes(r.id));
      }
    } else {
      // For weekly generation/regeneration: only exclude if we still have at least 7 candidate recipes left
      if (filteredExcludes.length >= 7) {
        filteredRecipes = filteredExcludes;
      }
    }

    if (filteredRecipes.length === 0) {
      // If we filtered out too many, fallback to unfiltered query results
      filteredRecipes = recipeRows;
    }

    // Map DB recipes to domain Recipe schema
    const recipes: Recipe[] = filteredRecipes.map((row) => ({
      id: row.id,
      title: row.title,
      imageUrl: row.imageUrl || "",
      totalTime: row.totalTime || row.prepTime + row.cookTime || 20,
      defaultServings: row.defaultServings || 4,
      diet: row.diet || [],
      allergens: row.allergens || [],
      vibes: row.taxonomy?.cuisine || [],
      ingredients: (row.ingredients || []).map((ing: any) => ({
        ingredientId: ing.id,
        quantityValue: ing.quantity?.value || 1,
        unit: ing.quantity?.unit || "unit",
      })),
      ratings: Number(row.ratings) || 0,
      ratingsCount: Number(row.ratingsCount) || 0,
    }));

    // 4. Retrieve scaled ingredient reference prices
    const neededIngredientIds = new Set<string>();
    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => neededIngredientIds.add(ingredient.ingredientId));
    });

    // Chunk requests to avoid "URI too long" (HTTP 414) in PostgREST for large sets of unique ingredients
    const ingredientIdsArray = Array.from(neededIngredientIds);
    const CHUNK_SIZE = 100;
    const ingredientRows: any[] = [];

    for (let i = 0; i < ingredientIdsArray.length; i += CHUNK_SIZE) {
      const chunk = ingredientIdsArray.slice(i, i + CHUNK_SIZE);
      const { data, error } = await supabase
        .from("ingredients_reference")
        .select("id, category, translations, estimatedPricePerUnit")
        .in("id", chunk);

      if (error) {
        throw new Error(`Unable to fetch ingredient references chunk: ${error.message}`);
      }
      if (data) {
        ingredientRows.push(...data);
      }
    }

    // Map DB ingredients to domain IngredientRef schema
    const ingredients: IngredientRef[] = (ingredientRows || []).map((row: any) => {
      const prices = row.estimatedPricePerUnit || {};
      const translations = row.translations || {};
      const unitPrice = prices["EUR"] || prices["USD"] || 0.01;
      const name = translations[input.appLanguage] || translations["en"] || row.id;

      return {
        id: row.id,
        name,
        category: row.category as Category,
        unitPrice,
        unit: "unit", // fallback unit
      };
    });

    // 5. Initialize Optimization Engine
    const engine = new MealPlanEngine(recipes, ingredients);

    // Map input fields to UserPreferences domain object
    const userPrefs = {
      householdSize: input.numberOfPeople,
      weeklyBudget: input.budgetMax,
      currency: "EUR" as const,
      dietaryRestrictions: dbDietFilters,
      allergens: dbAllergensFilters,
      cookingTimeLimit,
      knownPantryItems: input.kitchenItems,
      vibes: input.vibes,
    };

    // 6. Action 1: SWAP SINGLE MEAL
    if (input.action === "swap") {
      const candidateMeals = recipes.map((recipe) => (engine as any).calculateRecipeCost(recipe, userPrefs));
      // Pick a random swap meal from candidates
      const selectedMeal = candidateMeals[Math.floor(Math.random() * candidateMeals.length)];
      if (!selectedMeal) throw new Error("No swap meal available");

      const dbRecipe = filteredRecipes.find((r) => r.id === selectedMeal.recipeId)!;
      const calories = getDeterministicCalories(dbRecipe);
      const whyThisMeal = buildWhyThisMeal(dbRecipe, input);

      return NextResponse.json(validator.parse({
        title: selectedMeal.title,
        description: dbRecipe.description || "",
        estimatedCost: selectedMeal.estimatedCost,
        calories,
        prepTimeMinutes: selectedMeal.totalTime,
        whyThisMeal,
        imageUrl: dbRecipe.imageUrl || "",
        recipeId: dbRecipe.id,
        ratings: selectedMeal.ratings,
        ratingsCount: selectedMeal.ratingsCount,
        ingredients: selectedMeal.scaledIngredients.map((ing: any) => ({
          name: ing.name,
          quantity: `${ing.quantityValue} ${ing.unit}`,
          estimatedPrice: ing.estimatedCost,
          category: ing.category,
        })),
        recipeSteps: (dbRecipe.steps || []).map((s: any) => s.description || s.step || ""),
      }));
    }

    // 7. Action 2: GENERATE FULL WEEKLY PLAN
    const generatedPlan = engine.generatePlan(userPrefs);

    // Map engine plan to UI planSchema DTO
    const meals = generatedPlan.meals.map((meal, index) => {
      const dbRecipe = filteredRecipes.find((r) => r.id === meal.recipeId)!;
      const calories = getDeterministicCalories(dbRecipe);
      const whyThisMeal = buildWhyThisMeal(dbRecipe, input);

      return {
        day: weekdays[index],
        title: meal.title,
        description: dbRecipe.description || "",
        estimatedCost: meal.estimatedCost,
        calories,
        prepTimeMinutes: meal.totalTime,
        whyThisMeal,
        imageUrl: dbRecipe.imageUrl || "",
        recipeId: dbRecipe.id,
        ratings: meal.ratings,
        ratingsCount: meal.ratingsCount,
        ingredients: meal.scaledIngredients.map((ing: any) => ({
          name: ing.name,
          quantity: `${ing.quantityValue} ${ing.unit}`,
          estimatedPrice: ing.estimatedCost,
          category: ing.category,
        })),
        recipeSteps: (dbRecipe.steps || []).map((s: any) => s.description || s.step || ""),
      };
    });

    const totalCost = generatedPlan.totalCalculatedCost;
    const confidence = totalCost <= input.budgetMax 
      ? Math.min(100, 85 + Math.floor(Math.random() * 15))
      : Math.max(50, Math.round(100 - ((totalCost - input.budgetMax) / input.budgetMax) * 100));

    const budgetMessage = totalCost <= input.budgetMax
      ? "Il piano rispetta perfettamente il budget impostato!"
      : `Questo piano supera di poco il tuo budget massimo di €${input.budgetMax} a causa degli ingredienti selezionati.`;
    console.log("Generated plan:", { totalCost, confidence, budgetMessage, meals });
    const result = {
      estimatedTotal: totalCost,
      estimatedMin: Math.round(totalCost * 0.9 * 100) / 100,
      estimatedMax: Math.round(totalCost * 1.1 * 100) / 100,
      budgetConfidence: confidence,
      budgetMessage,
      meals,
    };

    return NextResponse.json(validator.parse(result));
  } catch (error: any) {
    console.error("AI/Engine generation failed, using validated mock fallback:", error);
    await captureServerException(error, { route: "/api/generate", provider: "local-engine", fallback: "mock" });
    
    // Fallback to mock on any failures
    if (parsedInput) {
      const validator = parsedInput.action === "swap" ? mealSchema : planSchema;
      return NextResponse.json(validator.parse(await runMock(parsedInput)));
    } else {
      return NextResponse.json({ error: "Invalid request body or schema mismatch." }, { status: 400 });
    }
  }
}

function getDeterministicCalories(recipe: any): number {
  const hash = recipe.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const isLowCal = (recipe.diet || []).includes("low_calorie");
  return isLowCal ? 380 + (hash % 100) : 550 + (hash % 200);
}

function buildWhyThisMeal(recipe: any, input: any): string[] {
  const reasons = [
    `Pronto in soli ${recipe.totalTime} minuti.`,
    `Ottimo per raggiungere l'obiettivo: "${input.goal.toLowerCase()}".`,
  ];
  if ((recipe.diet || []).includes("high_protein")) {
    reasons.push("Alto contenuto proteico.");
  }
  const match = (recipe.ingredients || []).find((ing: any) =>
    input.kitchenItems.some((k: string) => ing.id.includes(k.toLowerCase()))
  );
  if (match) {
    reasons.push("Utilizza ingredienti già presenti nella tua cucina.");
  }
  return reasons;
}

async function runMock(input: z.infer<typeof inputSchema>) {
  if (input.action === "swap") {
    return mockAIService.swapMeal({
      shop: input.shop as any,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      numberOfPeople: input.numberOfPeople,
      goal: input.goal as any,
      vibes: input.vibes as any,
      dietaryNeeds: input.dietaryNeeds as any,
      maxCookingTime: input.maxCookingTime as any,
      kitchenItems: input.kitchenItems,
      batchCooking: input.batchCooking,
      dayToSwap: input.dayToSwap ?? "Monday",
      excludeTitles: input.excludeTitles,
      excludeIds: input.excludeIds,
    });
  }

  return mockAIService.generateMealPlan({
    shop: input.shop as any,
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    numberOfPeople: input.numberOfPeople,
    goal: input.goal as any,
    vibes: input.vibes as any,
    dietaryNeeds: input.dietaryNeeds as any,
    maxCookingTime: input.maxCookingTime as any,
    kitchenItems: input.kitchenItems,
    batchCooking: input.batchCooking,
  });
}

function toEmptyMealDetails<T extends z.infer<typeof mealOverviewSchema>>(meal: T) {
  return { ...meal, imageUrl: meal.imageUrl || "" };
}
