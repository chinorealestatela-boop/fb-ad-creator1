"use client";
import { useEffect } from "react";

export default function OnboardingGuard() {
  useEffect(() => {
    if (localStorage.getItem("cea_onboarding") !== "true") {
      window.location.replace("/onboarding/");
    }
  }, []);
  return null;
}
