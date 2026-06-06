import { MealPlanRepository } from "../../domain/repositories/MealPlanRepository";
import { MealPlan } from "../../domain/entities/MealPlan";
import { LocalMealPlanRepository } from "./LocalMealPlanRepository";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export class SupabaseMealPlanRepository implements MealPlanRepository {
  private fallback = new LocalMealPlanRepository();

  async save(plan: MealPlan): Promise<void> {
    if (!supabase) {
      return this.fallback.save(plan);
    }
    const { error } = await supabase.from("meal_plans").upsert({
      id: plan.id,
      user_id: plan.userId,
      shop: plan.shop,
      budget: plan.budget,
      estimated_total: plan.estimatedTotal,
      estimated_min: plan.estimatedMin,
      estimated_max: plan.estimatedMax,
      budget_confidence: plan.budgetConfidence,
      people_count: plan.peopleCount,
      days: plan.days,
      shopping_list: plan.shoppingList,
      saved: plan.saved || false,
      created_at: plan.createdAt,
    });
    if (error) {
      console.error("Error saving meal plan in Supabase:", error);
      // fallback save anyway
      await this.fallback.save(plan);
    }
  }

  async findById(id: string): Promise<MealPlan | null> {
    if (!supabase) {
      return this.fallback.findById(id);
    }
    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return this.fallback.findById(id);
    }

    return {
      id: data.id,
      userId: data.user_id,
      shop: data.shop,
      budget: data.budget,
      estimatedTotal: data.estimated_total,
      estimatedMin: data.estimated_min,
      estimatedMax: data.estimated_max,
      budgetConfidence: data.budget_confidence,
      peopleCount: data.people_count,
      days: data.days,
      shoppingList: data.shopping_list,
      saved: data.saved,
      createdAt: new Date(data.created_at),
    };
  }

  async findCurrentByUserId(userId: string): Promise<MealPlan | null> {
    if (!supabase) {
      return this.fallback.findCurrentByUserId(userId);
    }
    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return this.fallback.findCurrentByUserId(userId);
    }

    return {
      id: data.id,
      userId: data.user_id,
      shop: data.shop,
      budget: data.budget,
      estimatedTotal: data.estimated_total,
      estimatedMin: data.estimated_min,
      estimatedMax: data.estimated_max,
      budgetConfidence: data.budget_confidence,
      peopleCount: data.people_count,
      days: data.days,
      shoppingList: data.shopping_list,
      saved: data.saved,
      createdAt: new Date(data.created_at),
    };
  }

  async findSavedByUserId(userId: string): Promise<MealPlan[]> {
    if (!supabase) {
      return this.fallback.findSavedByUserId(userId);
    }
    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("saved", true)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return this.fallback.findSavedByUserId(userId);
    }

    return data.map((d) => ({
      id: d.id,
      userId: d.user_id,
      shop: d.shop,
      budget: d.budget,
      estimatedTotal: d.estimated_total,
      estimatedMin: d.estimated_min,
      estimatedMax: d.estimated_max,
      budgetConfidence: d.budget_confidence,
      peopleCount: d.people_count,
      days: d.days,
      shoppingList: d.shopping_list,
      saved: d.saved,
      createdAt: new Date(d.created_at),
    }));
  }
}
