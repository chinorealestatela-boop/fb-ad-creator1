import { supabase, type PlatformConnection } from "./supabase";

export type StoredProfile = {
  name: string;
  businessName: string;
  email: string;
  niche: string;
  targetAudience: string;
  goals: string[];
};

export type StoredConnection = {
  connected: boolean;
  username: string;
  displayName: string;
};

export async function getProfile(): Promise<StoredProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!data) return null;
  return {
    name: data.name || "",
    businessName: data.business_name || "",
    email: data.email || "",
    niche: data.niche || "",
    targetAudience: data.target_audience || "",
    goals: data.goals || [],
  };
}

export async function saveProfile(p: StoredProfile): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").upsert({
    id: user.id,
    name: p.name,
    business_name: p.businessName,
    email: p.email,
    niche: p.niche,
    target_audience: p.targetAudience,
    goals: p.goals,
  });
}

export async function getConnections(): Promise<Record<string, StoredConnection>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};
  const { data } = await supabase.from("platform_connections").select("*").eq("user_id", user.id);
  if (!data) return {};
  const result: Record<string, StoredConnection> = {};
  data.forEach((c: PlatformConnection) => {
    result[c.platform] = { connected: c.connected, username: c.username, displayName: c.display_name };
  });
  return result;
}

export async function saveConnections(connections: Record<string, StoredConnection>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const rows = Object.entries(connections).map(([platform, c]) => ({
    user_id: user.id,
    platform,
    username: c.username,
    display_name: c.displayName,
    connected: c.connected,
  }));
  await supabase.from("platform_connections").delete().eq("user_id", user.id);
  if (rows.length > 0) {
    await supabase.from("platform_connections").insert(rows);
  }
}

export async function isOnboardingDone(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("profiles").select("onboarding_done").eq("id", user.id).single();
  return data?.onboarding_done === true;
}

export async function markOnboardingDone(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").upsert({ id: user.id, onboarding_done: true });
}
