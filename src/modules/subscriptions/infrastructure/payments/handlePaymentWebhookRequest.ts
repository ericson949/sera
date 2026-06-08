import { NextResponse } from "next/server";
import { HandleSubscriptionWebhookUseCase } from "../../application/use-cases/HandleSubscriptionWebhookUseCase";
import { createSupabaseUserRepository } from "@/modules/users/infrastructure/persistence/SupabaseUserRepository";
import { captureServerException } from "@/shared/observability/posthogServer";
import { createConfiguredPaymentProvider, getPaymentProviderName } from "./paymentProviderFactory";

export async function handlePaymentWebhookRequest(request: Request) {
  const paymentProvider = createConfiguredPaymentProvider();
  if (!paymentProvider) {
    return NextResponse.json({ error: `${getPaymentProviderName()} webhook is not configured` }, { status: 503 });
  }

  const userRepo = createSupabaseUserRepository();
  if (!userRepo) {
    return NextResponse.json({ error: "Supabase server persistence is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("x-signature") || request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing payment webhook signature" }, { status: 400 });
  }

  try {
    const rawBody = await request.text();
    const useCase = new HandleSubscriptionWebhookUseCase(paymentProvider, userRepo);
    const handled = await useCase.execute(signature, rawBody);
    return NextResponse.json({ received: true, handled, provider: getPaymentProviderName() });
  } catch (error) {
    await captureServerException(error, { route: "/api/subscriptions/webhook", provider: getPaymentProviderName() });
    const message = error instanceof Error ? error.message : "Invalid payment webhook";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
