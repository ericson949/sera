export interface SubscriptionService {
  canGenerateMealPlan(userId: string): Promise<boolean>;
  canSwapMeal(userId: string): Promise<boolean>;
  canSavePlan(userId: string): Promise<boolean>;
  createCheckoutSession(userId: string, email: string, origin: string): Promise<{ url: string | null }>;
  handleWebhook(signature: string, rawBody: string): Promise<{ userId: string; status: "free" | "pro" } | null>;
}
