import { NextResponse } from "next/server";
import { z } from "zod";
import { createConfiguredPaymentProvider, getPaymentProviderName } from "@/modules/subscriptions/infrastructure/payments/paymentProviderFactory";
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

    const paymentProvider = createConfiguredPaymentProvider();

    if (!paymentProvider) {
      console.warn(`${getPaymentProviderName()} not configured - using mock checkout redirect`);
      return NextResponse.json({
        url: `${origin}/dashboard?checkout_mock_success=true&userId=${userId}`,
      });
    }

    const userRepo = createSupabaseUserRepository();
    if (!userRepo) {
      return NextResponse.json(
        { error: `Supabase server persistence is required for ${getPaymentProviderName()} production checkout` },
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

    return NextResponse.json(await paymentProvider.createCheckoutSession(userId, email, origin));
  } catch (error) {
    console.error("Payment checkout error:", error);
    await captureServerException(error, { route: "/api/checkout" });
    const message = error instanceof Error ? error.message : "Unable to create checkout session";
    const status = error instanceof z.ZodError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
