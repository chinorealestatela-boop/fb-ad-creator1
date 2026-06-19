"use client";

import { useState } from "react";
import Header from "../../components/Header";
import AIRecommendationCard from "../../components/AIRecommendationCard";
import { AI_RECOMMENDATIONS, SAMPLE_CONTENT } from "../../lib/data";
import type { AIRecommendation } from "../../lib/types";

export default function StrategyPage() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = AI_RECOMMENDATIONS.filter(r => !dismissed.has(r.id));

  function dismiss(rec: AIRecommendation) {
    setDismissed(prev => new Set([...prev, rec.id]));
  }

  const topHooks = [
    { hook: "Shock stat", count: 8, pct: 75, avgViews: 42000 },
    { hook: "Story opener", count: 6, pct: 60, avgViews: 38000 },
    { hook: "Bold claim", count: 5, pct: 55, avgViews: 31000 },
    { hook: "Question", count: 4, pct: 42, avgViews: 24000 },
    { hook: "Pain point", count: 3, pct: 35, avgViews: 19000 },
  ];

  const insights = [
    { label: "Best content length", value: "30–45 seconds", icon: "⏱", color: "#6c63ff" },
    { label: "Best posting time", value: "7 PM PST", icon: "⏰", color: "#10b981" },
    { label: "Best day to post", value: "Tuesday & Thursday", icon: "📅", color: "#3b82f6" },
    { label: "Audience age range", value: "28–45 years", icon: "👥", color: "#f59e0b" },
    { label: "Top content category", value: "Real Estate Tips", icon: "🏡", color: "#ec4899" },
    { label: "Best caption style", value: "Storytelling", icon: "✎", color: "#a855f7" },
  ];

  return (
    <>
      <Header title="AI Strategist" subtitle="Your always-on AI content strategist and growth advisor" />
      <div className="page-body fade-in">

        {/* Active Recommendations */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                Active AI Recommendations
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {visible.length} actionable insight{visible.length !== 1 ? "s" : ""} ready for you
              </p>
            </div>
            <div className="ai-chip">✦ AI Live</div>
          </div>
          {visible.length === 0 ? (
            <div className="card p-10 text-center" style={{ color: "var(--text-muted)" }}>
              <div style={{ fontSize: 36 }}>✅</div>
              <p className="mt-3 text-sm">All caught up! AI is monitoring and will surface new insights automatically.</p>
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {visible.map(rec => (
                <div key={rec.id} style={{ position: "relative" }}>
                  <AIRecommendationCard rec={rec} onAction={dismiss} />
                  <button
                    onClick={() => dismiss(rec)}
                    style={{
                      position: "absolute", top: 10, right: 10,
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--text-muted)", fontSize: 16,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>

          {/* Viral Blueprint */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span style={{ fontSize: 20 }}>🧠</span>
              <div>
                <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Viral Blueprint</h3>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Based on your top 12 performing videos</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topHooks.map(h => (
                <div key={h.hook}>
                  <div className="flex justify-between mb-1 text-xs">
                    <span style={{ color: "var(--text-secondary)" }}>{h.hook}</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>avg {(h.avgViews / 1000).toFixed(0)}K views</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${h.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg" style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)" }}>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                <strong style={{ color: "var(--accent-light)" }}>AI Recommendation:</strong> Lead every video with a shock stat or story opener.
                Your audience is 2.8× more likely to watch past 3 seconds.
              </p>
            </div>
          </div>

          {/* Audience Insights */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span style={{ fontSize: 20 }}>👥</span>
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Audience Insights</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Primary location", value: "Los Angeles Metro", pct: 68 },
                { label: "Interests", value: "Real Estate, Finance", pct: 82 },
                { label: "Most active time", value: "6–9 PM PST", pct: 74 },
                { label: "Device", value: "Mobile (iPhone)", pct: 91 },
                { label: "Content preference", value: "Short-form video", pct: 85 },
              ].map(a => (
                <div key={a.label}>
                  <div className="flex justify-between mb-1 text-xs">
                    <span style={{ color: "var(--text-muted)" }}>{a.label}</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{a.value}</span>
                  </div>
                  <div className="progress-bar">
                    <div style={{ height: "100%", width: `${a.pct}%`, background: "#10b981", borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Content Performance Insights</h3>
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {insights.map(ins => (
                <div key={ins.label} className="p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
                  <span style={{ fontSize: 20, display: "block", marginBottom: 6 }}>{ins.icon}</span>
                  <div className="text-xs" style={{ color: "var(--text-muted)", marginBottom: 2 }}>{ins.label}</div>
                  <div className="text-sm font-bold" style={{ color: ins.color }}>{ins.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Forecast */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Growth Forecast</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "30-day follower projection", current: "22.4K", projected: "26.8K", color: "#10b981" },
                { label: "90-day view projection", current: "1.25M", projected: "4.1M", color: "#6c63ff" },
                { label: "90-day revenue projection", current: "$3,420", projected: "$8,900", color: "#f59e0b" },
              ].map(f => (
                <div key={f.label}>
                  <div className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>{f.label}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{f.current}</span>
                    <div style={{ flex: 1, height: 2, background: "var(--border)", borderRadius: 99, position: "relative" }}>
                      <div style={{ position: "absolute", left: 0, top: -2, height: 6, width: "40%", background: f.color, borderRadius: 99 }} />
                      <div style={{ position: "absolute", top: -2, height: 6, width: 2, left: "40%", background: "white", borderRadius: 99 }} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: f.color }}>{f.projected}</span>
                  </div>
                </div>
              ))}
              <div className="rounded-lg p-3 mt-1" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  <strong style={{ color: "#10b981" }}>Forecast confidence: 78%</strong> — Based on current trajectory and content quality scores.
                  Posting consistently at 3/day keeps you on track.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trending topics */}
        <div className="card p-5 mt-6">
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
            🔥 Trending Topics in Your Niche
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              { topic: "Interest rate drop 2026", score: 94, trend: "+340%" },
              { topic: "First-time homebuyer tips", score: 88, trend: "+218%" },
              { topic: "LA real estate crash or boom?", score: 85, trend: "+187%" },
              { topic: "How to buy with no down payment", score: 81, trend: "+156%" },
              { topic: "Best neighborhoods in LA 2026", score: 77, trend: "+112%" },
              { topic: "Investment property tax strategies", score: 72, trend: "+98%" },
              { topic: "Open house tips for sellers", score: 68, trend: "+74%" },
              { topic: "Pre-approval checklist", score: 65, trend: "+61%" },
            ].map(t => (
              <div
                key={t.topic}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(108,99,255,0.08)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                }}
              >
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{t.topic}</span>
                <span className="badge badge-green">{t.trend}</span>
                <div
                  className={`score-ring ${t.score >= 80 ? "score-high" : "score-med"}`}
                  style={{ width: 24, height: 24, fontSize: 9 }}
                >
                  {t.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
