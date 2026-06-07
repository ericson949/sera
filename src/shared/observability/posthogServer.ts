const POSTHOG_KEY = process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

export async function captureServerEvent(event: string, properties?: Record<string, unknown>, distinctId = "server") {
  if (!POSTHOG_KEY) return;

  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event,
        distinct_id: distinctId,
        properties: {
          app_env: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV,
          ...properties,
        },
      }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("PostHog server capture failed", error);
  }
}

export async function captureServerException(error: unknown, context: Record<string, unknown> = {}) {
  const err = error instanceof Error ? error : new Error(String(error));
  await captureServerEvent("$exception", {
    message: err.message,
    stack: err.stack,
    ...context,
  });
}

export async function withApiErrorCapture<T>(context: Record<string, unknown>, action: () => Promise<T>) {
  try {
    return await action();
  } catch (error) {
    await captureServerException(error, context);
    throw error;
  }
}
