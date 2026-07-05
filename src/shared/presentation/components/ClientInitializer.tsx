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
    let reminderInterval: ReturnType<typeof setInterval> | undefined;

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

        // Set up recurring check for daily cooking time and weekly shopping day reminders
        const checkReminders = () => {
          if (localStorage.getItem("sera_notifications_enabled") !== "true") return;

          const now = new Date();
          const todayStr = now.toISOString().split("T")[0];

          // 1. Cooking Reminder
          const cookingTime = localStorage.getItem("sera_default_cooking_time") || "19:00";
          const [cookH, cookM] = cookingTime.split(":").map(Number);
          if (now.getHours() === cookH && now.getMinutes() === cookM) {
            const lastCookNotif = localStorage.getItem("sera_last_cooking_notif_date");
            if (lastCookNotif !== todayStr) {
              const worker = registration.active ?? navigator.serviceWorker.controller;
              worker?.postMessage({
                type: "SERA_NOTIFICATION",
                title: "Time to Cook! 🍳",
                body: "Ready for dinner? Open Sera to start preparing tonight's fresh meal.",
                url: "/dashboard",
              });
              localStorage.setItem("sera_last_cooking_notif_date", todayStr);
            }
          }

          // 2. Shopping Reminder
          const shoppingDay = Number(localStorage.getItem("sera_shopping_day") ?? "6"); // default Saturday
          const shoppingTime = localStorage.getItem("sera_shopping_time") || "10:00";
          const [shopH, shopM] = shoppingTime.split(":").map(Number);
          if (now.getDay() === shoppingDay && now.getHours() === shopH && now.getMinutes() === shopM) {
            const lastShopNotif = localStorage.getItem("sera_last_shopping_notif_date");
            if (lastShopNotif !== todayStr) {
              const worker = registration.active ?? navigator.serviceWorker.controller;
              worker?.postMessage({
                type: "SERA_NOTIFICATION",
                title: "Shopping Day! 🛒",
                body: "Time to head to the market. Check your shopping list inside the app.",
                url: "/shopping-list",
              });
              localStorage.setItem("sera_last_shopping_notif_date", todayStr);
            }
          }
        };

        checkReminders();
        reminderInterval = setInterval(checkReminders, 30000);

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
                url: "/dashboard",
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
      if (reminderInterval) clearInterval(reminderInterval);
    };
  }, []);

  return null;
}
