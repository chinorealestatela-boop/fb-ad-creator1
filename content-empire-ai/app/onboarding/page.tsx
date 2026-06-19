"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const NICHES = [
  "Real Estate","Fitness & Health","Food & Cooking","Business & Finance",
  "Education","Entertainment","Fashion & Beauty","Travel","Technology",
  "Sports","Music","Art & Design","Parenting","Gaming","Other",
];

const GOAL_OPTIONS = [
  "Grow my followers to 50K+",
  "Generate $5K+/month from content",
  "Post daily across 3+ platforms",
  "Build a recognizable personal brand",
  "Drive leads to my business",
  "Launch a digital product or course",
  "Grow a YouTube channel",
  "Go viral consistently",
];

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: "📸", color: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", placeholder: "@yourusername", label: "Instagram Username" },
  { id: "facebook",  name: "Facebook",  icon: "👥", color: "#1877f2", placeholder: "Your Page Name",    label: "Facebook Page Name"    },
  { id: "youtube",   name: "YouTube",   icon: "▶️", color: "#ff0000", placeholder: "Your Channel Name", label: "YouTube Channel Name"  },
  { id: "tiktok",    name: "TikTok",    icon: "🎵", color: "linear-gradient(135deg,#010101,#69c9d0)",  placeholder: "@yourusername", label: "TikTok Username" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState({ name: "", businessName: "", niche: "", targetAudience: "", goals: [] as string[] });
  const [handles, setHandles] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { window.location.href = "/login"; return; }
      setUserId(user.id);
      setUserEmail(user.email || "");
    });
  }, []);

  function toggleGoal(g: string) {
    setProfile(p => ({ ...p, goals: p.goals.includes(g) ? p.goals.filter(x => x !== g) : [...p.goals, g] }));
  }

  async function finish() {
    if (!userId) return;
    setSaving(true);
    await supabase.from("profiles").upsert({
      id: userId,
      name: profile.name,
      business_name: profile.businessName,
      email: userEmail,
      niche: profile.niche,
      target_audience: profile.targetAudience,
      goals: profile.goals,
      onboarding_done: true,
    });
    const connRows = Object.entries(handles)
      .filter(([, u]) => u.trim())
      .map(([platform, username]) => ({ user_id: userId, platform, username: username.trim(), display_name: username.trim(), connected: true }));
    if (connRows.length > 0) {
      await supabase.from("platform_connections").upsert(connRows, { onConflict: "user_id,platform" });
    }
    setSaving(false);
    window.location.href = "/dashboard";
  }

  const TOTAL = 3;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "var(--surface-2)" }}>
        <div style={{ height: "100%", width: `${(step / TOTAL) * 100}%`, background: "linear-gradient(90deg,#6c63ff,#ec4899)", transition: "width 0.4s ease" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 520 }}>
        {step === 1 && (
          <div className="fade-in">
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🚀</div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>Welcome to Content Empire AI</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Let&apos;s set up your account. Takes about 2 minutes.</p>
            </div>
            <div className="card p-6" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Your Full Name</label>
                <input className="input" placeholder="e.g. Chino Reyes" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Business / Creator Name</label>
                <input className="input" placeholder="e.g. Chino Real Estate LA" value={profile.businessName} onChange={e => setProfile(p => ({ ...p, businessName: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
                <input className="input" type="email" value={userEmail} disabled style={{ opacity: 0.6 }} />
              </div>
            </div>
            <button className="btn btn-gradient mt-5" style={{ width: "100%", justifyContent: "center", padding: "14px 0", fontSize: 15 }} disabled={!profile.name.trim()} onClick={() => setStep(2)}>Continue →</button>
            <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, marginTop: 12 }}>Step 1 of {TOTAL}</p>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🎯</div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>Tell us about your content</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>AI uses this to personalize your strategy.</p>
            </div>
            <div className="card p-6" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Your Niche / Industry</label>
                <select className="input" value={profile.niche} onChange={e => setProfile(p => ({ ...p, niche: e.target.value }))}>
                  <option value="">Select your niche...</option>
                  {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Target Audience</label>
                <input className="input" placeholder="e.g. Home buyers & sellers, ages 28–50, Los Angeles" value={profile.targetAudience} onChange={e => setProfile(p => ({ ...p, targetAudience: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: "var(--text-secondary)" }}>Your Goals <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(select all that apply)</span></label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {GOAL_OPTIONS.map(goal => {
                    const on = profile.goals.includes(goal);
                    return (
                      <button key={goal} onClick={() => toggleGoal(goal)} style={{ padding: "10px 12px", borderRadius: 10, textAlign: "left", cursor: "pointer", border: `1px solid ${on ? "rgba(108,99,255,0.5)" : "var(--border)"}`, background: on ? "rgba(108,99,255,0.12)" : "var(--surface-2)", color: on ? "var(--accent-light)" : "var(--text-secondary)", fontSize: 12, lineHeight: 1.4, transition: "all 0.13s" }}>
                        {on ? "✓ " : ""}{goal}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button className="btn btn-outline flex-1" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-gradient flex-1" style={{ justifyContent: "center" }} disabled={!profile.niche} onClick={() => setStep(3)}>Continue →</button>
            </div>
            <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, marginTop: 12 }}>Step 2 of {TOTAL}</p>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in">
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🔗</div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>Connect your platforms</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Enter your handles so AI knows where to post.</p>
            </div>
            <div className="card p-6" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {PLATFORMS.map(pl => (
                <div key={pl.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, background: pl.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{pl.icon}</div>
                  <div style={{ flex: 1 }}>
                    <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>{pl.label}</label>
                    <input className="input" style={{ padding: "8px 12px" }} placeholder={pl.placeholder} value={handles[pl.id] || ""} onChange={e => setHandles(h => ({ ...h, [pl.id]: e.target.value }))} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button className="btn btn-outline flex-1" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-gradient flex-1" style={{ justifyContent: "center" }} onClick={finish} disabled={saving}>
                {saving ? "Saving..." : "Launch My Dashboard 🚀"}
              </button>
            </div>
            <button onClick={finish} disabled={saving} style={{ display: "block", width: "100%", textAlign: "center", marginTop: 14, background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", padding: 8 }}>
              Skip — I&apos;ll connect platforms later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
