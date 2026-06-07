"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { capturePostHog, loadPostHog } from "@/shared/observability/posthogClient";

export default function PostHogProvider() {
  const pathname = usePathname();
  const userId = useDinneroStore((state) => state.userId);
  const user = useDinneroStore((state) => state.user);

  useEffect(() => {
    loadPostHog();
  }, []);

  useEffect(() => {
    if (userId && window.posthog) {
      window.posthog.identify(userId, { subscriptionStatus: user?.subscriptionStatus ?? "free" });
    }
  }, [user?.subscriptionStatus, userId]);

  useEffect(() => {
    const query = window.location.search.replace(/^\?/, "");
    capturePostHog("$pageview", { path: pathname, url: query ? `${pathname}?${query}` : pathname });
  }, [pathname]);

  return null;
}
