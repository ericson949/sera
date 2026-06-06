export type FoodVibe =
  | "Quick"
  | "Healthy"
  | "Italian comfort"
  | "High protein"
  | "Cheap eats"
  | "Family friendly"
  | "Vegetarian"
  | "Mediterranean"
  | "Low effort"
  | "Cozy";

export const FOOD_VIBES: FoodVibe[] = [
  "Quick",
  "Healthy",
  "Italian comfort",
  "High protein",
  "Cheap eats",
  "Family friendly",
  "Vegetarian",
  "Mediterranean",
  "Low effort",
  "Cozy"
];

export const isValidFoodVibe = (value: string): value is FoodVibe => {
  return FOOD_VIBES.includes(value as FoodVibe);
};
