import { WeekDay } from "../value-objects/WeekDay";

export type MealExecutionStatus = "planned" | "cooked" | "skipped";
export type MealFeedbackRating = "liked" | "neutral" | "disliked";

export type MealExecution = {
  id: string;
  userId: string;
  planId: string;
  mealId: string;
  day: WeekDay;
  status: MealExecutionStatus;
  cookedAt?: string;
  feedback?: {
    rating?: MealFeedbackRating;
    note?: string;
  };
};
