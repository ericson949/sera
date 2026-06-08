export interface SubscriptionService {
  canGenerateMealPlan(userId: string): Promise<boolean>;
  canSwapMeal(userId: string): Promise<boolean>;
  canSavePlan(userId: string): Promise<boolean>;
}
