// Central place to read configuration and decide which features are "live"
// vs. running on sample/in-memory fallbacks. The app is fully usable with none
// of these set — each key simply turns on a capability.

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  rentcastApiKey: process.env.RENTCAST_API_KEY ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
};

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && (env.supabaseServiceKey || env.supabaseAnonKey));
}

export function isRentcastConfigured(): boolean {
  return Boolean(env.rentcastApiKey);
}
