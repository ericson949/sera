import { PaymentProvider } from "../../domain/services/PaymentProvider";

export class HttpPaymentProvider implements PaymentProvider {
  async createCheckoutSession(userId: string, email: string, origin: string): Promise<{ url: string | null }> {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, email, origin }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Unable to create checkout");
    }

    return response.json();
  }

  async handleWebhook(): Promise<null> {
    return null;
  }
}
