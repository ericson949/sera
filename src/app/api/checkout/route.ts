import { NextResponse } from "next/server";
import { z } from "zod";
import { LemonSqueezySubscriptionService } from "@/modules/subscriptions/infrastructure/payments/LemonSqueezySubscriptionService";
import { createSupabaseUserRepository } from "@/modules/users/infrastructure/persistence/SupabaseUserRepository";
import { captureServerException } from "@/shared/observability/posthogServer";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  origin: z.string().url(),
});

export async function POST(request: Request) {
  try {
    const { userId, email, origin } = checkoutSchema.parse(await request.json());

    const lemonApiKey = process.env.LEMON_SQUEEZY_API_KEY;
    const lemonStoreId = process.env.LEMON_SQUEEZY_STORE_ID;
    const lemonVariantId = process.env.LEMON_SQUEEZY_PRO_VARIANT_ID;
    const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "not-used-for-checkout";

    if (!lemonApiKey || !lemonStoreId || !lemonVariantId) {
      console.warn("Lemon Squeezy not configured - using mock checkout redirect");
      return NextResponse.json({
        url: `${origin}/dashboard?checkout_mock_success=true&userId=${userId}`,
      });
    }

    const userRepo = createSupabaseUserRepository();
    if (!userRepo) {
      return NextResponse.json(
        { error: "Supabase server persistence is required for Lemon Squeezy production checkout" },
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

    const service = new LemonSqueezySubscriptionService(lemonApiKey, lemonStoreId, lemonVariantId, webhookSecret);

    return NextResponse.json(await service.createCheckoutSession(userId, email, origin));
  } catch (error) {
    console.error("Lemon Squeezy checkout error:", error);
    await captureServerException(error, { route: "/api/checkout" });
    const message = error instanceof Error ? error.message : "Unable to create checkout session";
    const status = error instanceof z.ZodError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
