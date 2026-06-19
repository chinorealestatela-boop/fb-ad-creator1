"use client";

import { useState } from "react";
import Header from "../../components/Header";
import { USER_PROFILE } from "../../lib/data";

export default function SettingsPage() {
  const [profile, setProfile] = useState(USER_PROFILE);
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const TABS = ["Profile", "Publishing", "Notifications", "Integrations", "Billing"] as const;
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Profile");

  return (
    <>
      <Header title="Settings" subtitle="Manage your account, preferences, and integrations" />
      <div className="page-body fade-in">

        <div className="grid gap-6" style={{ gridTemplateColumns: "200px 1fr" }}>
          {/* Tabs */}
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {TABS.map(tab => (
                <button
                  key={tab}
                  className={`sidebar-item ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            {activeTab === "Profile" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="card p-6">
                  <h3 className="font-bold mb-5" style={{ color: "var(--text-primary)" }}>Profile Information</h3>
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      style={{
                        width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                        background: "linear-gradient(135deg, #6c63ff, #ec4899)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontWeight: 800, fontSize: 24,
                      }}
                    >
                      C
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: "var(--text-primary)" }}>{profile.name}</div>
                      <div className="text-sm" style={{ color: "var(--text-muted)" }}>{profile.email}</div>
                      <button className="btn btn-ghost btn-xs mt-1" style={{ color: "var(--accent-light)" }}>Change Photo</button>
                    </div>
                  </div>
                  <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    {[
                      { label: "Business / Creator Name", value: profile.name, key: "name" },
                      { label: "Email Address", value: profile.email, key: "email" },
                      { label: "Niche / Industry", value: profile.niche, key: "niche" },
                      { label: "Target Audience", value: profile.targetAudience, key: "targetAudience" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>{f.label}</label>
                        <input
                          type="text"
                          className="input"
                          defaultValue={f.value}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Goals</label>
                    <textarea
                      className="input"
                      defaultValue={profile.goals.join(", ")}
                      style={{ minHeight: 60 }}
                    />
                  </div>
                  <button className="btn btn-gradient mt-5" onClick={save}>
                    {saved ? "✓ Saved!" : "Save Changes"}
                  </button>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Plan & Billing</h3>
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)" }}>
                    <div>
                      <div className="font-bold" style={{ color: "var(--text-primary)" }}>Pro Plan</div>
                      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>$79/month · Up to 10,000 posts/month</div>
                    </div>
                    <button className="btn btn-outline btn-sm">Upgrade to Enterprise</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Publishing" && (
              <div className="card p-6">
                <h3 className="font-bold mb-5" style={{ color: "var(--text-primary)" }}>Publishing Preferences</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      Default Posts Per Day: <span style={{ color: "var(--accent-light)" }}>{profile.postingFrequency}</span>
                    </label>
                    <input type="range" min={1} max={10} defaultValue={profile.postingFrequency} style={{ width: "100%", accentColor: "var(--accent)" }} />
                  </div>
                  {[
                    { label: "Auto-publish scheduled posts", on: true },
                    { label: "AI auto-generates captions", on: true },
                    { label: "AI selects best posting times", on: true },
                    { label: "Auto-repost high-performing content", on: false },
                    { label: "Cross-post to all connected platforms", on: true },
                    { label: "Notify me before each post goes live", on: false },
                  ].map(opt => (
                    <div key={opt.label} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{opt.label}</span>
                      <div className={`toggle-track ${opt.on ? "on" : ""}`}>
                        <div className="toggle-thumb" />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-gradient mt-6" onClick={save}>{saved ? "✓ Saved!" : "Save Changes"}</button>
              </div>
            )}

            {activeTab === "Notifications" && (
              <div className="card p-6">
                <h3 className="font-bold mb-5" style={{ color: "var(--text-primary)" }}>Notification Preferences</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { group: "Publishing", items: [
                      { label: "Post goes live", on: true },
                      { label: "Post fails to publish", on: true },
                      { label: "Post published successfully", on: false },
                    ]},
                    { group: "Performance", items: [
                      { label: "Content goes viral (1K+ views)", on: true },
                      { label: "Content underperforms", on: true },
                      { label: "New followers milestone", on: true },
                    ]},
                    { group: "AI Insights", items: [
                      { label: "New AI recommendation available", on: true },
                      { label: "Trending topic in your niche", on: true },
                      { label: "Revenue milestone reached", on: true },
                    ]},
                  ].map(group => (
                    <div key={group.group}>
                      <div className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--text-muted)", letterSpacing: "0.07em" }}>{group.group}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {group.items.map(item => (
                          <div key={item.label} className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                            <div className={`toggle-track ${item.on ? "on" : ""}`}><div className="toggle-thumb" /></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-gradient mt-6" onClick={save}>{saved ? "✓ Saved!" : "Save Changes"}</button>
              </div>
            )}

            {activeTab === "Integrations" && (
              <div className="card p-6">
                <h3 className="font-bold mb-5" style={{ color: "var(--text-primary)" }}>API Integrations</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { name: "OpenAI (GPT-4o)", status: "connected", desc: "AI analysis, captions, strategy" },
                    { name: "OpenAI Whisper", status: "connected", desc: "Video transcription" },
                    { name: "AWS S3", status: "connected", desc: "Content storage" },
                    { name: "Instagram Graph API", status: "connected", desc: "Publishing & analytics" },
                    { name: "Facebook Graph API", status: "connected", desc: "Publishing & analytics" },
                    { name: "YouTube Data API", status: "connected", desc: "Publishing & analytics" },
                    { name: "Supabase", status: "connected", desc: "Database & auth" },
                    { name: "TikTok API", status: "coming soon", desc: "Phase 2" },
                    { name: "LinkedIn API", status: "coming soon", desc: "Phase 2" },
                  ].map(int => (
                    <div key={int.name} className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{int.name}</div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>{int.desc}</div>
                      </div>
                      <span className={`badge ${int.status === "connected" ? "badge-green" : "badge-gray"}`}>{int.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "Billing" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="card p-6">
                  <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Current Plan</h3>
                  <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                    {[
                      { plan: "Starter", price: "$29", posts: "1,000", features: ["3 platforms", "AI captions", "Basic analytics"], current: false },
                      { plan: "Pro", price: "$79", posts: "10,000", features: ["6 platforms", "All AI features", "Advanced analytics", "Team access"], current: true },
                      { plan: "Enterprise", price: "$199", posts: "Unlimited", features: ["All platforms", "Custom AI training", "White-label", "Priority support"], current: false },
                    ].map(p => (
                      <div
                        key={p.plan}
                        className="rounded-xl p-5 text-center"
                        style={{
                          background: p.current ? "rgba(108,99,255,0.12)" : "var(--surface-2)",
                          border: `1px solid ${p.current ? "rgba(108,99,255,0.4)" : "var(--border)"}`,
                        }}
                      >
                        <div className="font-black" style={{ fontSize: 22, color: "var(--text-primary)" }}>{p.plan}</div>
                        <div className="font-black my-2" style={{ fontSize: 28, color: p.current ? "var(--accent-light)" : "var(--text-primary)" }}>
                          {p.price}<span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-muted)" }}>/mo</span>
                        </div>
                        <div className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>{p.posts} posts/month</div>
                        {p.features.map(f => (
                          <div key={f} className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>✓ {f}</div>
                        ))}
                        <button
                          className={`btn mt-4 w-full ${p.current ? "btn-outline" : "btn-gradient"}`}
                          style={{ justifyContent: "center", width: "100%" }}
                          disabled={p.current}
                        >
                          {p.current ? "Current Plan" : `Upgrade to ${p.plan}`}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
