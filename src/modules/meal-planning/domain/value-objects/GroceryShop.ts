export type GroceryShop =
  | "Conad"
  | "Coop"
  | "Esselunga"
  | "Eurospin"
  | "Lidl"
  | "Carrefour"
  | "Aldi"
  | "MD"
  | "Other";

export const GROCERY_SHOPS: GroceryShop[] = [
  "Conad",
  "Coop",
  "Esselunga",
  "Eurospin",
  "Lidl",
  "Carrefour",
  "Aldi",
  "MD",
  "Other"
];

export const isValidGroceryShop = (value: string): value is GroceryShop => {
  return GROCERY_SHOPS.includes(value as GroceryShop);
};
