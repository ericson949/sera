"use client";

import { useEffect } from "react";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";

export default function ClientInitializer() {
  const initStore = useDinneroStore((state) => state.initStore);

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
        const publishOfflineState = () => {
          const plan = useDinneroStore.getState().activePlan;
          const worker = registration.active ?? navigator.serviceWorker.controller;

          if (!worker || !plan) {
            return;
          }

          worker.postMessage({
            type: "DINNERO_OFFLINE_STATE",
            activePlan: plan,
            shoppingItems: plan.shoppingList,
          });
        };

        publishOfflineState();
        unsubscribeStore = useDinneroStore.subscribe((state, previousState) => {
          if (state.activePlan !== previousState.activePlan) {
            publishOfflineState();
          }
        });
      })
      .catch((error) => {
        console.warn("Dinnero service worker registration failed", error);
      });

    return () => {
      unsubscribeStore?.();
    };
  }, []);

  return null;
}
