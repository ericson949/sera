import { UserPreferencesRepository } from "../../domain/repositories/UserPreferencesRepository";
import { UserPreferences } from "../../domain/entities/UserPreferences";

export class SaveUserPreferencesUseCase {
  constructor(private userPrefsRepo: UserPreferencesRepository) {}

  async execute(preferences: UserPreferences): Promise<void> {
    if (preferences.numberOfPeople <= 0) {
      throw new Error("Number of people must be at least 1");
    }
    if (preferences.vibes.length > 3) {
      throw new Error("You can select up to 3 vibes");
    }
    await this.userPrefsRepo.save(preferences);
  }
}
