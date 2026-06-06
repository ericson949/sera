import {
  MealPlanAIService,
  GenerateMealPlanInput,
  GeneratedMealPlanDTO,
  GeneratedMealDTO,
  SwapMealInput,
} from "../../domain/services/MealPlanAIService";
import { WeekDay } from "../../domain/value-objects/WeekDay";

// Library of mock Italian recipes
interface MockRecipe {
  title: string;
  description: string;
  baseCost: number;
  calories: number;
  prepTime: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isLactoseFree: boolean;
  isHalal: boolean;
  isPescatarian: boolean;
  ingredients: { name: string; category: string; baseQty: string; basePrice: number }[];
  steps: string[];
  reasons: string[];
}

const RECIPE_LIBRARY: MockRecipe[] = [
  {
    title: "Tomato Tuna Pasta",
    description: "A quick budget-friendly pasta using pantry ingredients and canned tuna.",
    baseCost: 3.5,
    calories: 620,
    prepTime: 20,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false, // standard pasta
    isLactoseFree: true,
    isHalal: false,
    isPescatarian: true,
    ingredients: [
      { name: "Pasta", category: "Pantry", baseQty: "200g", basePrice: 0.4 },
      { name: "Canned tuna", category: "Meat & Fish", baseQty: "160g", basePrice: 2.2 },
      { name: "Tomato sauce", category: "Pantry", baseQty: "250g", basePrice: 0.6 },
      { name: "Onion", category: "Vegetables", baseQty: "1", basePrice: 0.2 },
      { name: "Olive oil", category: "Pantry", baseQty: "20ml", basePrice: 0.1 },
    ],
    steps: [
      "Boil water in a large pot and cook the pasta according to package instructions.",
      "In a pan, heat olive oil and sauté finely chopped onion until soft.",
      "Add drained canned tuna and tomato sauce to the pan. Simmer for 10 minutes.",
      "Drain pasta, toss it into the sauce, and serve hot."
    ],
    reasons: [
      "Uses pasta and canned tuna from your pantry",
      "Ready in under 20 minutes",
      "Keeps the weekly plan affordable"
    ]
  },
  {
    title: "Chicken Zucchini Rice Bowl",
    description: "Lean chicken breast sautéed with fresh zucchini served over rice.",
    baseCost: 4.8,
    calories: 550,
    prepTime: 30,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isLactoseFree: true,
    isHalal: true,
    isPescatarian: false,
    ingredients: [
      { name: "Rice", category: "Pantry", baseQty: "150g", basePrice: 0.5 },
      { name: "Chicken breast", category: "Meat & Fish", baseQty: "250g", basePrice: 3.0 },
      { name: "Zucchini", category: "Vegetables", baseQty: "200g", basePrice: 0.8 },
      { name: "Olive oil", category: "Pantry", baseQty: "20ml", basePrice: 0.1 },
      { name: "Garlic", category: "Vegetables", baseQty: "1 clove", basePrice: 0.4 },
    ],
    steps: [
      "Cook rice in boiling salted water.",
      "Cut chicken breast and zucchini into bite-sized cubes.",
      "Sauté garlic in olive oil, then add chicken and cook until golden.",
      "Add zucchini and cook for another 8-10 minutes. Mix with rice and enjoy."
    ],
    reasons: [
      "High in protein to support your goal",
      "Features healthy fresh vegetables",
      "Gluten-free friendly recipe"
    ]
  },
  {
    title: "Rustic Lentil Soup",
    description: "A warm, comforting soup made with brown lentils, carrots, and potatoes.",
    baseCost: 2.8,
    calories: 420,
    prepTime: 35,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true,
    isHalal: true,
    isPescatarian: true,
    ingredients: [
      { name: "Brown lentils", category: "Pantry", baseQty: "200g", basePrice: 0.7 },
      { name: "Carrot", category: "Vegetables", baseQty: "1", basePrice: 0.3 },
      { name: "Potatoes", category: "Vegetables", baseQty: "200g", basePrice: 0.6 },
      { name: "Tomato sauce", category: "Pantry", baseQty: "100g", basePrice: 0.3 },
      { name: "Onion", category: "Vegetables", baseQty: "1", basePrice: 0.2 },
      { name: "Garlic", category: "Vegetables", baseQty: "1 clove", basePrice: 0.4 },
      { name: "Olive oil", category: "Pantry", baseQty: "20ml", basePrice: 0.3 },
    ],
    steps: [
      "Chop onion, garlic, and carrot. Dice the potato.",
      "Sauté onion, garlic, and carrot in olive oil in a deep pot.",
      "Add potatoes, lentils, tomato sauce, and 800ml of water.",
      "Simmer for 25-30 minutes until lentils and potatoes are tender."
    ],
    reasons: [
      "Uses lentils and onion already in your kitchen",
      "Very cheap eats that lower your total grocery bill",
      "Rich in fiber and 100% vegan"
    ]
  },
  {
    title: "Vegetable Frittata",
    description: "An Italian classic egg dish baked with onions, spinach, and potatoes.",
    baseCost: 3.2,
    calories: 480,
    prepTime: 20,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    isLactoseFree: true,
    isHalal: true,
    isPescatarian: true,
    ingredients: [
      { name: "Eggs", category: "Dairy", baseQty: "4", basePrice: 1.2 },
      { name: "Potatoes", category: "Vegetables", baseQty: "150g", basePrice: 0.5 },
      { name: "Frozen vegetables", category: "Frozen", baseQty: "150g", basePrice: 1.0 },
      { name: "Onion", category: "Vegetables", baseQty: "1", basePrice: 0.2 },
      { name: "Olive oil", category: "Pantry", baseQty: "15ml", basePrice: 0.3 },
    ],
    steps: [
      "Thinly slice potatoes and onion.",
      "Heat olive oil in a frying pan and cook potato slices and onion until soft.",
      "Beat eggs in a bowl with a pinch of salt. Pour over potatoes and frozen vegetables.",
      "Cook on medium heat until the bottom is set, flip, and cook the other side."
    ],
    reasons: [
      "Ready in 20 minutes for a quick dinner",
      "Reuses potatoes from other meals",
      "High protein vegetarian option"
    ]
  },
  {
    title: "Pasta al Pesto",
    description: "Classic Italian pasta tossed with fragrant green basil pesto sauce.",
    baseCost: 2.9,
    calories: 590,
    prepTime: 15,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isLactoseFree: false,
    isHalal: true,
    isPescatarian: true,
    ingredients: [
      { name: "Pasta", category: "Pantry", baseQty: "200g", basePrice: 0.4 },
      { name: "Pesto sauce", category: "Pantry", baseQty: "90g", basePrice: 1.8 },
      { name: "Cheese", category: "Dairy", baseQty: "30g", basePrice: 0.7 },
    ],
    steps: [
      "Boil pasta in salted water.",
      "Drain pasta, reserving a couple of tablespoons of cooking water.",
      "Mix pasta with pesto and reserved water. Top with grated cheese."
    ],
    reasons: [
      "Super quick meal ready in 15 minutes",
      "Italian comfort food favorite",
      "Highly affordable pantry dish"
    ]
  },
  {
    title: "Potato Tuna Salad",
    description: "A refreshing dinner salad with boiled potatoes, canned tuna, and beans.",
    baseCost: 4.0,
    calories: 510,
    prepTime: 25,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isLactoseFree: true,
    isHalal: false,
    isPescatarian: true,
    ingredients: [
      { name: "Potatoes", category: "Vegetables", baseQty: "250g", basePrice: 0.8 },
      { name: "Canned tuna", category: "Meat & Fish", baseQty: "160g", basePrice: 2.2 },
      { name: "Beans", category: "Pantry", baseQty: "200g", basePrice: 0.8 },
      { name: "Olive oil", category: "Pantry", baseQty: "10ml", basePrice: 0.2 },
    ],
    steps: [
      "Boil whole potatoes until soft, then peel and dice.",
      "Drain the canned tuna and beans.",
      "Toss potatoes, tuna, and beans in a serving bowl.",
      "Drizzle with olive oil, salt, and pepper. Serve cold."
    ],
    reasons: [
      "Uses potatoes already in your inventory",
      "No complex cooking required",
      "Perfect balanced Mediterranean diet meal"
    ]
  },
  {
    title: "Chickpea Tomato Stew",
    description: "A hearty vegetarian stew with chickpeas, canned tomatoes, and spices.",
    baseCost: 3.1,
    calories: 450,
    prepTime: 25,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true,
    isHalal: true,
    isPescatarian: true,
    ingredients: [
      { name: "Beans", category: "Pantry", baseQty: "240g", basePrice: 0.8 },
      { name: "Tomato sauce", category: "Pantry", baseQty: "400g", basePrice: 1.0 },
      { name: "Garlic", category: "Vegetables", baseQty: "2 cloves", basePrice: 0.8 },
      { name: "Onion", category: "Vegetables", baseQty: "1", basePrice: 0.2 },
      { name: "Spices", category: "Spices", baseQty: "1 pinch", basePrice: 0.3 },
    ],
    steps: [
      "Sauté chopped onion and garlic in a pot with olive oil.",
      "Add tomato sauce, chickpeas (beans), and spices.",
      "Simmer for 15 minutes to allow flavors to combine.",
      "Serve hot with toasted bread if desired."
    ],
    reasons: [
      "Zero waste recipe reusing beans and tomatoes",
      "Rich in plant-based proteins",
      "Low prep time and budget friendly"
    ]
  },
  {
    title: "Tuna Rice Salad",
    description: "A cold rice salad mixed with tuna, sweet corn, and frozen peas.",
    baseCost: 3.8,
    calories: 530,
    prepTime: 20,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isLactoseFree: true,
    isHalal: false,
    isPescatarian: true,
    ingredients: [
      { name: "Rice", category: "Pantry", baseQty: "150g", basePrice: 0.5 },
      { name: "Canned tuna", category: "Meat & Fish", baseQty: "80g", basePrice: 1.1 },
      { name: "Frozen vegetables", category: "Frozen", baseQty: "150g", basePrice: 1.0 },
      { name: "Olive oil", category: "Pantry", baseQty: "15ml", basePrice: 0.3 },
      { name: "Yogurt", category: "Dairy", baseQty: "50g", basePrice: 0.9 },
    ],
    steps: [
      "Boil rice, adding frozen peas in the last 5 minutes.",
      "Drain and rinse with cold water.",
      "Toss with drained tuna, corn, olive oil, and yogurt for creaminess."
    ],
    reasons: [
      "Ready in 20 minutes",
      "Refreshing and high-protein salad",
      "Utilizes pantry tuna and frozen items"
    ]
  },
  {
    title: "Pasta e Fagioli",
    description: "Traditional Italian pasta and bean soup, thick and nutritious.",
    baseCost: 2.6,
    calories: 580,
    prepTime: 30,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    isLactoseFree: true,
    isHalal: true,
    isPescatarian: true,
    ingredients: [
      { name: "Pasta", category: "Pantry", baseQty: "150g", basePrice: 0.3 },
      { name: "Beans", category: "Pantry", baseQty: "240g", basePrice: 0.8 },
      { name: "Tomato sauce", category: "Pantry", baseQty: "100g", basePrice: 0.3 },
      { name: "Onion", category: "Vegetables", baseQty: "1", basePrice: 0.2 },
      { name: "Olive oil", category: "Pantry", baseQty: "10ml", basePrice: 0.2 },
      { name: "Spices", category: "Spices", baseQty: "1 pinch", basePrice: 0.2 },
    ],
    steps: [
      "Sauté chopped onion in olive oil.",
      "Add tomato sauce, drained beans, spices, and 500ml water. Simmer 10 minutes.",
      "Mash some beans to thicken the broth, add pasta directly into the pot.",
      "Cook until pasta is al dente, stirring frequently."
    ],
    reasons: [
      "Traditional Italian budget staple",
      "Uses affordable canned beans and pasta",
      "Very low waste and high fiber"
    ]
  }
];

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

  private filterRecipes(
    dietaryNeeds: string[],
    maxTime: string
  ): MockRecipe[] {
    return RECIPE_LIBRARY.filter((recipe) => {
      // 1. Dietary Needs check
      if (dietaryNeeds.includes("Vegetarian") && !recipe.isVegetarian) return false;
      if (dietaryNeeds.includes("Vegan") && !recipe.isVegan) return false;
      if (dietaryNeeds.includes("Gluten-free") && !recipe.isGlutenFree) return false;
      if (dietaryNeeds.includes("Lactose-free") && !recipe.isLactoseFree) return false;
      if (dietaryNeeds.includes("Halal") && !recipe.isHalal) return false;
      if (dietaryNeeds.includes("Pescatarian") && !recipe.isPescatarian) return false;

      // 2. Cooking Time check
      if (maxTime === "15 min" && recipe.prepTime > 15) return false;
      if (maxTime === "30 min" && recipe.prepTime > 30) return false;
      if (maxTime === "45 min" && recipe.prepTime > 45) return false;
      if (maxTime === "60 min" && recipe.prepTime > 60) return false;

      return true;
    });
  }

  async generateMealPlan(input: GenerateMealPlanInput): Promise<GeneratedMealPlanDTO> {
    // Artificial delay to simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const shopMultiplier = this.getStoreMultiplier(input.shop);
    const peopleMultiplier = 0.7 + 0.3 * input.numberOfPeople;

    // Filter recipes
    let availableRecipes = this.filterRecipes(input.dietaryNeeds, input.maxCookingTime);
    if (availableRecipes.length === 0) {
      // Fallback if filters are too strict
      availableRecipes = RECIPE_LIBRARY;
    }

    const weekdays: WeekDay[] = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const chosenMeals: (GeneratedMealDTO & { day: WeekDay })[] = [];

    weekdays.forEach((day, index) => {
      // Pick recipe cyclically or randomly
      const recipe = availableRecipes[index % availableRecipes.length];
      const cost = Math.round(recipe.baseCost * shopMultiplier * peopleMultiplier * 100) / 100;

      // Scale ingredient quantities & prices
      const scaledIngredients = recipe.ingredients.map((ing) => {
        let qtyStr = ing.baseQty;
        // Simple scaling display
        if (ing.baseQty.endsWith("g")) {
          const grams = parseInt(ing.baseQty);
          qtyStr = `${Math.round(grams * peopleMultiplier)}g`;
        } else if (ing.baseQty.endsWith("ml")) {
          const ml = parseInt(ing.baseQty);
          qtyStr = `${Math.round(ml * peopleMultiplier)}ml`;
        } else {
          // eggs or counts
          const count = parseFloat(ing.baseQty);
          if (!isNaN(count)) {
            qtyStr = `${Math.max(1, Math.round(count * peopleMultiplier))}`;
          }
        }

        return {
          name: ing.name,
          estimatedPrice: Math.round(ing.basePrice * shopMultiplier * peopleMultiplier * 100) / 100,
          quantity: qtyStr,
        };
      });

      chosenMeals.push({
        day,
        title: recipe.title,
        description: recipe.description,
        estimatedCost: cost,
        calories: recipe.calories,
        prepTimeMinutes: recipe.prepTime,
        ingredients: scaledIngredients,
        recipeSteps: recipe.steps,
        whyThisMeal: recipe.reasons.map((r) =>
          input.kitchenItems.some((k) => r.toLowerCase().includes(k.toLowerCase()))
            ? `Uses ${input.kitchenItems.filter((k) => r.toLowerCase().includes(k.toLowerCase()))[0]} already in your kitchen`
            : r
        ),
      });
    });

    // Generate shopping list items by consolidating duplicates
    const shoppingMap = new Map<string, {
      name: string;
      category: string;
      totalPrice: number;
      qtySum: number;
      qtyUnit: string;
      usedIn: string[];
    }>();

    chosenMeals.forEach((meal) => {
      meal.ingredients.forEach((ing) => {
        const itemInLib = RECIPE_LIBRARY.flatMap((r) => r.ingredients).find(
          (i) => i.name.toLowerCase() === ing.name.toLowerCase()
        );
        const category = itemInLib ? itemInLib.category : "Pantry";
        const key = ing.name.toLowerCase();

        // Extract qty number and unit
        let qtyVal = 1;
        let unit = "";
        const match = ing.quantity.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
        if (match) {
          qtyVal = parseFloat(match[1]);
          unit = match[2];
        }

        const existing = shoppingMap.get(key);
        if (existing) {
          existing.totalPrice += ing.estimatedPrice;
          existing.qtySum += qtyVal;
          if (!existing.usedIn.includes(meal.day)) {
            existing.usedIn.push(meal.day);
          }
          shoppingMap.set(key, existing);
        } else {
          shoppingMap.set(key, {
            name: ing.name,
            category,
            totalPrice: ing.estimatedPrice,
            qtySum: qtyVal,
            qtyUnit: unit,
            usedIn: [meal.day],
          });
        }
      });
    });

    const shoppingList = Array.from(shoppingMap.values()).map((val) => {
      // Format quantity
      let formattedQty = `${val.qtySum.toFixed(0)}${val.qtyUnit ? " " + val.qtyUnit : ""}`;
      if (val.qtyUnit === "g" && val.qtySum >= 1000) {
        formattedQty = `${(val.qtySum / 1000).toFixed(1)}kg`;
      } else if (val.qtyUnit === "ml" && val.qtySum >= 1000) {
        formattedQty = `${(val.qtySum / 1000).toFixed(1)}L`;
      }

      return {
        name: val.name,
        category: val.category,
        quantity: formattedQty,
        estimatedPrice: Math.round(val.totalPrice * 0.85 * 100) / 100, // bulk discount in shopping list
        usedInMeals: val.usedIn,
      };
    });

    const estimatedTotal = chosenMeals.reduce((sum, m) => sum + m.estimatedCost, 0);
    // Bulk ingredients cost slightly less than the sum of raw portions
    const finalTotal = Math.round(estimatedTotal * 0.9 * 100) / 100;
    const estimatedMin = Math.round(finalTotal * 0.9 * 100) / 100;
    const estimatedMax = Math.round(finalTotal * 1.1 * 100) / 100;

    // Budget check message
    let budgetMessage = "This plan should stay within your selected budget range.";
    let confidence = 86 + Math.floor(Math.random() * 10);
    if (finalTotal > input.budgetMax) {
      budgetMessage = "This plan may slightly exceed your budget due to scaling for " + input.numberOfPeople + " people.";
      confidence = Math.max(50, confidence - 25);
    } else if (finalTotal < input.budgetMin) {
      budgetMessage = "Great! This plan is extremely cheap and stays under your minimum budget.";
    }

    return {
      estimatedTotal: finalTotal,
      estimatedMin,
      estimatedMax,
      budgetConfidence: confidence,
      budgetMessage,
      meals: chosenMeals,
      shoppingList,
    };
  }

  async swapMeal(input: SwapMealInput): Promise<GeneratedMealDTO> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const shopMultiplier = this.getStoreMultiplier(input.shop);
    const peopleMultiplier = 0.7 + 0.3 * input.numberOfPeople;

    const filtered = this.filterRecipes(input.dietaryNeeds, input.maxCookingTime);
    // Find recipes that are not in the exclude list
    const candidateRecipes = filtered.filter(
      (r) => !input.excludeTitles.includes(r.title)
    );

    const recipe = candidateRecipes.length > 0
      ? candidateRecipes[Math.floor(Math.random() * candidateRecipes.length)]
      : RECIPE_LIBRARY[Math.floor(Math.random() * RECIPE_LIBRARY.length)];

    const cost = Math.round(recipe.baseCost * shopMultiplier * peopleMultiplier * 100) / 100;

    const scaledIngredients = recipe.ingredients.map((ing) => {
      let qtyStr = ing.baseQty;
      if (ing.baseQty.endsWith("g")) {
        qtyStr = `${Math.round(parseInt(ing.baseQty) * peopleMultiplier)}g`;
      } else if (ing.baseQty.endsWith("ml")) {
        qtyStr = `${Math.round(parseInt(ing.baseQty) * peopleMultiplier)}ml`;
      } else {
        const count = parseFloat(ing.baseQty);
        if (!isNaN(count)) {
          qtyStr = `${Math.max(1, Math.round(count * peopleMultiplier))}`;
        }
      }
      return {
        name: ing.name,
        estimatedPrice: Math.round(ing.basePrice * shopMultiplier * peopleMultiplier * 100) / 100,
        quantity: qtyStr,
      };
    });

    return {
      title: recipe.title,
      description: recipe.description,
      estimatedCost: cost,
      calories: recipe.calories,
      prepTimeMinutes: recipe.prepTime,
      ingredients: scaledIngredients,
      recipeSteps: recipe.steps,
      whyThisMeal: [
        ...recipe.reasons,
        "Ready in under " + recipe.prepTime + " minutes",
      ],
    };
  }
}
