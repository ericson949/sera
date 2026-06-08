import { SubscriptionService } from "../../domain/services/SubscriptionService";
import { UserRepository } from "@/modules/users/domain/repositories/UserRepository";

export class HandleSubscriptionWebhookUseCase {
  constructor(
    private subService: SubscriptionService,
    private userRepo: UserRepository
  ) {}

  async execute(signature: string, rawBody: string): Promise<boolean> {
    const result = await this.subService.handleWebhook(signature, rawBody);
    if (!result) return false;

    const user = await this.userRepo.findById(result.userId);
    if (!user) return false;

    user.subscriptionStatus = result.status;
    await this.userRepo.save(user);
    return true;
  }
}
