import { NextResponse } from "next/server";
import { MockMealPlanAIService } from "@/modules/meal-planning/infrastructure/ai/MockMealPlanAIService";
import OpenAI from "openai";

const mockAIService = new MockMealPlanAIService();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shop, budgetMin, budgetMax, numberOfPeople, goal, vibes, dietaryNeeds, maxCookingTime, kitchenItems, action, dayToSwap, excludeTitles } = body;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn("OPENAI_API_KEY is not defined. Using MockMealPlanAIService fallback.");
      if (action === "swap") {
        const result = await mockAIService.swapMeal({
          shop,
          budgetMin,
          budgetMax,
          numberOfPeople,
          goal,
          vibes,
          dietaryNeeds,
          maxCookingTime,
          kitchenItems,
          dayToSwap,
          excludeTitles,
        });
        return NextResponse.json(result);
      } else {
        const result = await mockAIService.generateMealPlan({
          shop,
          budgetMin,
          budgetMax,
          numberOfPeople,
          goal,
          vibes,
          dietaryNeeds,
          maxCookingTime,
          kitchenItems,
        });
        return NextResponse.json(result);
      }
    }

    const openai = new OpenAI({ apiKey });

    // ACTION 1: SWAP SINGLE MEAL
    if (action === "swap") {
      const prompt = `You are Dinnero, an AI meal planning assistant for Italian grocery shoppers.
Create a realistic swapped dinner recipe.

User context:
- Grocery shop: ${shop}
- Weekly dinner budget range: ${budgetMin} EUR to ${budgetMax} EUR
- Number of people: ${numberOfPeople}
- Main goal: ${goal}
- Food vibes: ${vibes.join(", ")}
- Dietary needs: ${dietaryNeeds.join(", ")}
- Max cooking time: ${maxCookingTime}
- Kitchen inventory: ${kitchenItems.join(", ")}
- Day to swap: ${dayToSwap}
- Avoid these recipes (already in menu): ${excludeTitles.join(", ")}

Important rules:
- Generate exactly ONE dinner recipe.
- Make it fit the Italian supermarket style and respect dietary needs strictly.
- Return JSON only. No explanation.
Expected JSON format:
{
  "title": "Recipe Title",
  "description": "Short description",
  "estimatedCost": 4.5,
  "calories": 520,
  "prepTimeMinutes": 25,
  "ingredients": [
    {
      "name": "Ingredient Name",
      "quantity": "200g",
      "estimatedPrice": 1.2
    }
  ],
  "recipeSteps": [
    "Step 1",
    "Step 2"
  ],
  "whyThisMeal": [
    "Reason 1",
    "Reason 2"
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const responseText = response.choices[0]?.message?.content || "{}";
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } 
    
    // ACTION 2: GENERATE FULL WEEKLY PLAN
    else {
      const prompt = `You are Dinnero, an AI meal planning assistant for Italian grocery shoppers.
Create a realistic 7-day dinner meal plan.

User context:
- Grocery shop: ${shop}
- Weekly dinner budget range: ${budgetMin} EUR to ${budgetMax} EUR
- Number of people: ${numberOfPeople}
- Main goal: ${goal}
- Food vibes: ${vibes.join(", ")}
- Dietary needs: ${dietaryNeeds.join(", ")}
- Max cooking time: ${maxCookingTime}
- Kitchen inventory: ${kitchenItems.join(", ")}

Important rules:
- Generate dinner only.
- Generate exactly 7 meals from Monday to Sunday.
- Keep the estimated total under ${budgetMax} EUR if possible.
- If the budget is too low, create the cheapest realistic plan and explain the budget confidence.
- Prefer simple Italian supermarket ingredients.
- Reuse ingredients across multiple meals to reduce waste.
- Do not include rare or luxury ingredients.
- Respect dietary needs strictly.
- Respect max cooking time.
- Include why each meal was selected.
- Return JSON only. No explanations.

Expected JSON format:
{
  "estimatedTotal": 42,
  "estimatedMin": 39,
  "estimatedMax": 47,
  "budgetConfidence": 86,
  "budgetMessage": "This plan should stay within your selected budget range.",
  "meals": [
    {
      "day": "Monday",
      "title": "Tomato Tuna Pasta",
      "description": "A quick budget-friendly pasta using pantry ingredients.",
      "estimatedCost": 4.2,
      "calories": 620,
      "prepTimeMinutes": 20,
      "ingredients": [
        {
          "name": "Pasta",
          "quantity": "200g",
          "estimatedPrice": 0.6
        }
      ],
      "recipeSteps": [
        "Boil the pasta.",
        "Cook onion with olive oil.",
        "Add tomato sauce and tuna.",
        "Mix with pasta and serve."
      ],
      "whyThisMeal": [
        "Uses ingredients already in your kitchen",
        "Ready in under 20 minutes",
        "Keeps the weekly plan affordable"
      ]
    }
  ],
  "shoppingList": [
    {
      "name": "Pasta",
      "category": "Pantry",
      "quantity": "1kg",
      "estimatedPrice": 1.4,
      "usedInMeals": ["Monday", "Friday"]
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const responseText = response.choices[0]?.message?.content || "{}";
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error("Error in AI generate route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
