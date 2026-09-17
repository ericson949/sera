import { Money } from "../value-objects/Money";
import { ShoppingCategory } from "../value-objects/ShoppingCategory";
import { PantryTier } from "../value-objects/PantryTier";

export type ShoppingItem = {
  id: string;
  name: string;
  category: ShoppingCategory;
  quantity: string;
  estimatedPrice: Money;
  usedInMeals: string[];
  checked: boolean;
  pantryTier?: PantryTier;
};
