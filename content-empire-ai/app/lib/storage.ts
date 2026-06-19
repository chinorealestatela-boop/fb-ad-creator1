export interface StoredProfile {
  name: string;
  businessName: string;
  email: string;
  niche: string;
  targetAudience: string;
  goals: string[];
}

export interface StoredConnection {
  connected: boolean;
  username: string;
  displayName: string;
}

const K = {
  PROFILE: "cea_profile",
  CONNECTIONS: "cea_connections",
  ONBOARDING: "cea_onboarding",
};

function safe<T>(fn: () => T, fallback: T): T {
  try { return fn(); } catch { return fallback; }
}

export function getProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null;
  return safe(() => {
    const v = localStorage.getItem(K.PROFILE);
    return v ? JSON.parse(v) : null;
  }, null);
}

export function saveProfile(p: StoredProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(K.PROFILE, JSON.stringify(p));
}

export function getConnections(): Record<string, StoredConnection> {
  if (typeof window === "undefined") return {};
  return safe(() => {
    const v = localStorage.getItem(K.CONNECTIONS);
    return v ? JSON.parse(v) : {};
  }, {});
}

export function saveConnections(c: Record<string, StoredConnection>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(K.CONNECTIONS, JSON.stringify(c));
}

export function isOnboardingDone(): boolean {
  if (typeof window === "undefined") return false;
  return safe(() => localStorage.getItem(K.ONBOARDING) === "true", false);
}

export function markOnboardingDone() {
  if (typeof window === "undefined") return;
  localStorage.setItem(K.ONBOARDING, "true");
}
