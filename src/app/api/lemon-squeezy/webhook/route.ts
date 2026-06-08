import { NextResponse } from "next/server";
import { HandleSubscriptionWebhookUseCase } from "@/modules/subscriptions/application/use-cases/HandleSubscriptionWebhookUseCase";
import { LemonSqueezySubscriptionService } from "@/modules/subscriptions/infrastructure/payments/LemonSqueezySubscriptionService";
import { createSupabaseUserRepository } from "@/modules/users/infrastructure/persistence/SupabaseUserRepository";
import { captureServerException } from "@/shared/observability/posthogServer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
  const variantId = process.env.LEMON_SQUEEZY_PRO_VARIANT_ID;
  const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

  if (!apiKey || !storeId || !variantId || !webhookSecret) {
    return NextResponse.json({ error: "Lemon Squeezy webhook is not configured" }, { status: 503 });
  }

  const userRepo = createSupabaseUserRepository();
  if (!userRepo) {
    return NextResponse.json({ error: "Supabase server persistence is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("x-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Lemon Squeezy signature" }, { status: 400 });
  }

  try {
    const rawBody = await request.text();
    const service = new LemonSqueezySubscriptionService(apiKey, storeId, variantId, webhookSecret);
    const useCase = new HandleSubscriptionWebhookUseCase(service, userRepo);
    const handled = await useCase.execute(signature, rawBody);

    return NextResponse.json({ received: true, handled });
  } catch (error) {
    await captureServerException(error, { route: "/api/lemon-squeezy/webhook" });
    const message = error instanceof Error ? error.message : "Invalid Lemon Squeezy webhook";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
