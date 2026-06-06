export type CookingTime =
  | "15 min"
  | "30 min"
  | "45 min"
  | "60 min"
  | "No limit";

export const COOKING_TIMES: CookingTime[] = [
  "15 min",
  "30 min",
  "45 min",
  "60 min",
  "No limit"
];

export const isValidCookingTime = (value: string): value is CookingTime => {
  return COOKING_TIMES.includes(value as CookingTime);
};
