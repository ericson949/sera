"use client";

import type { PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

type UseMealPlanDragSwapInput = {
  enabled: boolean;
  canSwapPair: (sourceMealId: string, targetMealId: string) => boolean;
  swapMeals: (sourceMealId: string, targetMealId: string) => Promise<void>;
};

export function useMealPlanDragSwap({ enabled, canSwapPair, swapMeals }: UseMealPlanDragSwapInput) {
  const [draggedMealId, setDraggedMealId] = useState<string | null>(null);
  const [hoverMealId, setHoverMealId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const lastSwapTargetRef = useRef<string | null>(null);

  const startDrag = (event: PointerEvent, mealId: string, canDrag: boolean) => {
    if (!enabled || !canDrag) return;
    event.preventDefault();
    event.stopPropagation();
    setDraggedMealId(mealId);
    setDragPosition({ x: event.clientX, y: event.clientY });
    lastSwapTargetRef.current = null;
  };

  useEffect(() => {
    if (!draggedMealId) return;

    const scrollWhileDragging = (clientY: number) => {
      const scrollParent = document.elementFromPoint(window.innerWidth / 2, clientY)?.closest<HTMLElement>("[data-drag-scroll]");
      if (!scrollParent) return;

      const rect = scrollParent.getBoundingClientRect();
      const edgeSize = 96;
      const topDistance = clientY - rect.top;
      const bottomDistance = rect.bottom - clientY;

      if (topDistance < edgeSize) {
        scrollParent.scrollBy({ top: -Math.max(6, edgeSize - topDistance) / 2, behavior: "auto" });
      } else if (bottomDistance < edgeSize) {
        scrollParent.scrollBy({ top: Math.max(6, edgeSize - bottomDistance) / 2, behavior: "auto" });
      }
    };

    const moveDrag = (event: globalThis.PointerEvent) => {
      setDragPosition({ x: event.clientX, y: event.clientY });
      scrollWhileDragging(event.clientY);

      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-meal-id]");
      const targetMealId = target?.dataset.mealId;

      if (!targetMealId || targetMealId === draggedMealId) {
        setHoverMealId(null);
        return;
      }

      setHoverMealId(targetMealId);

      if (enabled && targetMealId !== lastSwapTargetRef.current && canSwapPair(draggedMealId, targetMealId)) {
        lastSwapTargetRef.current = targetMealId;
        void swapMeals(draggedMealId, targetMealId);
      }
    };

    const finishDrag = () => {
      setDraggedMealId(null);
      setHoverMealId(null);
      setDragPosition(null);
      lastSwapTargetRef.current = null;
    };

    window.addEventListener("pointermove", moveDrag);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointermove", moveDrag);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, [canSwapPair, draggedMealId, enabled, swapMeals]);

  return { draggedMealId, dragPosition, hoverMealId, startDrag };
}
