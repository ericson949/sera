import { MealPlanRepository } from "../../domain/repositories/MealPlanRepository";
import { MealPlan } from "../../domain/entities/MealPlan";
import { buildShoppingList } from "../../domain/services/buildShoppingList";

export class LocalMealPlanRepository implements MealPlanRepository {
  private memoryStore = new Map<string, MealPlan>();
  private STORAGE_KEY = "dinnero_meal_plans";

  private getStore(): Record<string, MealPlan> {
    if (typeof window === "undefined") {
      const store: Record<string, MealPlan> = {};
      this.memoryStore.forEach((v, k) => {
        store[k] = v;
      });
      return store;
    }
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  private saveStore(store: Record<string, MealPlan>) {
    if (typeof window === "undefined") {
      Object.entries(store).forEach(([k, v]) => {
        this.memoryStore.set(k, v);
      });
      return;
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(store));
  }

  async save(plan: MealPlan): Promise<void> {
    const store = this.getStore();
    store[plan.id] = {
      ...plan,
      createdAt: plan.createdAt instanceof Date ? plan.createdAt : new Date(plan.createdAt),
    };
    this.saveStore(store);
  }

  async findById(id: string): Promise<MealPlan | null> {
    const store = this.getStore();
    const plan = store[id];
    if (!plan) return null;
    return {
      ...plan,
      createdAt: new Date(plan.createdAt),
    };
  }

  async findCurrentByUserId(userId: string): Promise<MealPlan | null> {
    const store = this.getStore();
    const plans = Object.values(store)
      .filter((p) => p.userId === userId)
      .map((p) => ({ ...p, createdAt: new Date(p.createdAt) }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return plans.length > 0 ? plans[0] : null;
  }

  async findSavedByUserId(userId: string): Promise<MealPlan[]> {
    const store = this.getStore();
    return Object.values(store)
      .filter((p) => p.userId === userId && p.saved === true)
      .map((p) => ({ ...p, createdAt: new Date(p.createdAt) }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateMeal(planId: string, mealId: string, update: Partial<MealPlan["days"][number]>): Promise<MealPlan> {
    const store = this.getStore();
    const plan = store[planId];
    if (!plan) throw new Error("Meal plan not found.");

    const days = plan.days.map((meal) => meal.id === mealId ? { ...meal, ...update } : meal);
    const updated = { ...plan, days, shoppingList: buildShoppingList(days, plan.shoppingList), createdAt: new Date(plan.createdAt) };
    store[planId] = updated;
    this.saveStore(store);
    return updated;
  }
}
