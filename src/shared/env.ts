export type AppEnv = "development" | "staging" | "beta" | "production";

export const getAppEnv = (): AppEnv => {
  const value = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development";
  if (value === "production" || value === "staging" || value === "beta") return value;
  return "development";
};

export const isBetaLikeEnv = () => {
  const env = getAppEnv();
  return env === "staging" || env === "beta" || env === "development";
};

export const isStagingEnv = () => {
  const env = getAppEnv();
  return env === "staging" || env === "beta";
};
