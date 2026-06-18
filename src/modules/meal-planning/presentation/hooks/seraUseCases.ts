import { LocalUserRepository } from "@/modules/users/infrastructure/persistence/LocalUserRepository";
import { LocalUserPreferencesRepository } from "@/modules/users/infrastructure/persistence/LocalUserPreferencesRepository";
import { LocalMealPlanRepository } from "@/modules/meal-planning/infrastructure/persistence/LocalMealPlanRepository";
import { OpenRouterMealPlanAIService } from "@/modules/meal-planning/infrastructure/ai/OpenRouterMealPlanAIService";
import { ClientSubscriptionService } from "@/modules/subscriptions/infrastructure/payments/ClientSubscriptionService";
import { HttpPaymentProvider } from "@/modules/subscriptions/infrastructure/payments/HttpPaymentProvider";
import { StartOnboardingUseCase } from "@/modules/users/application/use-cases/StartOnboardingUseCase";
import { SaveUserPreferencesUseCase } from "@/modules/users/application/use-cases/SaveUserPreferencesUseCase";
import { GenerateMealPlanUseCase } from "../../application/use-cases/GenerateMealPlanUseCase";
import { RegenerateMealPlanUseCase } from "../../application/use-cases/RegenerateMealPlanUseCase";
import { SwapMealUseCase } from "../../application/use-cases/SwapMealUseCase";
import { GetCurrentMealPlanUseCase } from "../../application/use-cases/GetCurrentMealPlanUseCase";
import { ToggleShoppingItemUseCase } from "../../application/use-cases/ToggleShoppingItemUseCase";
import { SaveMealPlanUseCase } from "../../application/use-cases/SaveMealPlanUseCase";
import { GetDashboardUseCase } from "../../application/use-cases/GetDashboardUseCase";
import { SwapPlannedMealsUseCase } from "../../application/use-cases/SwapPlannedMealsUseCase";
import { CreateCheckoutSessionUseCase } from "@/modules/subscriptions/application/use-cases/CreateCheckoutSessionUseCase";
import { EnrichMealPlanUseCase } from "../../application/use-cases/EnrichMealPlanUseCase";
import { jobQueue } from "@/shared/jobs/JobQueue";

const userRepo = new LocalUserRepository();
const prefsRepo = new LocalUserPreferencesRepository();
const mealPlanRepo = new LocalMealPlanRepository();
const aiService = new OpenRouterMealPlanAIService();
const subService = new ClientSubscriptionService(userRepo);
const paymentProvider = new HttpPaymentProvider();

export const seraUseCases = {
  userRepo,
  startOnboardingUseCase: new StartOnboardingUseCase(prefsRepo),
  savePrefsUseCase: new SaveUserPreferencesUseCase(prefsRepo),
  generatePlanUseCase: new GenerateMealPlanUseCase(mealPlanRepo, prefsRepo, aiService, subService),
  enrichMealPlanUseCase: new EnrichMealPlanUseCase(mealPlanRepo, aiService, jobQueue),
  regeneratePlanUseCase: new RegenerateMealPlanUseCase(mealPlanRepo, prefsRepo, aiService, subService),
  swapMealUseCase: new SwapMealUseCase(mealPlanRepo, prefsRepo, aiService, subService),
  getCurrentPlanUseCase: new GetCurrentMealPlanUseCase(mealPlanRepo),
  toggleShoppingItemUseCase: new ToggleShoppingItemUseCase(mealPlanRepo),
  saveMealPlanUseCase: new SaveMealPlanUseCase(mealPlanRepo, subService),
  getDashboardUseCase: new GetDashboardUseCase(mealPlanRepo, prefsRepo),
  swapPlannedMealsUseCase: new SwapPlannedMealsUseCase(mealPlanRepo),
  createCheckoutUseCase: new CreateCheckoutSessionUseCase(paymentProvider),
};
