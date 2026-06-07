import { UserPreferencesRepository } from "../../domain/repositories/UserPreferencesRepository";
import { UserPreferences } from "../../domain/entities/UserPreferences";
import { LocalUserPreferencesRepository } from "./LocalUserPreferencesRepository";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export class SupabaseUserPreferencesRepository implements UserPreferencesRepository {
  private fallback = new LocalUserPreferencesRepository();

  async save(preferences: UserPreferences): Promise<void> {
    if (!supabase) {
      return this.fallback.save(preferences);
    }
    const { error } = await supabase.from("user_preferences").upsert({
      user_id: preferences.userId,
      shop: preferences.shop,
      weekly_budget: preferences.weeklyBudget,
      number_of_people: preferences.numberOfPeople,
      goal: preferences.goal,
      vibes: preferences.vibes,
      dietary_needs: preferences.dietaryNeeds,
      max_cooking_time: preferences.maxCookingTime,
      kitchen_items: preferences.kitchenItems,
      batch_cooking: preferences.batchCooking,
    });
    if (error) {
      console.error("Error saving user preferences in Supabase:", error);
      await this.fallback.save(preferences);
    }
  }

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    if (!supabase) {
      return this.fallback.findByUserId(userId);
    }
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return this.fallback.findByUserId(userId);
    }

    return {
      userId: data.user_id,
      shop: data.shop,
      weeklyBudget: data.weekly_budget,
      numberOfPeople: data.number_of_people,
      goal: data.goal,
      vibes: data.vibes,
      dietaryNeeds: data.dietary_needs,
      maxCookingTime: data.max_cooking_time,
      kitchenItems: data.kitchen_items,
      batchCooking: data.batch_cooking ?? false,
    };
  }
}
