"use client";

import { useState } from "react";
import Header from "../../components/Header";
import { SAMPLE_CONTENT } from "../../lib/data";
import { formatNumber, PLATFORM_META } from "../../lib/utils";

export default function RepostEnginePage() {
  const [scheduled, setScheduled] = useState<Set<string>>(new Set());

  const repostCandidates = SAMPLE_CONTENT
    .filter(c => c.status === "published" && c.views != null)
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 10)
    .map((item, i) => {
      const daysAgo = [65, 42, 31, 88, 57, 72, 39, 94, 61, 48][i];
      const recommendedIn = [0, 3, 5, 2, 8, 1, 12, 0, 4, 7][i];
      return {
        ...item,
        daysAgo,
        recommendedIn,
        repostScore: Math.round((item.viralScore + item.engagementScore) / 2),
        newCaption: `🔄 REPOST — Still one of the most important things I've shared.\n\n${item.caption ?? ""}`,
        repostDate: new Date("2026-06-19").getTime() + recommendedIn * 24 * 60 * 60 * 1000,
      };
    });

  function schedule(id: string) {
    setScheduled(prev => new Set([...prev, id]));
  }

  return (
    <>
      <Header title="Repost Engine" subtitle="AI identifies winning content worth resharing with fresh angles" />
      <div className="page-body fade-in">

        {/* Explainer */}
        <div
          className="rounded-xl p-4 mb-6 flex items-center gap-4"
          style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.25)" }}
        >
          <span style={{ fontSize: 28, flexShrink: 0 }}>♻️</span>
          <div>
            <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>How the Repost Engine Works</div>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              AI continuously monitors your published content for repost opportunities. When content passes 30, 60, or 90 days
              and shows strong engagement patterns, AI generates a fresh caption, new hooks, and optimal timing — ready to reschedule in one click.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          {[
            { label: "Repost Candidates", value: repostCandidates.length, color: "#6c63ff" },
            { label: "Ready to Repost Now", value: repostCandidates.filter(r => r.recommendedIn === 0).length, color: "#10b981" },
            { label: "Scheduled Reposts", value: scheduled.size, color: "#f59e0b" },
            { label: "Avg Repost Lift", value: "+34%", color: "#ec4899" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="text-xs uppercase font-semibold mb-2" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              <div className="font-black" style={{ fontSize: 26, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Candidates */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {repostCandidates.map(item => {
            const isScheduled = scheduled.has(item.id);
            const readyNow = item.recommendedIn === 0;
            const repostDateStr = new Date(item.repostDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            return (
              <div key={item.id} className="card card-hover p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`bg-gradient-to-br ${item.thumbnailGradient} rounded-xl flex-shrink-0`}
                    style={{ width: 72, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <span style={{ fontSize: 26, color: "white" }}>▶</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="badge badge-gray">{item.daysAgo} days ago</span>
                          {readyNow
                            ? <span className="badge badge-green">✅ Ready to Repost</span>
                            : <span className="badge badge-purple">Repost in {item.recommendedIn} days</span>
                          }
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isScheduled ? (
                          <span className="badge badge-green">✅ Scheduled for {repostDateStr}</span>
                        ) : (
                          <>
                            <button className="btn btn-outline btn-sm">✎ Edit Caption</button>
                            <button
                              className="btn btn-gradient btn-sm"
                              onClick={() => schedule(item.id)}
                            >
                              ♻️ Schedule Repost
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid mt-4 gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                      {/* Original stats */}
                      <div className="rounded-lg p-3" style={{ background: "var(--surface-2)" }}>
                        <div className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Original Performance</div>
                        <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                          {[
                            { label: "Views", value: formatNumber(item.views ?? 0) },
                            { label: "Likes", value: formatNumber(item.likes ?? 0) },
                            { label: "Shares", value: formatNumber(item.shares ?? 0) },
                          ].map(s => (
                            <div key={s.label} className="text-center">
                              <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{s.value}</div>
                              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI new caption */}
                      <div className="rounded-lg p-3" style={{ background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.15)" }}>
                        <div className="flex items-center gap-1 text-xs font-semibold mb-2" style={{ color: "var(--accent-light)" }}>
                          <span>✦</span> AI New Caption
                        </div>
                        <p className="text-xs leading-relaxed truncate-2" style={{ color: "var(--text-secondary)" }}>
                          {item.newCaption}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex gap-1">
                        {item.platforms.map(p => (
                          <span key={p} className={`platform-icon ${PLATFORM_META[p].cssClass}`} style={{ width: 18, height: 18, fontSize: 9 }}>
                            {PLATFORM_META[p].abbr}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        <span>Projected repost date:</span>
                        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{repostDateStr}</span>
                      </div>
                      <div className="ml-auto flex items-center gap-1 text-xs" style={{ color: "#10b981" }}>
                        <span>Est. repost lift:</span>
                        <span style={{ fontWeight: 700 }}>+{Math.round(item.repostScore * 0.4)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
