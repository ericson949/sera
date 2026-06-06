"use client";

import { useEffect, useState } from "react";

const IOS_INSTALL_DISMISSED_KEY = "sera_ios_install_dismissed";

const isIosDevice = () => {
  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();
  const touchMac = platform.includes("mac") && navigator.maxTouchPoints > 1;

  return /iphone|ipad|ipod/.test(userAgent) || touchMac;
};

const isStandalone = () => {
  const standaloneNavigator = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || Boolean(standaloneNavigator.standalone);
};

export function useIosInstallBanner() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(IOS_INSTALL_DISMISSED_KEY) === "true";
    setShouldShow(isIosDevice() && !isStandalone() && !dismissed);
  }, []);

  const dismiss = () => {
    localStorage.setItem(IOS_INSTALL_DISMISSED_KEY, "true");
    setShouldShow(false);
  };

  return { shouldShow, dismiss };
}
