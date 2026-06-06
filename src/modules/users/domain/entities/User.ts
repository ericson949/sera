export type SubscriptionStatus = "free" | "pro";

export type User = {
  id: string;
  email: string;
  subscriptionStatus: SubscriptionStatus;
  createdAt: Date;
};
