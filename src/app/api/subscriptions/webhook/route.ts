import { handlePaymentWebhookRequest } from "@/modules/subscriptions/infrastructure/payments/handlePaymentWebhookRequest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handlePaymentWebhookRequest(request);
}
