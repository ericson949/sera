"use client";

import { useEffect, useState } from "react";

const NOTIFICATION_OPT_IN_KEY = "sera_notifications_enabled";

type NotificationStatus = "unsupported" | "default" | "granted" | "denied";

const getNotificationStatus = (): NotificationStatus => {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as NotificationStatus;
};

const sendWorkerNotification = (title: string, body: string, url = "/dashboard") => {
  if (!("serviceWorker" in navigator)) return false;

  const worker = navigator.serviceWorker.controller;
  if (!worker) return false;

  worker.postMessage({
    type: "SERA_NOTIFICATION",
    title,
    body,
    url,
  });
  return true;
};

export function useSeraNotifications() {
  const [status, setStatus] = useState<NotificationStatus>("default");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setStatus(getNotificationStatus());
    setEnabled(localStorage.getItem(NOTIFICATION_OPT_IN_KEY) === "true");
  }, []);

  const notify = (title: string, body: string, url?: string) => {
    if (getNotificationStatus() !== "granted") return false;

    const sentByWorker = sendWorkerNotification(title, body, url);
    if (!sentByWorker) {
      new Notification(title, {
        body,
        icon: "/pwa-192.png",
        badge: "/pwa-192.png",
      });
    }
    return true;
  };

  const enableNotifications = async () => {
    if (getNotificationStatus() === "unsupported") {
      setStatus("unsupported");
      return false;
    }

    const permission = await Notification.requestPermission();
    setStatus(permission as NotificationStatus);

    const granted = permission === "granted";
    setEnabled(granted);
    localStorage.setItem(NOTIFICATION_OPT_IN_KEY, granted ? "true" : "false");

    if (granted) {
      notify("Sera is ready", "Your dinner reminders are now switched on.");
    }

    return granted;
  };

  const disableNotifications = () => {
    setEnabled(false);
    localStorage.setItem(NOTIFICATION_OPT_IN_KEY, "false");
  };

  return {
    enabled,
    status,
    enableNotifications,
    disableNotifications,
    notify,
  };
}
