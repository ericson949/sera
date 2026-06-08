import { SubscriptionService } from "../../domain/services/SubscriptionService";
import { UserRepository } from "@/modules/users/domain/repositories/UserRepository";

export class ClientSubscriptionService implements SubscriptionService {
  private storageKey = "dinnero_usage_counters";

  constructor(private userRepo: UserRepository) {}

  private getUsageCounters(): { generations: number; swaps: number } {
    if (typeof window === "undefined") return { generations: 0, swaps: 0 };
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : { generations: 0, swaps: 0 };
  }

  private incrementUsage(type: "generations" | "swaps") {
    if (typeof window === "undefined") return;
    const counters = this.getUsageCounters();
    counters[type]++;
    localStorage.setItem(this.storageKey, JSON.stringify(counters));
  }

  async canGenerateMealPlan(userId: string): Promise<boolean> {
    const user = await this.userRepo.findById(userId);
    if (user?.subscriptionStatus === "pro") return true;
    const counters = this.getUsageCounters();
    if (counters.generations >= 2) return false;
    this.incrementUsage("generations");
    return true;
  }

  async canSwapMeal(userId: string): Promise<boolean> {
    const user = await this.userRepo.findById(userId);
    if (user?.subscriptionStatus === "pro") return true;
    const counters = this.getUsageCounters();
    if (counters.swaps >= 1) return false;
    this.incrementUsage("swaps");
    return true;
  }

  async canSavePlan(userId: string): Promise<boolean> {
    const user = await this.userRepo.findById(userId);
    return user?.subscriptionStatus === "pro";
  }

}
