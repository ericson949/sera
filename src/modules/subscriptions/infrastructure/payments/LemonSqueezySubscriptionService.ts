import { createHmac, timingSafeEqual } from "crypto";
import { PaymentProvider } from "../../domain/services/PaymentProvider";

type LemonCheckoutResponse = {
  data?: {
    attributes?: {
      url?: string;
    };
  };
  errors?: { detail?: string; title?: string }[];
};

type LemonWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: {
      user_id?: string;
      userId?: string;
    };
  };
  data?: {
    attributes?: {
      status?: string;
    };
  };
};

export class LemonSqueezySubscriptionService implements PaymentProvider {
  constructor(
    private apiKey: string,
    private storeId: string,
    private variantId: string,
    private webhookSecret: string
  ) {}

  async createCheckoutSession(userId: string, email: string, origin: string): Promise<{ url: string | null }> {
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email,
              custom: { user_id: userId },
            },
            product_options: {
              redirect_url: `${origin}/dashboard?checkout_success=true`,
            },
          },
          relationships: {
            store: { data: { type: "stores", id: this.storeId } },
            variant: { data: { type: "variants", id: this.variantId } },
          },
        },
      }),
    });

    const data = (await response.json()) as LemonCheckoutResponse;
    if (!response.ok) {
      const message = data.errors?.[0]?.detail || data.errors?.[0]?.title || "Unable to create Lemon Squeezy checkout";
      throw new Error(message);
    }

    return { url: data.data?.attributes?.url ?? null };
  }

  async handleWebhook(signature: string, rawBody: string): Promise<{ userId: string; status: "free" | "pro" } | null> {
    if (!this.isValidSignature(signature, rawBody)) {
      throw new Error("Invalid Lemon Squeezy webhook signature");
    }

    const payload = JSON.parse(rawBody) as LemonWebhookPayload;
    const eventName = payload.meta?.event_name;
    const userId = payload.meta?.custom_data?.user_id || payload.meta?.custom_data?.userId;
    if (!eventName || !userId) return null;

    if (eventName === "subscription_created") return { userId, status: "pro" };
    if (eventName === "subscription_updated") {
      const status = payload.data?.attributes?.status;
      return { userId, status: status === "active" || status === "on_trial" ? "pro" : "free" };
    }
    if (eventName === "subscription_cancelled" || eventName === "subscription_expired") return { userId, status: "free" };

    return null;
  }

  private isValidSignature(signature: string, rawBody: string) {
    const digest = createHmac("sha256", this.webhookSecret).update(rawBody).digest("hex");
    const signatureBuffer = Buffer.from(signature, "hex");
    const digestBuffer = Buffer.from(digest, "hex");
    return signatureBuffer.length === digestBuffer.length && timingSafeEqual(signatureBuffer, digestBuffer);
  }
}
