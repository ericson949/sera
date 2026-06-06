export type Money = {
  amount: number;
  currency: "EUR";
};

export const createMoney = (amount: number): Money => {
  if (amount < 0) {
    throw new Error("Money amount cannot be negative");
  }
  return { amount, currency: "EUR" };
};

export const formatMoney = (money: Money): string => {
  // Format as €XX.XX, omit decimal if zero
  const formatted = money.amount.toFixed(2);
  if (formatted.endsWith(".00")) {
    return `€${money.amount.toFixed(0)}`;
  }
  return `€${formatted}`;
};
