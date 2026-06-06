import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";

type UserRow = {
  id: string;
  email: string;
  subscription_status: "free" | "pro";
  created_at: string;
};

export function createSupabaseUserRepository(): SupabaseUserRepository | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return new SupabaseUserRepository(createClient(url, serviceKey));
}

export class SupabaseUserRepository implements UserRepository {
  constructor(private supabase: SupabaseClient) {}

  async save(user: User): Promise<void> {
    const { error } = await this.supabase.from("users").upsert({
      id: user.id,
      email: user.email,
      subscription_status: user.subscriptionStatus,
      created_at: user.createdAt.toISOString(),
    });

    if (error) {
      throw new Error(`Unable to save user in Supabase: ${error.message}`);
    }
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from("users")
      .select("id,email,subscription_status,created_at")
      .eq("id", id)
      .maybeSingle<UserRow>();

    if (error) {
      throw new Error(`Unable to read user in Supabase: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      subscriptionStatus: data.subscription_status,
      createdAt: new Date(data.created_at),
    };
  }
}
