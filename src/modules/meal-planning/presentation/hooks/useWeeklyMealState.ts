"use client";

import { useMemo } from "react";
import { MealPlan } from "../../domain/entities/MealPlan";
import { Meal } from "../../domain/entities/Meal";
import { useMealExecutions } from "./useMealExecutions";

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
};

const formatScheduleDate = (date: Date) =>
  new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" }).format(date);

export function useWeeklyMealState(plan: MealPlan | null, userId: string) {
  const executions = useMealExecutions(plan?.id, userId);

  const scheduledMeals = useMemo(() => {
    if (!plan) return [];

    const start = startOfDay(new Date(plan.createdAt));
    const today = startOfDay(new Date());

    return plan.days.map((meal, index) => {
      const scheduledDate = addDays(start, index);
      const status = executions.getMealStatus(meal.id);
      const isToday = scheduledDate.getTime() === today.getTime();
      const isPast = scheduledDate.getTime() < today.getTime();
      const isCooked = status === "cooked";

      return {
        meal,
        status,
        scheduledDate,
        dateLabel: formatScheduleDate(scheduledDate),
        isToday,
        isPast,
        canCook: isToday && !isCooked,
        canSkip: isToday && !isCooked,
        canSwap: !isCooked,
        canDrag: !isCooked,
      };
    });
  }, [executions, plan]);

  const todayMeal = scheduledMeals.find((item) => item.isToday)?.meal ?? scheduledMeals[0]?.meal ?? null;
  const getState = (meal: Meal) => scheduledMeals.find((item) => item.meal.id === meal.id);

  return {
    ...executions,
    scheduledMeals,
    todayMeal,
    getState,
    canSwapMeal: (meal: Meal) => getState(meal)?.canSwap ?? true,
    canSwapPair: (sourceMealId: string, targetMealId: string) => {
      const source = scheduledMeals.find((item) => item.meal.id === sourceMealId);
      const target = scheduledMeals.find((item) => item.meal.id === targetMealId);
      return Boolean(source?.canDrag && target?.canDrag);
    },
  };
}
