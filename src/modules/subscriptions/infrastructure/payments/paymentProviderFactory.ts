import { PaymentProvider } from "../../domain/services/PaymentProvider";
import { LemonSqueezySubscriptionService } from "./LemonSqueezySubscriptionService";

export type PaymentProviderName = "lemon-squeezy";

export function getPaymentProviderName(): PaymentProviderName {
  const provider = process.env.PAYMENT_PROVIDER || "lemon-squeezy";
  if (provider === "lemon-squeezy") return provider;
  throw new Error(`Unsupported payment provider: ${provider}`);
}

export function createConfiguredPaymentProvider(): PaymentProvider | null {
  const provider = getPaymentProviderName();

  if (provider === "lemon-squeezy") {
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    const variantId = process.env.LEMON_SQUEEZY_PRO_VARIANT_ID;
    const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "not-used-for-checkout";
    if (!apiKey || !storeId || !variantId) return null;
    return new LemonSqueezySubscriptionService(apiKey, storeId, variantId, webhookSecret);
  }

  return null;
}
