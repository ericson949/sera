export type DietaryNeed =
  | "None"
  | "Vegetarian"
  | "Vegan"
  | "Gluten-free"
  | "Lactose-free"
  | "Halal"
  | "Pescatarian"
  | "Low carb"
  | "High protein";

export const DIETARY_NEEDS: DietaryNeed[] = [
  "None",
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Lactose-free",
  "Halal",
  "Pescatarian",
  "Low carb",
  "High protein"
];

export const isValidDietaryNeed = (value: string): value is DietaryNeed => {
  return DIETARY_NEEDS.includes(value as DietaryNeed);
};
