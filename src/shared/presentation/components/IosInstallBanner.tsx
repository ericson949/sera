"use client";

import { Plus, Share, X } from "lucide-react";
import { Dictionary } from "@/shared/i18n";
import { useIosInstallBanner } from "../hooks/useIosInstallBanner";

type Props = {
  copy: Dictionary;
};

export default function IosInstallBanner({ copy }: Props) {
  const { shouldShow, dismiss } = useIosInstallBanner();

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="rounded-[1.25rem] border border-warm-stone/70 bg-card p-3 text-left shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <Share className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-foreground">{copy.pwaInstall.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-semibold leading-5 text-muted">
            <span>{copy.pwaInstall.stepShare}</span>
            <Share className="h-3.5 w-3.5 text-primary" />
            <span>{copy.pwaInstall.stepThen}</span>
            <Plus className="h-3.5 w-3.5 text-primary" />
            <span>{copy.pwaInstall.stepHome}</span>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-muted"
          aria-label={copy.pwaInstall.dismiss}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
