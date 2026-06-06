import { UserPreferencesRepository } from "../../domain/repositories/UserPreferencesRepository";
import { UserPreferences } from "../../domain/entities/UserPreferences";

export class LocalUserPreferencesRepository implements UserPreferencesRepository {
  private memoryStore = new Map<string, UserPreferences>();
  private STORAGE_KEY = "dinnero_user_preferences";

  private getStore(): Record<string, UserPreferences> {
    if (typeof window === "undefined") {
      const store: Record<string, UserPreferences> = {};
      this.memoryStore.forEach((v, k) => {
        store[k] = v;
      });
      return store;
    }
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  private saveStore(store: Record<string, UserPreferences>) {
    if (typeof window === "undefined") {
      Object.entries(store).forEach(([k, v]) => {
        this.memoryStore.set(k, v);
      });
      return;
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(store));
  }

  async save(preferences: UserPreferences): Promise<void> {
    const store = this.getStore();
    store[preferences.userId] = preferences;
    this.saveStore(store);
  }

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    const store = this.getStore();
    return store[userId] || null;
  }
}
