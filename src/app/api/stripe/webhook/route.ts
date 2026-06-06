import { NextResponse } from "next/server";
import Stripe from "stripe";
import { HandleStripeWebhookUseCase } from "@/modules/subscriptions/application/use-cases/HandleStripeWebhookUseCase";
import { StripeSubscriptionService } from "@/modules/subscriptions/infrastructure/payments/StripeSubscriptionService";
import { LocalUserRepository } from "@/modules/users/infrastructure/persistence/LocalUserRepository";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripePriceId = process.env.STRIPE_PRO_PRICE_ID;

  if (!stripeSecretKey || !webhookSecret || !stripePriceId) {
    return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  try {
    const rawBody = await request.text();
    const stripe = new Stripe(stripeSecretKey);
    const service = new StripeSubscriptionService(stripe, stripePriceId, webhookSecret);
    const useCase = new HandleStripeWebhookUseCase(service, new LocalUserRepository());
    const handled = await useCase.execute(signature, rawBody);

    return NextResponse.json({ received: true, handled });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
