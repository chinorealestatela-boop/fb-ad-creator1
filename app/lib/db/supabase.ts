import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "../env";

// Server-side Supabase client using the service role key (full access for
// writes during scans and CRM mutations). Returns null when Supabase isn't
// configured so callers can fall back to in-memory/sample data.
let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createClient(
    env.supabaseUrl,
    env.supabaseServiceKey || env.supabaseAnonKey,
    { auth: { persistSession: false } }
  );
  return cached;
}
