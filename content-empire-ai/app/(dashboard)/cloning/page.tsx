"use client";

import Header from "../../components/Header";
import { SAMPLE_CONTENT } from "../../lib/data";
import { formatNumber } from "../../lib/utils";

export default function CloningPage() {
  const topContent = SAMPLE_CONTENT
    .filter(c => c.status === "published" && c.views != null)
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 5);

  const blueprint = {
    hookType: "Shock stat + question",
    idealLength: "32–44 seconds",
    captionStyle: "Story opener → 3 value points → CTA",
    bestPostingTime: "7:00 PM PST Tuesday/Thursday",
    hashtagStrategy: "Mix of 5 niche + 3 broad + 2 location tags",
    visualStyle: "Face-to-camera with B-roll cutaways",
    audioStyle: "Voice-over narration + trending sound",
    cta: "'Comment INFO below' or 'Save this'",
  };

  return (
    <>
      <Header title="Content Cloning" subtitle="AI reverse-engineers your top content to build a viral blueprint" />
      <div className="page-body fade-in">

        {/* Blueprint banner */}
        <div
          className="rounded-xl p-5 mb-6"
          style={{
            background: "linear-gradient(135deg, rgba(108,99,255,0.15), rgba(168,85,247,0.1), rgba(236,72,153,0.08))",
            border: "1px solid rgba(108,99,255,0.3)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span style={{ fontSize: 28 }}>🧬</span>
            <div>
              <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>Your Viral DNA Blueprint</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                Reverse-engineered from your top 5 performing videos · Updated daily
              </p>
            </div>
            <div className="ml-auto ai-chip">✦ AI Generated</div>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))" }}>
            {Object.entries(blueprint).map(([key, value]) => (
              <div key={key} className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)" }}>
                <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </div>
                <div className="text-sm font-bold" style={{ color: "var(--accent-light)" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 300px" }}>
          {/* Top performing content */}
          <div>
            <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
              Source Content — Top 5 Videos Analyzed
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topContent.map((item, i) => (
                <div key={item.id} className="card card-hover p-5">
                  <div className="flex items-start gap-4">
                    <div className={`bg-gradient-to-br ${item.thumbnailGradient} rounded-xl flex-shrink-0`}
                      style={{ width: 64, height: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 22, color: "white" }}>▶</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                      <div className="grid gap-3 mt-2" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                        {[
                          { label: "Views", value: formatNumber(item.views ?? 0) },
                          { label: "Engagement", value: `${item.engagementScore}%` },
                          { label: "Viral Score", value: `${item.viralScore}/100` },
                        ].map(s => (
                          <div key={s.label} className="rounded-lg p-2 text-center" style={{ background: "var(--surface-2)" }}>
                            <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{s.value}</div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                      {item.aiAnalysis && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="badge badge-purple">Hook: {item.aiAnalysis.hookType}</span>
                          {item.aiAnalysis.emotions.map(e => (
                            <span key={e} className="badge badge-gray">{e}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Action Plan */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card p-5">
              <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Apply Blueprint</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Generate blueprint captions", desc: "Create 10 captions using your winning formula", done: false },
                  { label: "Apply to upcoming content", desc: "Restructure your next 20 scheduled posts", done: false },
                  { label: "Hook rewrite batch", desc: "Rewrite hooks on 15 underperforming videos", done: false },
                  { label: "Update posting schedule", desc: "Shift all posts to your peak times", done: true },
                ].map(a => (
                  <label key={a.label} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
                    <input type="checkbox" defaultChecked={a.done} style={{ accentColor: "var(--accent)", marginTop: 2 }} />
                    <div>
                      <div className="text-xs font-semibold" style={{ color: a.done ? "var(--text-muted)" : "var(--text-primary)", textDecoration: a.done ? "line-through" : "none" }}>
                        {a.label}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{a.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <button className="btn btn-gradient mt-4 w-full" style={{ justifyContent: "center", width: "100%" }}>
                ✦ Apply Blueprint to All Content
              </button>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Blueprint Stats</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Avg views using blueprint", value: "+187%", color: "#10b981" },
                  { label: "Avg engagement lift", value: "+94%", color: "#6c63ff" },
                  { label: "Blueprint confidence", value: "88%", color: "#f59e0b" },
                  { label: "Last updated", value: "Today", color: "var(--text-secondary)" },
                ].map(s => (
                  <div key={s.label} className="flex justify-between">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</span>
                    <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
