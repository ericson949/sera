"use client";

import type { PointerEvent } from "react";
import { useEffect, useState } from "react";

type UseMealPlanDragSwapInput = {
  enabled: boolean;
  canSwapPair: (sourceMealId: string, targetMealId: string) => boolean;
  swapMeals: (sourceMealId: string, targetMealId: string) => Promise<void>;
};

export function useMealPlanDragSwap({ enabled, canSwapPair, swapMeals }: UseMealPlanDragSwapInput) {
  const [draggedMealId, setDraggedMealId] = useState<string | null>(null);

  const startDrag = (event: PointerEvent, mealId: string, canDrag: boolean) => {
    if (!enabled || !canDrag) return;
    event.preventDefault();
    event.stopPropagation();
    setDraggedMealId(mealId);
  };

  useEffect(() => {
    if (!draggedMealId) return;

    const finishDrag = (event: globalThis.PointerEvent) => {
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-meal-id]");
      const targetMealId = target?.dataset.mealId;

      if (enabled && targetMealId && canSwapPair(draggedMealId, targetMealId)) {
        void swapMeals(draggedMealId, targetMealId);
      }

      setDraggedMealId(null);
    };

    const cancelDrag = () => setDraggedMealId(null);

    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", cancelDrag);

    return () => {
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", cancelDrag);
    };
  }, [canSwapPair, draggedMealId, enabled, swapMeals]);

  return { draggedMealId, startDrag };
}
