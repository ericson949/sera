import { MealPlanRepository } from "../../domain/repositories/MealPlanRepository";
import { UserPreferencesRepository } from "@/modules/users/domain/repositories/UserPreferencesRepository";
import { MealPlanAIService } from "../../domain/services/MealPlanAIService";
import { SubscriptionService } from "@/modules/subscriptions/domain/services/SubscriptionService";
import { MealPlan } from "../../domain/entities/MealPlan";
import { Meal } from "../../domain/entities/Meal";
import { createMoney } from "../../domain/value-objects/Money";
import { WeekDay } from "../../domain/value-objects/WeekDay";
import { ShoppingCategory } from "../../domain/value-objects/ShoppingCategory";

export class SwapMealUseCase {
  constructor(
    private mealPlanRepo: MealPlanRepository,
    private userPrefsRepo: UserPreferencesRepository,
    private aiService: MealPlanAIService,
    private subService: SubscriptionService
  ) {}

  async execute(userId: string, dayToSwap: WeekDay): Promise<MealPlan> {
    // 1. Check permission
    const canSwap = await this.subService.canSwapMeal(userId);
    if (!canSwap) {
      throw new Error("You have reached the meal swap limit. Please upgrade to Pro.");
    }

    // 2. Fetch current plan
    const currentPlan = await this.mealPlanRepo.findCurrentByUserId(userId);
    if (!currentPlan) {
      throw new Error("No active meal plan found to swap.");
    }

    // 3. Fetch user preferences
    const preferences = await this.userPrefsRepo.findByUserId(userId);
    if (!preferences) {
      throw new Error("User preferences not found.");
    }

    const oldMeal = currentPlan.days.find((d) => d.day === dayToSwap);
    if (!oldMeal) {
      throw new Error(`Meal for ${dayToSwap} not found in current plan.`);
    }

    // 4. Call AI to swap
    const excludeTitles = currentPlan.days.map((d) => d.title);
    const dto = await this.aiService.swapMeal({
      shop: currentPlan.shop,
      budgetMin: currentPlan.budget.min,
      budgetMax: currentPlan.budget.max,
      numberOfPeople: currentPlan.peopleCount,
      goal: preferences.goal,
      vibes: preferences.vibes,
      dietaryNeeds: preferences.dietaryNeeds,
      maxCookingTime: preferences.maxCookingTime,
      kitchenItems: preferences.kitchenItems,
      batchCooking: preferences.batchCooking,
      dayToSwap,
      excludeTitles,
    });

    // 5. Map DTO to Meal entity
    const newMeal: Meal = {
      id: `meal-${dayToSwap}-${Date.now()}`,
      day: dayToSwap,
      title: dto.title,
      description: dto.description,
      estimatedCost: createMoney(dto.estimatedCost),
      calories: dto.calories,
      prepTimeMinutes: dto.prepTimeMinutes,
      ingredients: dto.ingredients.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity,
        estimatedPrice: createMoney(ing.estimatedPrice),
      })),
      recipeSteps: dto.recipeSteps,
      whyThisMeal: dto.whyThisMeal,
    };

    // 6. Update the days
    const updatedDays = currentPlan.days.map((m) =>
      m.day === dayToSwap ? newMeal : m
    );

    // 7. Adjust the shopping list
    const updatedShoppingList = [...currentPlan.shoppingList];

    // Remove old meal ingredients references
    for (const oldIng of oldMeal.ingredients) {
      const idx = updatedShoppingList.findIndex(
        (item) => item.name.toLowerCase() === oldIng.name.toLowerCase()
      );
      if (idx !== -1) {
        const item = updatedShoppingList[idx];
        const newUsed = item.usedInMeals.filter((d) => d !== dayToSwap);
        if (newUsed.length === 0) {
          // Remove item entirely
          updatedShoppingList.splice(idx, 1);
        } else {
          updatedShoppingList[idx] = {
            ...item,
            usedInMeals: newUsed,
          };
        }
      }
    }

    // Add new meal ingredients
    for (const newIng of newMeal.ingredients) {
      const idx = updatedShoppingList.findIndex(
        (item) => item.name.toLowerCase() === newIng.name.toLowerCase()
      );
      if (idx !== -1) {
        const item = updatedShoppingList[idx];
        if (!item.usedInMeals.includes(dayToSwap)) {
          updatedShoppingList[idx] = {
            ...item,
            usedInMeals: [...item.usedInMeals, dayToSwap],
          };
        }
      } else {
        // Guess a category based on the name
        let category: ShoppingCategory = "Pantry";
        const nameLower = newIng.name.toLowerCase();
        if (
          nameLower.includes("pollo") ||
          nameLower.includes("carne") ||
          nameLower.includes("pesce") ||
          nameLower.includes("tonno") ||
          nameLower.includes("tuna") ||
          nameLower.includes("salmone") ||
          nameLower.includes("tacchino")
        ) {
          category = "Meat & Fish";
        } else if (
          nameLower.includes("pomodor") ||
          nameLower.includes("lattuga") ||
          nameLower.includes("patat") ||
          nameLower.includes("cipoll") ||
          nameLower.includes("aglio") ||
          nameLower.includes("verdura") ||
          nameLower.includes("carot") ||
          nameLower.includes("limon") ||
          nameLower.includes("zucchine") ||
          nameLower.includes("spinaci")
        ) {
          category = "Vegetables";
        } else if (
          nameLower.includes("formaggio") ||
          nameLower.includes("latte") ||
          nameLower.includes("uova") ||
          nameLower.includes("eggs") ||
          nameLower.includes("mozzarella") ||
          nameLower.includes("yogurt") ||
          nameLower.includes("burro")
        ) {
          category = "Dairy";
        } else if (
          nameLower.includes("surgelat") ||
          nameLower.includes("frozen")
        ) {
          category = "Frozen";
        } else if (
          nameLower.includes("sale") ||
          nameLower.includes("pepe") ||
          nameLower.includes("spezie") ||
          nameLower.includes("origano") ||
          nameLower.includes("basilico")
        ) {
          category = "Spices";
        }

        updatedShoppingList.push({
          id: `shop-item-${dayToSwap}-${Math.random().toString(36).substr(2, 9)}`,
          name: newIng.name,
          category,
          quantity: newIng.quantity,
          estimatedPrice: newIng.estimatedPrice,
          usedInMeals: [dayToSwap],
          checked: false,
        });
      }
    }

    // 8. Recalculate totals
    const totalMealsCost = updatedDays.reduce(
      (sum, m) => sum + m.estimatedCost.amount,
      0
    );
    const estimatedTotal = createMoney(totalMealsCost);
    // Min is roughly 10% less, Max is 10% more
    const estimatedMin = createMoney(Math.max(15, Math.round(totalMealsCost * 0.9)));
    const estimatedMax = createMoney(Math.round(totalMealsCost * 1.1));

    const updatedPlan: MealPlan = {
      ...currentPlan,
      days: updatedDays,
      shoppingList: updatedShoppingList,
      estimatedTotal,
      estimatedMin,
      estimatedMax,
    };

    // 9. Save
    await this.mealPlanRepo.save(updatedPlan);

    return updatedPlan;
  }
}
