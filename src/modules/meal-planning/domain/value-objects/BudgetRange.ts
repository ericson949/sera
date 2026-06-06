export type BudgetRange = {
  min: number;
  max: number;
  currency: "EUR";
};

export const createBudgetRange = (min: number, max: number): BudgetRange => {
  if (min < 15) {
    throw new Error("Minimum weekly budget must be at least €15");
  }
  if (max > 150) {
    throw new Error("Maximum weekly budget must be at most €150");
  }
  if (min > max) {
    throw new Error("Minimum budget cannot be greater than maximum budget");
  }
  return { min, max, currency: "EUR" };
};

export const formatBudgetRange = (range: BudgetRange): string => {
  return `€${range.min}–€${range.max}`;
};
