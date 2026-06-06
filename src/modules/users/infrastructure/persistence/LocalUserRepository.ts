import { UserRepository } from "../../domain/repositories/UserRepository";
import { User } from "../../domain/entities/User";

export class LocalUserRepository implements UserRepository {
  private memoryStore = new Map<string, User>();
  private STORAGE_KEY = "dinnero_users";

  private getStore(): Record<string, User> {
    if (typeof window === "undefined") {
      const store: Record<string, User> = {};
      this.memoryStore.forEach((v, k) => {
        store[k] = v;
      });
      return store;
    }
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  private saveStore(store: Record<string, User>) {
    if (typeof window === "undefined") {
      Object.entries(store).forEach(([k, v]) => {
        this.memoryStore.set(k, v);
      });
      return;
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(store));
  }

  async save(user: User): Promise<void> {
    const store = this.getStore();
    store[user.id] = {
      ...user,
      createdAt: user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt),
    };
    this.saveStore(store);
  }

  async findById(id: string): Promise<User | null> {
    const store = this.getStore();
    const user = store[id];
    if (!user) return null;
    return {
      ...user,
      createdAt: new Date(user.createdAt),
    };
  }
}
