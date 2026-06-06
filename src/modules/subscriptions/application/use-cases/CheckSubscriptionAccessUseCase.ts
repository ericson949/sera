import { SubscriptionService } from "../../domain/services/SubscriptionService";

export class CheckSubscriptionAccessUseCase {
  constructor(private subService: SubscriptionService) {}

  async execute(userId: string): Promise<{
    canGenerate: boolean;
    canSwap: boolean;
    canSave: boolean;
  }> {
    const canGenerate = await this.subService.canGenerateMealPlan(userId);
    const canSwap = await this.subService.canSwapMeal(userId);
    const canSave = await this.subService.canSavePlan(userId);
    return { canGenerate, canSwap, canSave };
  }
}
