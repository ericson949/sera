import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { MockMealPlanAIService } from "@/modules/meal-planning/infrastructure/ai/MockMealPlanAIService";
import { SHOPPING_CATEGORIES } from "@/modules/meal-planning/domain/value-objects/ShoppingCategory";

const mockAIService = new MockMealPlanAIService();
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const inputSchema = z.object({
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
});

const ingredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().min(1),
  estimatedPrice: z.number().nonnegative(),
});

const mealSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  estimatedCost: z.number().nonnegative(),
  calories: z.number().int().positive(),
  prepTimeMinutes: z.number().int().positive(),
  ingredients: z.array(ingredientSchema).min(1),
  recipeSteps: z.array(z.string().min(1)).min(2),
  whyThisMeal: z.array(z.string().min(1)).min(1),
});

const planSchema = z.object({
  estimatedTotal: z.number().nonnegative(),
  estimatedMin: z.number().nonnegative(),
  estimatedMax: z.number().nonnegative(),
  budgetConfidence: z.number().min(0).max(100),
  budgetMessage: z.string().min(1),
  meals: z.array(mealSchema.extend({ day: z.enum(weekdays) })).length(7),
  shoppingList: z.array(z.object({
    name: z.string().min(1),
    category: z.enum(SHOPPING_CATEGORIES),
    quantity: z.string().min(1),
    estimatedPrice: z.number().nonnegative(),
    usedInMeals: z.array(z.enum(weekdays)).min(1),
  })).min(1),
});

export async function POST(request: Request) {
  const input = inputSchema.parse(await request.json());

  if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(await runMock(input));
  }

  try {
    const client = createAIClient();
    const response = await client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [{ role: "user", content: buildPrompt(input) }],
      response_format: { type: "json_object" },
    });
    const data = JSON.parse(response.choices[0]?.message?.content || "{}");
    return NextResponse.json(input.action === "swap" ? mealSchema.parse(data) : planSchema.parse(data));
  } catch (error) {
    console.error("AI generation failed, using validated mock fallback:", error);
    return NextResponse.json(await runMock(input));
  }
}

function createAIClient() {
  if (process.env.OPENROUTER_API_KEY) {
    return new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://sera.menu",
        "X-Title": "Sera",
      },
    });
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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

function buildPrompt(input: z.infer<typeof inputSchema>) {
  const language = input.appLanguage === "fr" ? "French" : input.appLanguage === "it" ? "Italian" : "English";
  const country = input.appCountry;
  const budgetNote = input.budgetMax < input.numberOfPeople * 12
    ? "The budget is very tight. Use pantry staples, legumes, eggs or seasonal vegetables, and be transparent in budgetMessage."
    : "Keep total cost inside the selected budget whenever realistic.";

  return input.action === "swap"
    ? `You are Sera, a premium Mediterranean dinner planner. Reply in ${language}. Create one replacement dinner for ${country}.
Context: shop ${input.shop}; budget ${input.budgetMin}-${input.budgetMax} EUR; people ${input.numberOfPeople}; goal ${input.goal}; vibes ${input.vibes.join(", ")}; dietary ${input.dietaryNeeds.join(", ")}; max time ${input.maxCookingTime}; batch cooking ${input.batchCooking ? "yes" : "no"}; pantry ${input.kitchenItems.join(", ")}; day ${input.dayToSwap}; avoid ${input.excludeTitles.join(", ")}.
Rules: strict dietary compliance, realistic local supermarket ingredients, no luxury items, JSON only.
Schema: {"title":"","description":"","estimatedCost":4.5,"calories":520,"prepTimeMinutes":25,"ingredients":[{"name":"","quantity":"","estimatedPrice":1.2}],"recipeSteps":[""],"whyThisMeal":[""]}`
    : `You are Sera, a premium Mediterranean dinner planner. Reply in ${language}. Create a seven dinner plan for ${country}.
Context: shop ${input.shop}; budget ${input.budgetMin}-${input.budgetMax} EUR; people ${input.numberOfPeople}; goal ${input.goal}; vibes ${input.vibes.join(", ")}; dietary ${input.dietaryNeeds.join(", ")}; max time ${input.maxCookingTime}; batch cooking ${input.batchCooking ? "yes, favor recipes that reheat and prep well in one session" : "no"}; pantry ${input.kitchenItems.join(", ")}.
Country rules: use common shops, ingredients and dinner habits from ${country}. France should feel French, Italy Italian, UK British, US American.
Budget rules: ${budgetNote} Reuse ingredients and reduce waste.
Return JSON only with exactly seven meals Monday-Sunday and shopping categories only from: ${SHOPPING_CATEGORIES.join(", ")}.
Schema: {"estimatedTotal":42,"estimatedMin":39,"estimatedMax":47,"budgetConfidence":86,"budgetMessage":"","meals":[{"day":"Monday","title":"","description":"","estimatedCost":4.2,"calories":620,"prepTimeMinutes":20,"ingredients":[{"name":"","quantity":"","estimatedPrice":0.6}],"recipeSteps":[""],"whyThisMeal":[""]}],"shoppingList":[{"name":"","category":"Pantry","quantity":"","estimatedPrice":1.4,"usedInMeals":["Monday"]}]}`;
}
