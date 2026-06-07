"use client";

import { useEffect, useState } from "react";
import { capturePostHog } from "@/shared/observability/posthogClient";

export function useFeatureFlag(flag: string, fallback = true) {
  const [enabled, setEnabled] = useState(fallback);

  useEffect(() => {
    const readFlag = () => {
      const value = window.posthog?.isFeatureEnabled(flag);
      setEnabled(typeof value === "boolean" ? value : fallback);
    };

    readFlag();
    window.posthog?.onFeatureFlags?.(readFlag);
    capturePostHog("feature_flag_checked", { flag, fallback });
  }, [fallback, flag]);

  return enabled;
}
