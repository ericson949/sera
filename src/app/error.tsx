"use client";

import { useEffect } from "react";
import { capturePostHog } from "@/shared/observability/posthogClient";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    capturePostHog("$exception", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      surface: "global_error_boundary",
    });
  }, [error]);

  return (
    <div className="flex h-svh flex-col items-center justify-center bg-background px-6 text-center">
      <p className="editorial-kicker">Sera</p>
      <h1 className="mt-3 font-serif text-[42px] leading-[44px] text-foreground">Something slipped.</h1>
      <p className="mt-4 max-w-[300px] text-sm leading-6 text-muted">The error has been sent to the beta team.</p>
      <button onClick={reset} className="mt-8 h-14 rounded-full bg-primary px-8 text-sm font-semibold text-white shadow-md">
        Try again
      </button>
    </div>
  );
}
