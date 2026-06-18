const SHOPPING_CATEGORIES = ["Vegetables", "Meat & Fish", "Dairy", "Pantry", "Frozen", "Spices", "Other"];
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMEOUT_MS = 35000;
const HOURLY_FREE_LIMIT = 8;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return corsResponse(null);
  if (request.method !== "POST") return corsResponse({ error: "Method not allowed" }, 405);

  const startedAt = Date.now();
  let input: Record<string, unknown> = {};

  try {
    input = await request.json();
    const userId = String(input.userId || "anonymous");
    const action = input.action === "swap" ? "swap" : "generate";

    await assertRateLimit(userId, action);
    await recordEvent({ userId, action, provider: getProvider(), model: getModel(), status: "started" });

    const json = await generateWithRepair(input);
    if (json && typeof json === "object") {
      if (input.action === "swap") {
        json.imageUrl = "";
        json.ingredients = [];
        json.recipeSteps = [];
      } else if (Array.isArray(json.meals)) {
        json.meals.forEach((meal: any) => {
          meal.imageUrl = "";
          meal.ingredients = [];
          meal.recipeSteps = [];
        });
        json.shoppingList = [];
      }
    }
    await recordEvent({ userId, action, provider: getProvider(), model: getModel(), status: "success", latencyMs: Date.now() - startedAt });
    return corsResponse(json);
  } catch (error) {
    const userId = String(input.userId || "anonymous");
    const action = input.action === "swap" ? "swap" : "generate";
    const message = error instanceof Error ? error.message : String(error);
    await recordEvent({ userId, action, provider: getProvider(), model: getModel(), status: message.includes("rate limit") ? "rate_limited" : "error", latencyMs: Date.now() - startedAt, errorMessage: message });
    return corsResponse({ error: message }, message.includes("rate limit") ? 429 : 500);
  }
});

async function generateWithRepair(input: Record<string, unknown>) {
  const first = await callAI(buildPrompt(input));
  const parsed = parseJson(first);
  if (parsed) return parsed;

  const repaired = await callAI(`Repair this into valid JSON only. Do not add markdown.\n\n${first}`);
  const repairedJson = parseJson(repaired);
  if (!repairedJson) throw new Error("AI returned invalid JSON after repair");
  return repairedJson;
}

async function callAI(prompt: string) {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) throw new Error("OpenRouter API key is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const baseUrl = "https://openrouter.ai/api/v1";
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": Deno.env.get("APP_URL") || "https://sera.menu",
        "X-Title": "Sera",
      },
      body: JSON.stringify({
        model: getModel(),
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`AI provider failed: ${response.status} ${await response.text()}`);
    const data = await response.json();
    return String(data.choices?.[0]?.message?.content || "{}");
  } finally {
    clearTimeout(timeout);
  }
}

function buildPrompt(input: Record<string, unknown>) {
  const languageCode = String(input.appLanguage || "it");
  const language = languageCode === "fr" ? "French" : languageCode === "it" ? "Italian" : "English";
  const country = String(input.appCountry || "Italy");
  const action = input.action === "swap" ? "swap" : "generate";
  const budgetMax = Number(input.budgetMax || 0);
  const people = Number(input.numberOfPeople || 1);
  const budgetNote = budgetMax < people * 12
    ? "The budget is very tight. Use pantry staples, legumes, eggs or seasonal vegetables, and be transparent in budgetMessage."
    : "Keep total cost inside the selected budget whenever realistic.";

  const context = `shop ${input.shop}; budget ${input.budgetMin}-${input.budgetMax} EUR; people ${people}; goal ${input.goal}; vibes ${(input.vibes as string[] || []).join(", ")}; dietary ${(input.dietaryNeeds as string[] || []).join(", ")}; max time ${input.maxCookingTime}; batch cooking ${input.batchCooking ? "yes" : "no"}; pantry ${(input.kitchenItems as string[] || []).join(", ")}`;

  return action === "swap"
    ? `You are Sera, a premium Mediterranean dinner planner. Reply in ${language}. Create one replacement dinner for ${country}.
Context: ${context}; day ${input.dayToSwap}; avoid ${(input.excludeTitles as string[] || []).join(", ")}.
Rules: strict dietary compliance, realistic local supermarket ingredients, no luxury items, JSON only. Return only the overview; details are generated later.
Schema: {"title":"","description":"","estimatedCost":4.5,"calories":520,"prepTimeMinutes":25,"whyThisMeal":[""]}`
    : `You are Sera, a premium Mediterranean dinner planner. Reply in ${language}. Create a seven dinner plan for ${country}.
Context: ${context}.
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

function getProvider() {
  return "openrouter";
}

function getModel() {
  return Deno.env.get("OPENROUTER_MODEL") || "openai/gpt-4o-mini";
}

async function assertRateLimit(userId: string, action: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey || userId === "anonymous") return;

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const url = `${supabaseUrl}/rest/v1/ai_generation_events?select=id&user_id=eq.${encodeURIComponent(userId)}&action=eq.${action}&created_at=gte.${since}`;
  const response = await fetch(url, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } });
  if (!response.ok) return;
  const rows = await response.json();
  if (Array.isArray(rows) && rows.length >= HOURLY_FREE_LIMIT) throw new Error("AI rate limit reached");
}

async function recordEvent(event: { userId: string; action: string; provider: string; model: string; status: string; latencyMs?: number; errorMessage?: string }) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return;

  await fetch(`${supabaseUrl}/rest/v1/ai_generation_events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    body: JSON.stringify({
      user_id: event.userId,
      action: event.action,
      provider: event.provider,
      model: event.model,
      status: event.status,
      latency_ms: event.latencyMs,
      error_message: event.errorMessage,
    }),
  }).catch(() => undefined);
}

function corsResponse(body: unknown, status = 200) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });
}
