import { NextResponse } from "next/server";
import { captureServerEvent, captureServerException } from "@/shared/observability/posthogServer";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    await captureServerEvent("beta_test_account_reset", {
      userId: body.userId ?? "unknown",
    }, body.userId ?? "unknown");

    return NextResponse.json({ ok: true });
  } catch (error) {
    await captureServerException(error, { route: "/api/beta/reset" });
    return NextResponse.json({ error: "Unable to reset beta account" }, { status: 500 });
  }
}
