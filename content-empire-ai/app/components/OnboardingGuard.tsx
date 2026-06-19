"use client";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function OnboardingGuard() {
  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      const { data } = await supabase.from("profiles").select("onboarding_done").eq("id", user.id).single();
      if (!data?.onboarding_done) {
        window.location.href = "/onboarding";
      }
    }
    check();
  }, []);
  return null;
}
