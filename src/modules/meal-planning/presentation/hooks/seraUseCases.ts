import { LocalUserRepository } from "@/modules/users/infrastructure/persistence/LocalUserRepository";
import { LocalUserPreferencesRepository } from "@/modules/users/infrastructure/persistence/LocalUserPreferencesRepository";
import { LocalMealPlanRepository } from "@/modules/meal-planning/infrastructure/persistence/LocalMealPlanRepository";
import { OpenAIMealPlanAIService } from "@/modules/meal-planning/infrastructure/ai/OpenAIMealPlanAIService";
import { MockSubscriptionService } from "@/modules/subscriptions/infrastructure/payments/MockSubscriptionService";
import { StartOnboardingUseCase } from "@/modules/users/application/use-cases/StartOnboardingUseCase";
import { SaveUserPreferencesUseCase } from "@/modules/users/application/use-cases/SaveUserPreferencesUseCase";
import { GenerateMealPlanUseCase } from "../../application/use-cases/GenerateMealPlanUseCase";
import { RegenerateMealPlanUseCase } from "../../application/use-cases/RegenerateMealPlanUseCase";
import { SwapMealUseCase } from "../../application/use-cases/SwapMealUseCase";
import { GetCurrentMealPlanUseCase } from "../../application/use-cases/GetCurrentMealPlanUseCase";
import { ToggleShoppingItemUseCase } from "../../application/use-cases/ToggleShoppingItemUseCase";
import { SaveMealPlanUseCase } from "../../application/use-cases/SaveMealPlanUseCase";
import { GetDashboardUseCase } from "../../application/use-cases/GetDashboardUseCase";
import { CreateCheckoutSessionUseCase } from "@/modules/subscriptions/application/use-cases/CreateCheckoutSessionUseCase";

const userRepo = new LocalUserRepository();
const prefsRepo = new LocalUserPreferencesRepository();
const mealPlanRepo = new LocalMealPlanRepository();
const aiService = new OpenAIMealPlanAIService();
const subService = new MockSubscriptionService(userRepo);

export const seraUseCases = {
  userRepo,
  startOnboardingUseCase: new StartOnboardingUseCase(prefsRepo),
  savePrefsUseCase: new SaveUserPreferencesUseCase(prefsRepo),
  generatePlanUseCase: new GenerateMealPlanUseCase(mealPlanRepo, prefsRepo, aiService, subService),
  regeneratePlanUseCase: new RegenerateMealPlanUseCase(mealPlanRepo, prefsRepo, aiService, subService),
  swapMealUseCase: new SwapMealUseCase(mealPlanRepo, prefsRepo, aiService, subService),
  getCurrentPlanUseCase: new GetCurrentMealPlanUseCase(mealPlanRepo),
  toggleShoppingItemUseCase: new ToggleShoppingItemUseCase(mealPlanRepo),
  saveMealPlanUseCase: new SaveMealPlanUseCase(mealPlanRepo, subService),
  getDashboardUseCase: new GetDashboardUseCase(mealPlanRepo, prefsRepo),
  createCheckoutUseCase: new CreateCheckoutSessionUseCase(subService),
};
