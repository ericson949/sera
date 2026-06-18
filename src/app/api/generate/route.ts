import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { MockMealPlanAIService } from "@/modules/meal-planning/infrastructure/ai/MockMealPlanAIService";
import { captureServerException } from "@/shared/observability/posthogServer";

const mockAIService = new MockMealPlanAIService();
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const AI_TIMEOUT_MS = 35_000;

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
});

const mealOverviewSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  estimatedCost: z.number().nonnegative(),
  calories: z.number().int().positive(),
  prepTimeMinutes: z.number().int().positive(),
  whyThisMeal: z.array(z.string().min(1)).min(1),
});

const mealSchema = mealOverviewSchema.transform(toEmptyMealDetails);

const planSchema = z.object({
  estimatedTotal: z.number().nonnegative(),
  estimatedMin: z.number().nonnegative(),
  estimatedMax: z.number().nonnegative(),
  budgetConfidence: z.number().min(0).max(100),
  budgetMessage: z.string().min(1),
  meals: z.array(mealOverviewSchema.extend({ day: z.enum(weekdays) })).length(7),
}).transform((plan) => ({
  ...plan,
  meals: plan.meals.map(toEmptyMealDetails),
  shoppingList: [],
}));

export async function POST(request: Request) {
  const input = inputSchema.parse(await request.json());
  const validator = input.action === "swap" ? mealSchema : planSchema;

  try {
    const supabaseResult = await runSupabaseAI(input);
    if (supabaseResult) return NextResponse.json(validator.parse(supabaseResult));
  } catch (error) {
    await captureServerException(error, { route: "/api/generate", provider: "supabase-edge", fallback: "next" });
  }

  if (!process.env.OPENROUTER_API_KEY) return NextResponse.json(validator.parse(await runMock(input)));

  try {
    const data = await runNextAI(input);
    return NextResponse.json(validator.parse(data));
  } catch (error) {
    console.error("AI generation failed, using validated mock fallback:", error);
    await captureServerException(error, { route: "/api/generate", provider: getLocalProvider(), fallback: "mock" });
    return NextResponse.json(validator.parse(await runMock(input)));
  }
}

async function runSupabaseAI(input: z.infer<typeof inputSchema>) {
  const functionUrl = process.env.SUPABASE_AI_FUNCTION_URL || (
    process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-meal-plan` : ""
  );
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!functionUrl || !serviceKey) return null;

  const response = await fetchWithTimeout(functionUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error(`Supabase AI failed: ${response.status} ${await response.text()}`);
  return response.json();
}

async function runNextAI(input: z.infer<typeof inputSchema>) {
  const client = createAIClient();
  const content = await callLocalAI(client, buildPrompt(input));
  const parsed = parseJson(content);
  if (parsed) return parsed;

  const repaired = await callLocalAI(client, `Repair this into valid JSON only. Do not add markdown.\n\n${content}`);
  const repairedJson = parseJson(repaired);
  if (!repairedJson) throw new Error("AI returned invalid JSON after repair");
  return repairedJson;
}

async function callLocalAI(client: OpenAI, prompt: string) {
  const response = await withTimeout(
    client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
    AI_TIMEOUT_MS
  );
  return response.choices[0]?.message?.content || "{}";
}

function createAIClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  return new OpenAI({
    apiKey: apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://sera.menu",
      "X-Title": "Sera",
    },
  });
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
Rules: strict dietary compliance, realistic local supermarket ingredients, no luxury items, JSON only. Return only the overview; recipe details and image are generated later.
Schema: {"title":"","description":"","estimatedCost":4.5,"calories":520,"prepTimeMinutes":25,"whyThisMeal":[""]}`
    : `You are Sera, a premium Mediterranean dinner planner. Reply in ${language}. Create a seven dinner plan for ${country}.
Context: shop ${input.shop}; budget ${input.budgetMin}-${input.budgetMax} EUR; people ${input.numberOfPeople}; goal ${input.goal}; vibes ${input.vibes.join(", ")}; dietary ${input.dietaryNeeds.join(", ")}; max time ${input.maxCookingTime}; batch cooking ${input.batchCooking ? "yes, favor recipes that reheat and prep well in one session" : "no"}; pantry ${input.kitchenItems.join(", ")}.
Country rules: use common shops, ingredients and dinner habits from ${country}. France should feel French, Italy Italian, UK British, US American.
Budget rules: ${budgetNote} Reuse ingredients and reduce waste.
Return JSON only with exactly seven meal overviews Monday-Sunday. Do not generate ingredients, cooking steps, images or a shopping list yet.
Schema: {"estimatedTotal":42,"estimatedMin":39,"estimatedMax":47,"budgetConfidence":86,"budgetMessage":"","meals":[{"day":"Monday","title":"","description":"","estimatedCost":4.2,"calories":620,"prepTimeMinutes":20,"whyThisMeal":[""]}]}`;
}

function parseJson(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function getLocalProvider() {
  return "openrouter";
}

function toEmptyMealDetails<T extends z.infer<typeof mealOverviewSchema>>(meal: T) {
  return { ...meal, imageUrl: "", ingredients: [], recipeSteps: [] };
}

async function fetchWithTimeout(input: string, init: RequestInit) {
  return withTimeout(fetch(input, init), AI_TIMEOUT_MS);
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("AI request timed out")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
