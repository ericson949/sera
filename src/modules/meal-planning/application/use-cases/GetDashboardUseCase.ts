import { MealPlanRepository } from "../../domain/repositories/MealPlanRepository";
import { UserPreferencesRepository } from "@/modules/users/domain/repositories/UserPreferencesRepository";
import { MealPlan } from "../../domain/entities/MealPlan";
import { UserPreferences } from "@/modules/users/domain/entities/UserPreferences";
import { SubscriptionStatus } from "@/modules/users/domain/entities/User";

export type DashboardDTO = {
  currentPlan: MealPlan | null;
  savedPlans: MealPlan[];
  favoriteMeals: { mealId: string; title: string; planId: string }[];
  budgetHistory: { date: Date; budgetMax: number; estimatedTotal: number }[];
  subscriptionStatus: SubscriptionStatus;
  preferences: UserPreferences | null;
};

export class GetDashboardUseCase {
  constructor(
    private mealPlanRepo: MealPlanRepository,
    private userPrefsRepo: UserPreferencesRepository
  ) {}

  async execute(userId: string, subscriptionStatus: SubscriptionStatus = "free"): Promise<DashboardDTO> {
    const currentPlan = await this.mealPlanRepo.findCurrentByUserId(userId);
    const savedPlans = await this.mealPlanRepo.findSavedByUserId(userId);
    const preferences = await this.userPrefsRepo.findByUserId(userId);

    // Derive budget history from current & saved plans
    const allPlans = [...savedPlans];
    if (currentPlan) {
      allPlans.push(currentPlan);
    }
    
    // Sort by date
    allPlans.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const budgetHistory = allPlans.map((p) => ({
      date: p.createdAt,
      budgetMax: p.budget.max,
      estimatedTotal: p.estimatedTotal.amount,
    }));

    // Get favorite meals (derive from saved plans for MVP)
    const favoriteMeals: { mealId: string; title: string; planId: string }[] = [];
    savedPlans.forEach((plan) => {
      plan.days.slice(0, 2).forEach((meal) => { // take a few meals as suggestions
        favoriteMeals.push({
          mealId: meal.id,
          title: meal.title,
          planId: plan.id,
        });
      });
    });

    return {
      currentPlan,
      savedPlans,
      favoriteMeals,
      budgetHistory,
      subscriptionStatus,
      preferences,
    };
  }
}
