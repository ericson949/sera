"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { getProductCopy } from "@/shared/seraProductCopy";

export default function Home() {
  const router = useRouter();
  const activePlan = useDinneroStore((state) => state.activePlan);
  const user = useDinneroStore((state) => state.user);
  const appLanguage = useDinneroStore((state) => state.appLanguage);
  const copy = getProductCopy(appLanguage).shell;

  useEffect(() => {
    if (!user) return;
    router.replace(activePlan ? "/dashboard" : "/onboarding");
  }, [user, activePlan, router]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-primary text-3xl font-semibold text-white shadow-md">
        S
      </div>
      <h1 className="mt-5 font-serif text-[42px] leading-[44px] text-foreground">Sera</h1>
      <p className="mt-2 text-sm leading-6 text-muted">{copy.loading}</p>
    </div>
  );
}
