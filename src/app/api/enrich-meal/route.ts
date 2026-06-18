import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { SHOPPING_CATEGORIES } from "@/modules/meal-planning/domain/value-objects/ShoppingCategory";
import { captureServerException } from "@/shared/observability/posthogServer";
import { MockMealPlanAIService } from "@/modules/meal-planning/infrastructure/ai/MockMealPlanAIService";

const inputSchema = z.object({
  mealTitle: z.string().min(1),
  mealDescription: z.string().min(1),
  shop: z.string().min(1),
  numberOfPeople: z.number().int().positive(),
  appLanguage: z.string().default("it"),
});

const outputSchema = z.object({
  ingredients: z.array(z.object({
    name: z.string().min(1),
    quantity: z.string().min(1),
    estimatedPrice: z.number().nonnegative(),
    category: z.enum(SHOPPING_CATEGORIES),
  })).min(1),
  recipeSteps: z.array(z.string().min(1)).min(2),
});

const TIMEOUT_MS = 45_000;

export async function POST(request: Request) {
  try {
    const input = inputSchema.parse(await request.json());
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      const mock = new MockMealPlanAIService();
      return NextResponse.json(await mock.enrichMeal({ ...input, shop: input.shop as never }));
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://sera.menu",
        "X-Title": "Sera",
      },
    });
    const language = input.appLanguage === "fr" ? "French" : input.appLanguage === "it" ? "Italian" : "English";
    const prompt = `Reply in ${language}. Complete this dinner recipe for ${input.numberOfPeople} people, using realistic prices from ${input.shop}.
Meal: ${input.mealTitle}. ${input.mealDescription}
Return JSON only. Categories must be one of: ${SHOPPING_CATEGORIES.join(", ")}.
Schema: {"ingredients":[{"name":"","quantity":"","estimatedPrice":1.2,"category":"Pantry"}],"recipeSteps":["","" ]}`;

    const response = await withTimeout(client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }), TIMEOUT_MS);
    const content = response.choices[0]?.message?.content ?? "{}";
    return NextResponse.json(outputSchema.parse(JSON.parse(content)));
  } catch (error) {
    await captureServerException(error, { route: "/api/enrich-meal", provider: "openrouter", fallback: "none" });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to enrich meal" }, { status: 500 });
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Meal enrichment timed out")), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
