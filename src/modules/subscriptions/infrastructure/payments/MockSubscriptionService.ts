import { SubscriptionService } from "../../domain/services/SubscriptionService";
import { UserRepository } from "@/modules/users/domain/repositories/UserRepository";

export class MockSubscriptionService implements SubscriptionService {
  private STORAGE_KEY_USAGE = "dinnero_usage_counters";

  constructor(private userRepo: UserRepository) {}

  private getUsageCounters(): { generations: number; swaps: number } {
    if (typeof window === "undefined") {
      return { generations: 0, swaps: 0 };
    }
    const data = localStorage.getItem(this.STORAGE_KEY_USAGE);
    return data ? JSON.parse(data) : { generations: 0, swaps: 0 };
  }

  private incrementUsage(type: "generations" | "swaps") {
    if (typeof window === "undefined") return;
    const counters = this.getUsageCounters();
    counters[type]++;
    localStorage.setItem(this.STORAGE_KEY_USAGE, JSON.stringify(counters));
  }

  async canGenerateMealPlan(userId: string): Promise<boolean> {
    const user = await this.userRepo.findById(userId);
    if (user?.subscriptionStatus === "pro") {
      return true;
    }
    const counters = this.getUsageCounters();
    // Allow 1 generation + 1 regeneration (total 2) on free tier
    if (counters.generations < 2) {
      this.incrementUsage("generations");
      return true;
    }
    return false;
  }

  async canSwapMeal(userId: string): Promise<boolean> {
    const user = await this.userRepo.findById(userId);
    if (user?.subscriptionStatus === "pro") {
      return true;
    }
    const counters = this.getUsageCounters();
    // Allow 1 swap on free tier
    if (counters.swaps < 1) {
      this.incrementUsage("swaps");
      return true;
    }
    return false;
  }

  async canSavePlan(userId: string): Promise<boolean> {
    const user = await this.userRepo.findById(userId);
    return user?.subscriptionStatus === "pro";
  }

  async createCheckoutSession(userId: string, email: string, origin: string): Promise<{ url: string | null }> {
    // In mock mode, we return a success-redirect URL that points back to results/dashboard
    // but with a mock query parameter like ?checkout=success to trigger status update
    const mockSuccessUrl = `${origin}/dashboard?checkout_mock_success=true&userId=${userId}`;
    return { url: mockSuccessUrl };
  }

  async handleWebhook(signature: string, rawBody: string): Promise<{ userId: string; status: "free" | "pro" } | null> {
    // Simulating webhook processing
    try {
      const payload = JSON.parse(rawBody);
      if (payload.event === "checkout.session.completed") {
        return {
          userId: payload.userId,
          status: "pro",
        };
      }
      if (payload.event === "customer.subscription.deleted") {
        return {
          userId: payload.userId,
          status: "free",
        };
      }
    } catch {
      // ignore parsing errors
    }
    return null;
  }
}
