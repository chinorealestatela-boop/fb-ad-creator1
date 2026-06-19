"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function OnboardingGuard() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const { data } = await supabase.from("profiles").select("onboarding_done").eq("id", user.id).single();
      if (!data?.onboarding_done) { window.location.href = "/onboarding"; return; }
      setReady(true);
    }
    check();
  }, []);

  if (!ready) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "var(--bg)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>👑</div>
          <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading your empire...</div>
        </div>
      </div>
    );
  }
  return null;
}
