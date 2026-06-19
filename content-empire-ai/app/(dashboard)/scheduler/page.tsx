"use client";

import { useState } from "react";
import Header from "../../components/Header";
import { SAMPLE_CONTENT, SAMPLE_SCHEDULED_POSTS } from "../../lib/data";
import { generateSchedule, PLATFORM_META } from "../../lib/utils";
import type { Platform } from "../../lib/types";

export default function SchedulerPage() {
  const [postsPerDay, setPostsPerDay] = useState(3);
  const [platforms, setPlatforms] = useState<Platform[]>(["instagram", "facebook", "youtube"]);
  const [startDate] = useState("2026-06-20");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalUnscheduled = SAMPLE_CONTENT.filter(c => c.status === "draft").length + 12;
  const schedule = generateSchedule(totalUnscheduled, postsPerDay, new Date(startDate));

  function togglePlatform(p: Platform) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  function generate() {
    setLoading(true);
    setTimeout(() => { setLoading(false); setGenerated(true); }, 2000);
  }

  const PLATFORM_LIST: Platform[] = ["instagram", "facebook", "youtube", "tiktok", "linkedin", "twitter"];

  return (
    <>
      <Header
        title="AI Scheduler"
        subtitle="Let AI automatically build your entire posting calendar"
      />
      <div className="page-body fade-in">

        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 320px" }}>
          {/* Main config */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Content available */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Available Content</h3>
                <a href="/upload" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>+ Upload More</a>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                {[
                  { label: "Unscheduled", value: totalUnscheduled, color: "var(--accent-light)" },
                  { label: "Scheduled", value: 247, color: "#10b981" },
                  { label: "Published", value: 48, color: "var(--text-muted)" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)" }}>
                    <div className="font-black" style={{ fontSize: 28, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule config */}
            <div className="card p-5">
              <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Schedule Configuration</h3>

              <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: "var(--text-secondary)" }}>
                    Posts per day: <span style={{ color: "var(--accent-light)" }}>{postsPerDay}</span>
                  </label>
                  <input
                    type="range" min={1} max={10} value={postsPerDay}
                    onChange={e => setPostsPerDay(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--accent)" }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    <span>1 / day</span><span>10 / day</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: "var(--text-secondary)" }}>Start Date</label>
                  <input type="date" className="input input-sm" defaultValue={startDate} />
                </div>
              </div>

              <div className="mt-5">
                <label className="text-xs font-semibold block mb-3" style={{ color: "var(--text-secondary)" }}>Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_LIST.map(p => {
                    const meta = PLATFORM_META[p];
                    const active = platforms.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                        style={{
                          background: active ? "rgba(108,99,255,0.15)" : "var(--surface-2)",
                          border: `1px solid ${active ? "rgba(108,99,255,0.4)" : "var(--border)"}`,
                          color: active ? "var(--accent-light)" : "var(--text-secondary)",
                          transition: "all 0.15s",
                        }}
                      >
                        <span className={`platform-icon ${meta.cssClass}`} style={{ width: 18, height: 18, fontSize: 9 }}>{meta.abbr}</span>
                        {meta.label}
                        {active && <span style={{ color: "var(--success)" }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <label className="text-xs font-semibold block mb-3" style={{ color: "var(--text-secondary)" }}>Best Posting Times (AI Recommended)</label>
                <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                  {[
                    { time: "7:00 AM", label: "Morning", note: "High open rate" },
                    { time: "12:00 PM", label: "Lunch", note: "Peak scroll time" },
                    { time: "7:00 PM", label: "Evening", note: "Highest engagement" },
                  ].map(t => (
                    <label key={t.time} className="flex items-center gap-2 p-3 rounded-lg cursor-pointer" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: "var(--accent)" }} />
                      <div>
                        <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{t.time} — {t.label}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{t.note}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Preview */}
            {!generated ? (
              <div
                className="rounded-xl p-6 text-center"
                style={{ background: "rgba(108,99,255,0.08)", border: "2px dashed rgba(108,99,255,0.3)" }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
                <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>Ready to Generate Schedule</h3>
                <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
                  AI will create a {Math.ceil(totalUnscheduled / postsPerDay)}-day calendar with {postsPerDay} posts/day
                  across {platforms.length} platform{platforms.length !== 1 ? "s" : ""}.
                  Every post will have AI-optimized captions, hashtags, and timing.
                </p>
                <button
                  className="btn btn-gradient"
                  onClick={generate}
                  disabled={loading || platforms.length === 0}
                >
                  {loading ? (
                    <>
                      <span className="spin">◌</span>
                      AI Building Schedule…
                    </>
                  ) : (
                    "✦ Generate AI Schedule"
                  )}
                </button>
              </div>
            ) : (
              <div>
                <div
                  className="rounded-xl p-4 mb-4 flex items-center gap-3"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}
                >
                  <span style={{ fontSize: 24 }}>✅</span>
                  <div>
                    <div className="font-bold text-sm" style={{ color: "#10b981" }}>
                      Schedule generated! {totalUnscheduled} posts across {schedule.length} days
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {postsPerDay} posts/day · {platforms.length} platforms · AI optimized timing & captions
                    </div>
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <button className="btn btn-outline btn-sm">Edit</button>
                    <a href="/calendar" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>View Calendar →</a>
                  </div>
                </div>

                {/* Schedule preview */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {schedule.slice(0, 7).map((day, i) => {
                    const content = SAMPLE_CONTENT[i % SAMPLE_CONTENT.length];
                    return (
                      <div key={i} className="card flex items-center gap-4 px-4 py-3">
                        <div className="text-xs font-semibold" style={{ color: "var(--text-muted)", width: 80, flexShrink: 0 }}>
                          {day.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </div>
                        <div className={`bg-gradient-to-br ${content.thumbnailGradient} rounded-lg flex-shrink-0`}
                          style={{ width: 40, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 14, color: "white" }}>▶</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{content.title}</p>
                        </div>
                        <div className="flex gap-1">
                          {platforms.slice(0, 3).map(p => {
                            const meta = PLATFORM_META[p];
                            return <span key={p} className={`platform-icon ${meta.cssClass}`} style={{ width: 18, height: 18, fontSize: 9 }}>{meta.abbr}</span>;
                          })}
                        </div>
                        <span className="badge badge-purple text-xs">{day.postsCount} posts</span>
                      </div>
                    );
                  })}
                  {schedule.length > 7 && (
                    <div className="text-center py-3">
                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                        + {schedule.length - 7} more days scheduled
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card p-5">
              <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Schedule Preview</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Total posts</span>
                  <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{totalUnscheduled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Posts per day</span>
                  <span className="font-bold text-sm" style={{ color: "var(--accent-light)" }}>{postsPerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Days of content</span>
                  <span className="font-bold text-sm" style={{ color: "#10b981" }}>{schedule.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Platforms</span>
                  <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{platforms.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>End date</span>
                  <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    {schedule.length > 0
                      ? schedule[schedule.length - 1].date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })
                      : "—"
                    }
                  </span>
                </div>
                <hr className="divider" />
                <div className="rounded-lg p-3" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <div className="text-xs font-semibold" style={{ color: "#10b981" }}>
                    ✅ {schedule.length} days of hands-free publishing
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    AI publishes automatically. You don't lift a finger.
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-sm mb-3" style={{ color: "var(--text-primary)" }}>AI Scheduling Tips</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { icon: "📊", text: "3–5 posts/day maximizes growth without audience fatigue" },
                  { icon: "⏰", text: "7PM posts get 2.3× more engagement for your audience" },
                  { icon: "🔄", text: "Vary content types (reels + carousels + stories) for best reach" },
                  { icon: "📅", text: "Tuesday–Thursday perform best for business content" },
                ].map((tip, i) => (
                  <div key={i} className="flex gap-2">
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{tip.icon}</span>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{tip.text}</p>
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
