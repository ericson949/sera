import { createClient } from "@supabase/supabase-js";
import {
  Category,
  IngredientRef,
  MealPlanEngine,
  Recipe,
  RecipeIngredient,
  UserPreferences,
} from "@/domain/services/MealPlanEngine";

type RecipeRow = {
  id: string;
  title: string;
  imageUrl?: string | null;
  image_url?: string | null;
  totalTime?: number | null;
  total_time?: number | null;
  defaultServings?: number | null;
  default_servings?: number | null;
  diet?: string[] | null;
  allergens?: string[] | null;
  vibes?: string[] | null;
  ingredients?: RecipeIngredient[] | null;
};

type IngredientRefRow = {
  id: string;
  name: string;
  category: Category;
  unitPrice?: number | null;
  unit_price?: number | null;
  unit: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const preferences = validateUserPreferences(await request.json());
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Supabase server configuration is missing." }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let query = supabase
      .from("recipes")
      .select("id,title,imageUrl,image_url,totalTime,total_time,defaultServings,default_servings,diet,allergens,vibes,ingredients")
      .lte("totalTime", preferences.cookingTimeLimit)
      .limit(100);

    if (preferences.dietaryRestrictions.length > 0) {
      query = query.contains("diet", preferences.dietaryRestrictions);
    }

    if (preferences.allergens.length > 0) {
      query = query.not("allergens", "ov", `{${preferences.allergens.join(",")}}`);
    }

    const { data: recipeRows, error: recipeError } = await query.returns<RecipeRow[]>();
    if (recipeError) {
      return jsonResponse({ error: `Unable to query recipes: ${recipeError.message}` }, 500);
    }

    if (!recipeRows || recipeRows.length < 7) {
      return jsonResponse({ error: "Not enough matching recipes found." }, 404);
    }

    const recipes = recipeRows.map(mapRecipeRow);
    const neededIngredientIds = new Set<string>();
    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => neededIngredientIds.add(ingredient.ingredientId));
    });

    const { data: ingredientRows, error: ingredientError } = await supabase
      .from("ingredients_reference")
      .select("id,name,category,unitPrice,unit_price,unit")
      .in("id", Array.from(neededIngredientIds))
      .returns<IngredientRefRow[]>();

    if (ingredientError) {
      return jsonResponse({ error: `Unable to query ingredient references: ${ingredientError.message}` }, 500);
    }

    const ingredients = (ingredientRows ?? []).map(mapIngredientRefRow);
    const engine = new MealPlanEngine(recipes, ingredients);
    return jsonResponse(engine.generatePlan(preferences), 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    const status = message.startsWith("Invalid request") || message.startsWith("Missing") ? 400 : 500;
    return jsonResponse({ error: message }, status);
  }
}

function validateUserPreferences(payload: unknown): UserPreferences {
  if (!isRecord(payload)) throw new Error("Invalid request body.");

  const householdSize = readPositiveNumber(payload, "householdSize");
  const weeklyBudget = readPositiveNumber(payload, "weeklyBudget");
  const cookingTimeLimit = readPositiveNumber(payload, "cookingTimeLimit");
  const currency = payload.currency;

  if (currency !== "EUR" && currency !== "USD") {
    throw new Error("Invalid request currency.");
  }

  return {
    householdSize,
    weeklyBudget,
    currency,
    cookingTimeLimit,
    dietaryRestrictions: readStringArray(payload, "dietaryRestrictions"),
    allergens: readStringArray(payload, "allergens"),
    knownPantryItems: readStringArray(payload, "knownPantryItems"),
    vibes: readStringArray(payload, "vibes"),
  };
}

function mapRecipeRow(row: RecipeRow): Recipe {
  const totalTime = row.totalTime ?? row.total_time;
  const defaultServings = row.defaultServings ?? row.default_servings;

  if (!totalTime || !defaultServings || !row.ingredients) {
    throw new Error(`Invalid recipe row for ${row.id}.`);
  }

  return {
    id: row.id,
    title: row.title,
    imageUrl: row.imageUrl ?? row.image_url ?? "",
    totalTime,
    defaultServings,
    diet: row.diet ?? [],
    allergens: row.allergens ?? [],
    vibes: row.vibes ?? [],
    ingredients: row.ingredients,
  };
}

function mapIngredientRefRow(row: IngredientRefRow): IngredientRef {
  const unitPrice = row.unitPrice ?? row.unit_price;
  if (typeof unitPrice !== "number") {
    throw new Error(`Invalid ingredient reference price for ${row.id}.`);
  }

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    unitPrice,
    unit: row.unit,
  };
}

function readPositiveNumber(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Missing or invalid ${key}.`);
  }
  return value;
}

function readStringArray(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  if (!Array.isArray(value)) {
    throw new Error(`Missing or invalid ${key}.`);
  }
  if (!value.every((item) => typeof item === "string")) {
    throw new Error(`Invalid ${key} item.`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function jsonResponse(body: unknown, status: number) {
  return Response.json(body, { status, headers: corsHeaders });
}
