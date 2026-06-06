export type MealGoal =
  | "Save money"
  | "Eat healthier"
  | "Lose weight"
  | "High protein"
  | "Family meals"
  | "Quick dinners"
  | "Reduce food waste";

export const MEAL_GOALS: MealGoal[] = [
  "Save money",
  "Eat healthier",
  "Lose weight",
  "High protein",
  "Family meals",
  "Quick dinners",
  "Reduce food waste"
];

export const isValidMealGoal = (value: string): value is MealGoal => {
  return MEAL_GOALS.includes(value as MealGoal);
};
