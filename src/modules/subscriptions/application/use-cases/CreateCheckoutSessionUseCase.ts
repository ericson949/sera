import { SubscriptionService } from "../../domain/services/SubscriptionService";

export class CreateCheckoutSessionUseCase {
  constructor(private subService: SubscriptionService) {}

  async execute(userId: string, email: string, origin: string): Promise<{ url: string | null }> {
    return this.subService.createCheckoutSession(userId, email, origin);
  }
}
