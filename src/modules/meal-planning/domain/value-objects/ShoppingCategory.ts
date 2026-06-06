export type ShoppingCategory =
  | "Vegetables"
  | "Meat & Fish"
  | "Dairy"
  | "Pantry"
  | "Frozen"
  | "Spices"
  | "Other";

export const SHOPPING_CATEGORIES: ShoppingCategory[] = [
  "Vegetables",
  "Meat & Fish",
  "Dairy",
  "Pantry",
  "Frozen",
  "Spices",
  "Other"
];

export const isValidShoppingCategory = (value: string): value is ShoppingCategory => {
  return SHOPPING_CATEGORIES.includes(value as ShoppingCategory);
};
