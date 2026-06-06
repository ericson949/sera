import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { StripeSubscriptionService } from "@/modules/subscriptions/infrastructure/payments/StripeSubscriptionService";
import { createSupabaseUserRepository } from "@/modules/users/infrastructure/persistence/SupabaseUserRepository";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  origin: z.string().url(),
});

export async function POST(request: Request) {
  try {
    const { userId, email, origin } = checkoutSchema.parse(await request.json());

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePriceId = process.env.STRIPE_PRO_PRICE_ID;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "not-used-for-checkout";

    if (!stripeSecretKey || !stripePriceId) {
      console.warn("Stripe not configured - using mock checkout redirect");
      return NextResponse.json({
        url: `${origin}/dashboard?checkout_mock_success=true&userId=${userId}`,
      });
    }

    const userRepo = createSupabaseUserRepository();
    if (!userRepo) {
      return NextResponse.json(
        { error: "Supabase server persistence is required for Stripe production checkout" },
        { status: 503 }
      );
    }

    const existingUser = await userRepo.findById(userId);
    await userRepo.save({
      id: userId,
      email,
      subscriptionStatus: existingUser?.subscriptionStatus ?? "free",
      createdAt: existingUser?.createdAt ?? new Date(),
    });

    const stripe = new Stripe(stripeSecretKey);
    const service = new StripeSubscriptionService(stripe, stripePriceId, webhookSecret);

    return NextResponse.json(await service.createCheckoutSession(userId, email, origin));
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Unable to create checkout session";
    const status = error instanceof z.ZodError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
