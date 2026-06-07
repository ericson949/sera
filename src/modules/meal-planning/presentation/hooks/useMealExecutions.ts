"use client";

import { useEffect, useMemo, useState } from "react";
import { MealExecution, MealExecutionStatus } from "../../domain/entities/MealExecution";
import { Meal } from "../../domain/entities/Meal";

const STORAGE_KEY = "sera_meal_executions";

const readExecutions = (): MealExecution[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeExecutions = (executions: MealExecution[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(executions));
};

export function useMealExecutions(planId?: string, userId?: string) {
  const [executions, setExecutions] = useState<MealExecution[]>([]);

  useEffect(() => {
    setExecutions(readExecutions());
  }, []);

  const planExecutions = useMemo(() => executions.filter((execution) => execution.planId === planId), [executions, planId]);

  const setMealStatus = (meal: Meal, status: MealExecutionStatus) => {
    if (!planId || !userId) return;

    setExecutions((current) => {
      const withoutMeal = current.filter((execution) => !(execution.planId === planId && execution.mealId === meal.id));
      const next: MealExecution[] = [
        ...withoutMeal,
        {
          id: `${planId}_${meal.id}`,
          userId,
          planId,
          mealId: meal.id,
          day: meal.day,
          status,
          cookedAt: status === "cooked" ? new Date().toISOString() : undefined,
        },
      ];
      writeExecutions(next);
      return next;
    });
  };

  const getMealStatus = (mealId: string) => planExecutions.find((execution) => execution.mealId === mealId)?.status ?? "planned";
  const cookedCount = planExecutions.filter((execution) => execution.status === "cooked").length;

  return { executions: planExecutions, cookedCount, getMealStatus, setMealStatus };
}
