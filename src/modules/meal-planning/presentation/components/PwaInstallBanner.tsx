"use client";

import { useEffect, useState } from "react";
import { ArrowDownToLine, Plus, Share, X } from "lucide-react";
import { usePwaInstallPrompt } from "@/shared/presentation/hooks/usePwaInstallPrompt";

export default function PwaInstallBanner() {
  const { isInstalled, canPromptInstall, promptInstall } = usePwaInstallPrompt();
  const [shouldShow, setShouldShow] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDismissed = localStorage.getItem("sera_pwa_banner_dismissed") === "true";
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIos(ios);

    // Show if not installed, not dismissed, and either can prompt or is iOS
    if (!isInstalled && !isDismissed && (canPromptInstall || ios)) {
      setShouldShow(true);
    } else {
      setShouldShow(false);
    }
  }, [isInstalled, canPromptInstall]);

  const handleDismiss = () => {
    localStorage.setItem("sera_pwa_banner_dismissed", "true");
    setShouldShow(false);
  };

  const handleInstall = async () => {
    if (canPromptInstall) {
      await promptInstall();
    }
  };

  if (!shouldShow) return null;

  return (
    <div className="mx-5 mt-4 rounded-[1.6rem] border border-primary/30 bg-primary/5 p-4 shadow-sm relative">
      <button 
        onClick={handleDismiss}
        className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-low text-muted"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {isIos ? (
        <div className="flex items-start gap-3.5 pr-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Share className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Add Sera to your Home Screen</p>
            <p className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-muted leading-relaxed">
              <span>Tap the Share icon</span>
              <Share className="inline h-3.5 w-3.5 text-primary" />
              <span>then scroll down and select "Add to Home Screen"</span>
              <Plus className="inline h-3.5 w-3.5 text-primary" />
              <span>to launch Sera as a fast full-screen app.</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 pr-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ArrowDownToLine className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Install Sera App</p>
              <p className="mt-0.5 text-xs text-muted">Get fast offline access and push notifications.</p>
            </div>
          </div>
          <button 
            onClick={handleInstall}
            className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary/95"
          >
            Install
          </button>
        </div>
      )}
    </div>
  );
}
