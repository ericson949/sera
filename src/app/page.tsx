"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDinneroStore } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const activePlan = useDinneroStore((state) => state.activePlan);
  const user = useDinneroStore((state) => state.user);

  useEffect(() => {
    // Wait until store has loaded user from local preferences
    if (user) {
      if (activePlan) {
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [user, activePlan, router]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
          <span className="text-3xl font-extrabold text-primary">D</span>
        </div>
        <div className="flex items-center gap-2 text-muted">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <p className="text-sm font-medium">Caricamento in corso...</p>
        </div>
      </div>
    </div>
  );
}
