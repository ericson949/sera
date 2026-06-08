import { SubscriptionStatus } from "@/modules/users/domain/entities/User";

export type CheckoutSession = {
  url: string | null;
};

export type WebhookResult = {
  userId: string;
  status: SubscriptionStatus;
} | null;

export interface PaymentProvider {
  createCheckoutSession(userId: string, email: string, origin: string): Promise<CheckoutSession>;
  handleWebhook(signature: string, rawBody: string): Promise<WebhookResult>;
}
