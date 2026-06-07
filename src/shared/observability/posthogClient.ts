"use client";

declare global {
  interface Window {
    posthog?: {
      init: (key: string, options: Record<string, unknown>) => void;
      capture: (event: string, properties?: Record<string, unknown>) => void;
      identify: (id: string, properties?: Record<string, unknown>) => void;
      isFeatureEnabled: (flag: string) => boolean | undefined;
      onFeatureFlags?: (callback: () => void) => void;
    };
  }
}

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

let scriptLoading = false;

export function loadPostHog() {
  if (!POSTHOG_KEY || typeof window === "undefined" || window.posthog || scriptLoading) return;

  scriptLoading = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = `${POSTHOG_HOST}/static/array.js`;
  script.onload = () => {
    window.posthog?.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        maskAllInputs: true,
        maskInputOptions: { password: true, email: true },
      },
      loaded: (posthog: Window["posthog"]) => {
        posthog?.capture("sera_posthog_loaded");
      },
    });
  };
  document.head.appendChild(script);
}

export function capturePostHog(event: string, properties?: Record<string, unknown>) {
  window.posthog?.capture(event, properties);
}
