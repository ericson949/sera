"use client";

import { useEffect } from "react";

function isNextDevtoolsPointerCaptureError(error: unknown) {
  if (!(error instanceof DOMException) && !(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const stack = "stack" in error && typeof error.stack === "string" ? error.stack.toLowerCase() : "";

  return message.includes("object can not be found") && stack.includes("releasepointercapture") && stack.includes("next-devtools");
}

export function useDevtoolsPointerCaptureGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const handleError = (event: ErrorEvent) => {
      if (!isNextDevtoolsPointerCaptureError(event.error)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (!isNextDevtoolsPointerCaptureError(event.reason)) return;
      event.preventDefault();
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);
}
