"use client";

import { Bell, BellOff } from "lucide-react";
import { useSeraNotifications } from "../hooks/useSeraNotifications";
import { getProductCopy } from "@/shared/seraProductCopy";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";

export default function SeraNotificationCard() {
  const { enabled, status, enableNotifications, disableNotifications } = useSeraNotifications();
  const copy = getProductCopy(useDinneroStore((state) => state.appLanguage)).notifications;

  if (status === "unsupported") {
    return null;
  }

  return (
    <div className="mt-4 rounded-[1.8rem] bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="editorial-kicker">{copy.kicker}</p>
          <h2 className="mt-1 font-serif text-[28px] leading-[30px] text-foreground">
            {enabled ? copy.on : copy.off}
          </h2>
          <p className="mt-2 text-sm leading-5 text-muted">
            {status === "denied" ? copy.blocked : copy.body}
          </p>
        </div>
        <button
          disabled={status === "denied"}
          onClick={enabled ? disableNotifications : enableNotifications}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
          aria-label={enabled ? copy.disable : copy.enable}
        >
          {enabled ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
