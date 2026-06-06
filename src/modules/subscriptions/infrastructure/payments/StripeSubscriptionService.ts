import Stripe from "stripe";
import { SubscriptionService } from "../../domain/services/SubscriptionService";

export class StripeSubscriptionService implements SubscriptionService {
  constructor(
    private stripe: Stripe,
    private priceId: string,
    private webhookSecret: string
  ) {}

  async canGenerateMealPlan(): Promise<boolean> {
    return true;
  }

  async canSwapMeal(): Promise<boolean> {
    return true;
  }

  async canSavePlan(): Promise<boolean> {
    return true;
  }

  async createCheckoutSession(userId: string, email: string, origin: string): Promise<{ url: string | null }> {
    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: this.priceId, quantity: 1 }],
      metadata: { userId },
      subscription_data: {
        metadata: { userId },
      },
      success_url: `${origin}/dashboard?checkout_success=true`,
      cancel_url: `${origin}/pricing?checkout_cancelled=true`,
    });

    return { url: session.url };
  }

  async handleWebhook(signature: string, rawBody: string): Promise<{ userId: string; status: "free" | "pro" } | null> {
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      return userId ? { userId, status: "pro" } : null;
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      return userId ? { userId, status: "free" } : null;
    }

    return null;
  }
}
