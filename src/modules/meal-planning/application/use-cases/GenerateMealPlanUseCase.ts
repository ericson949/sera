import { MealPlanRepository } from "../../domain/repositories/MealPlanRepository";
import { UserPreferencesRepository } from "@/modules/users/domain/repositories/UserPreferencesRepository";
import { MealPlanAIService } from "../../domain/services/MealPlanAIService";
import { SubscriptionService } from "@/modules/subscriptions/domain/services/SubscriptionService";
import { MealPlan } from "../../domain/entities/MealPlan";
import { createMoney } from "../../domain/value-objects/Money";
import { ShoppingItem } from "../../domain/entities/ShoppingItem";
import { Meal } from "../../domain/entities/Meal";
import { ShoppingCategory } from "../../domain/value-objects/ShoppingCategory";

export class GenerateMealPlanUseCase {
  constructor(
    private mealPlanRepo: MealPlanRepository,
    private userPrefsRepo: UserPreferencesRepository,
    private aiService: MealPlanAIService,
    private subService: SubscriptionService
  ) {}

  async execute(userId: string): Promise<MealPlan> {
    // 1. Subscription check
    const canGenerate = await this.subService.canGenerateMealPlan(userId);
    if (!canGenerate) {
      throw new Error("Free tier limit reached. Please upgrade to Pro.");
    }

    // 2. Fetch user preferences
    const preferences = await this.userPrefsRepo.findByUserId(userId);
    if (!preferences) {
      throw new Error("User preferences not found. Please complete onboarding first.");
    }

    // 3. Call AI Service
    const dto = await this.aiService.generateMealPlan({
      userId,
      shop: preferences.shop,
      budgetMin: preferences.weeklyBudget.min,
      budgetMax: preferences.weeklyBudget.max,
      numberOfPeople: preferences.numberOfPeople,
      goal: preferences.goal,
      vibes: preferences.vibes,
      dietaryNeeds: preferences.dietaryNeeds,
      maxCookingTime: preferences.maxCookingTime,
      kitchenItems: preferences.kitchenItems,
      batchCooking: preferences.batchCooking,
    });

    // 4. Map DTO to MealPlan Entity
    const meals: Meal[] = dto.meals.map((m, idx) => ({
      id: `meal-${idx}-${Date.now()}`,
      day: m.day,
      title: m.title,
      description: m.description,
      imageUrl: m.imageUrl,
      estimatedCost: createMoney(m.estimatedCost),
      calories: m.calories,
      prepTimeMinutes: m.prepTimeMinutes,
      ingredients: m.ingredients.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity,
        estimatedPrice: createMoney(ing.estimatedPrice),
      })),
      recipeSteps: m.recipeSteps,
      whyThisMeal: m.whyThisMeal,
    }));

    const shoppingList: ShoppingItem[] = dto.shoppingList.map((item, idx) => ({
      id: `shop-item-${idx}-${Date.now()}`,
      name: item.name,
      category: item.category as ShoppingCategory,
      quantity: item.quantity,
      estimatedPrice: createMoney(item.estimatedPrice),
      usedInMeals: item.usedInMeals,
      checked: false,
    }));

    const plan: MealPlan = {
      id: `plan-${Date.now()}`,
      userId,
      shop: preferences.shop,
      budget: preferences.weeklyBudget,
      estimatedTotal: createMoney(dto.estimatedTotal),
      estimatedMin: createMoney(dto.estimatedMin),
      estimatedMax: createMoney(dto.estimatedMax),
      budgetConfidence: dto.budgetConfidence,
      peopleCount: preferences.numberOfPeople,
      days: meals,
      shoppingList,
      createdAt: new Date(),
    };

    // 5. Save in database
    await this.mealPlanRepo.save(plan);

    return plan;
  }
}
