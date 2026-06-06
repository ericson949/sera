import { UserPreferencesRepository } from "../../domain/repositories/UserPreferencesRepository";
import { UserPreferences } from "../../domain/entities/UserPreferences";

export class StartOnboardingUseCase {
  constructor(private userPrefsRepo: UserPreferencesRepository) {}

  async execute(userId: string): Promise<UserPreferences> {
    const existing = await this.userPrefsRepo.findByUserId(userId);
    if (existing) {
      return existing;
    }
    const defaultPrefs: UserPreferences = {
      userId,
      shop: "Lidl",
      weeklyBudget: { min: 35, max: 50, currency: "EUR" },
      numberOfPeople: 2,
      goal: "Save money",
      vibes: [],
      dietaryNeeds: ["None"],
      maxCookingTime: "30 min",
      kitchenItems: [],
    };
    await this.userPrefsRepo.save(defaultPrefs);
    return defaultPrefs;
  }
}
