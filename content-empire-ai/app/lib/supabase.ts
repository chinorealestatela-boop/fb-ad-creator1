import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name: string;
  business_name: string;
  email: string;
  niche: string;
  target_audience: string;
  goals: string[];
  onboarding_done: boolean;
};

export type PlatformConnection = {
  id?: string;
  user_id: string;
  platform: string;
  username: string;
  display_name: string;
  connected: boolean;
};
