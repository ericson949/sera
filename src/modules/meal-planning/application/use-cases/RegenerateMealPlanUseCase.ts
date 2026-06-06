import { MealPlanRepository } from "../../domain/repositories/MealPlanRepository";
import { UserPreferencesRepository } from "@/modules/users/domain/repositories/UserPreferencesRepository";
import { MealPlanAIService } from "../../domain/services/MealPlanAIService";
import { SubscriptionService } from "@/modules/subscriptions/domain/services/SubscriptionService";
import { MealPlan } from "../../domain/entities/MealPlan";
import { GenerateMealPlanUseCase } from "./GenerateMealPlanUseCase";

export class RegenerateMealPlanUseCase {
  private generateMealPlanUseCase: GenerateMealPlanUseCase;

  constructor(
    mealPlanRepo: MealPlanRepository,
    userPrefsRepo: UserPreferencesRepository,
    aiService: MealPlanAIService,
    subService: SubscriptionService
  ) {
    this.generateMealPlanUseCase = new GenerateMealPlanUseCase(
      mealPlanRepo,
      userPrefsRepo,
      aiService,
      subService
    );
  }

  async execute(userId: string): Promise<MealPlan> {
    return this.generateMealPlanUseCase.execute(userId);
  }
}
