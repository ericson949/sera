import { UserPreferences } from "../entities/UserPreferences";

export interface UserPreferencesRepository {
  save(preferences: UserPreferences): Promise<void>;
  findByUserId(userId: string): Promise<UserPreferences | null>;
}
