import { Money } from "../value-objects/Money";
import { ShoppingCategory } from "../value-objects/ShoppingCategory";

export type ShoppingItem = {
  id: string;
  name: string;
  category: ShoppingCategory;
  quantity: string;
  estimatedPrice: Money;
  usedInMeals: string[];
  checked: boolean;
};
