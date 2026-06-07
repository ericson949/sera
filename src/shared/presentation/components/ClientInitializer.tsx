"use client";

import { useEffect } from "react";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { getProductCopy } from "@/shared/seraProductCopy";
import { useDevtoolsPointerCaptureGuard } from "@/shared/presentation/hooks/useDevtoolsPointerCaptureGuard";

const NOTIFICATION_OPT_IN_KEY = "sera_notifications_enabled";

export default function ClientInitializer() {
  const initStore = useDinneroStore((state) => state.initStore);
  useDevtoolsPointerCaptureGuard();

  useEffect(() => {
    initStore();
  }, [initStore]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let unsubscribeStore: (() => void) | undefined;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((registration) => {
        const worker = registration.active ?? registration.waiting ?? registration.installing ?? navigator.serviceWorker.controller;
        worker?.postMessage({ type: "SERA_WARM_CACHE" });

        const publishOfflineState = () => {
          const plan = useDinneroStore.getState().activePlan;
          const worker = registration.active ?? navigator.serviceWorker.controller;

          if (!worker || !plan) {
            return;
          }

          worker.postMessage({
            type: "SERA_OFFLINE_STATE",
            activePlan: plan,
            shoppingItems: plan.shoppingList,
          });
        };

        publishOfflineState();
        unsubscribeStore = useDinneroStore.subscribe((state, previousState) => {
          if (state.activePlan !== previousState.activePlan) {
            publishOfflineState();

            if (
              state.activePlan &&
              localStorage.getItem(NOTIFICATION_OPT_IN_KEY) === "true" &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              const worker = registration.active ?? navigator.serviceWorker.controller;
              const copy = getProductCopy(state.appLanguage);
              worker?.postMessage({
                type: "SERA_NOTIFICATION",
                title: copy.shell.ready,
                body: copy.notifications.body,
                url: "/results",
              });
            }
          }
        });
      })
      .catch((error) => {
        console.warn("Sera service worker registration failed", error);
      });

    return () => {
      unsubscribeStore?.();
    };
  }, []);

  return null;
}
