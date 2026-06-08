import { PaymentProvider } from "../../domain/services/PaymentProvider";

export class CreateCheckoutSessionUseCase {
  constructor(private paymentProvider: PaymentProvider) {}

  async execute(userId: string, email: string, origin: string): Promise<{ url: string | null }> {
    return this.paymentProvider.createCheckoutSession(userId, email, origin);
  }
}
