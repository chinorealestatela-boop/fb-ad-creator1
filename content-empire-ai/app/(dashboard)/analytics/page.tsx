"use client";

import { useState } from "react";
import Header from "../../components/Header";
import StatCard from "../../components/StatCard";
import { SAMPLE_ANALYTICS, SAMPLE_CONTENT } from "../../lib/data";
import { formatNumber, formatCurrency, PLATFORM_META } from "../../lib/utils";

type Range = "7d" | "30d" | "90d";

function MiniChart({ data, color = "#6c63ff" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 40;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  });
  const path = `M ${pts.join(" L ")}`;
  const fill = `M ${pts[0]} L ${pts.join(" L ")} L ${w},${h} L 0,${h} Z`;
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <path d={fill} fill={`${color}22`} />
      <path d={path} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("30d");

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const data = SAMPLE_ANALYTICS.slice(-Math.min(days, SAMPLE_ANALYTICS.length));

  const totals = data.reduce(
    (acc, d) => ({
      views: acc.views + d.views,
      reach: acc.reach + d.reach,
      likes: acc.likes + d.likes,
      comments: acc.comments + d.comments,
      shares: acc.shares + d.shares,
      followers: acc.followers + d.followersGained,
      revenue: acc.revenue + d.revenue,
      watchTime: acc.watchTime + d.watchTimeMinutes,
    }),
    { views: 0, reach: 0, likes: 0, comments: 0, shares: 0, followers: 0, revenue: 0, watchTime: 0 }
  );

  const avgEngagement = ((totals.likes + totals.comments + totals.shares) / totals.reach * 100).toFixed(2);

  const topContent = SAMPLE_CONTENT
    .filter(c => c.status === "published" && c.views != null)
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 8);

  const viewsByDay = data.map(d => d.views);
  const reachByDay = data.map(d => d.reach);
  const followersByDay = data.map(d => d.followersGained);
  const revenueByDay = data.map(d => d.revenue);

  return (
    <>
      <Header
        title="Analytics"
        subtitle="Track your growth, reach, and revenue across all platforms"
      />
      <div className="page-body fade-in">

        {/* Range selector */}
        <div className="flex gap-2 mb-6">
          {(["7d", "30d", "90d"] as Range[]).map(r => (
            <button
              key={r}
              className={`btn btn-sm ${range === r ? "btn-primary" : "btn-outline"}`}
              onClick={() => setRange(r)}
            >
              {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
          <button className="btn btn-outline btn-sm hide-mobile" style={{ marginLeft: "auto" }}>
            ⬇ Export Report
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          <div className="stat-card">
            <div className="text-xs uppercase font-semibold mb-1" style={{ color: "var(--text-muted)", letterSpacing: "0.07em" }}>Total Views</div>
            <div className="font-black mb-1" style={{ fontSize: 26, color: "var(--text-primary)" }}>{formatNumber(totals.views)}</div>
            <MiniChart data={viewsByDay} color="#6c63ff" />
            <div className="text-xs mt-1" style={{ color: "var(--success)" }}>▲ 24% vs prev period</div>
          </div>
          <div className="stat-card">
            <div className="text-xs uppercase font-semibold mb-1" style={{ color: "var(--text-muted)", letterSpacing: "0.07em" }}>Total Reach</div>
            <div className="font-black mb-1" style={{ fontSize: 26, color: "var(--text-primary)" }}>{formatNumber(totals.reach)}</div>
            <MiniChart data={reachByDay} color="#3b82f6" />
            <div className="text-xs mt-1" style={{ color: "var(--success)" }}>▲ 18% vs prev period</div>
          </div>
          <div className="stat-card">
            <div className="text-xs uppercase font-semibold mb-1" style={{ color: "var(--text-muted)", letterSpacing: "0.07em" }}>Followers Gained</div>
            <div className="font-black mb-1" style={{ fontSize: 26, color: "var(--text-primary)" }}>{formatNumber(totals.followers)}</div>
            <MiniChart data={followersByDay} color="#10b981" />
            <div className="text-xs mt-1" style={{ color: "var(--success)" }}>▲ 12% vs prev period</div>
          </div>
          <div className="stat-card">
            <div className="text-xs uppercase font-semibold mb-1" style={{ color: "var(--text-muted)", letterSpacing: "0.07em" }}>Est. Revenue</div>
            <div className="font-black mb-1" style={{ fontSize: 26, color: "var(--text-primary)" }}>{formatCurrency(totals.revenue)}</div>
            <MiniChart data={revenueByDay} color="#f59e0b" />
            <div className="text-xs mt-1" style={{ color: "var(--success)" }}>▲ 31% vs prev period</div>
          </div>
        </div>

        <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: "1fr 280px" }}>

          {/* Views over time bar chart */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Views Over Time</h3>
              <div className="flex gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "#6c63ff", display: "inline-block" }} /> Views
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "#3b82f6", display: "inline-block" }} /> Reach
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 140 }}>
              {data.slice(-20).map((d, i) => {
                const maxViews = Math.max(...data.map(x => x.views));
                const maxReach = Math.max(...data.map(x => x.reach));
                const vh = (d.views / maxViews) * 130;
                const rh = (d.reach / maxReach) * 130;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 1, position: "relative" }}>
                    <div
                      style={{
                        flex: 1, background: "#6c63ff", opacity: 0.8,
                        height: vh, borderRadius: "3px 3px 0 0",
                        minHeight: 3,
                      }}
                    />
                    <div
                      style={{
                        flex: 1, background: "#3b82f6", opacity: 0.6,
                        height: rh, borderRadius: "3px 3px 0 0",
                        minHeight: 3,
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2" style={{ fontSize: 10, color: "var(--text-muted)" }}>
              <span>{data[Math.max(0, data.length - 20)]?.date?.slice(5)}</span>
              <span>{data[data.length - 1]?.date?.slice(5)}</span>
            </div>
          </div>

          {/* Engagement breakdown */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Engagement Breakdown</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Likes", value: totals.likes, color: "#ec4899", pct: 60 },
                { label: "Comments", value: totals.comments, color: "#6c63ff", pct: 15 },
                { label: "Shares", value: totals.shares, color: "#10b981", pct: 25 },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between mb-1.5 text-xs">
                    <span style={{ color: "var(--text-secondary)" }}>{m.label}</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{formatNumber(m.value)}</span>
                  </div>
                  <div className="progress-bar">
                    <div style={{ height: "100%", width: `${m.pct}%`, background: m.color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
              <div className="pt-3 mt-1" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Avg Engagement Rate</div>
                <div className="font-black mt-0.5" style={{ fontSize: 22, color: "var(--success)" }}>{avgEngagement}%</div>
                <div className="text-xs" style={{ color: "var(--text-muted)", marginTop: 2 }}>Industry avg: 1.8%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform breakdown */}
        <div className="card p-5 mb-6">
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Platform Performance</h3>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[
              { platform: "instagram" as const, views: 640000, reach: 820000, followers: 12400, growth: 8.2, color: "#e1306c" },
              { platform: "facebook" as const, views: 280000, reach: 410000, followers: 6800, growth: 3.1, color: "#1877f2" },
              { platform: "youtube" as const, views: 327890, reach: 520000, followers: 3200, growth: 14.7, color: "#ff0000" },
            ].map(p => {
              const meta = PLATFORM_META[p.platform];
              return (
                <div key={p.platform} className="rounded-xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`platform-icon ${meta.cssClass}`}>{meta.abbr}</span>
                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{meta.label}</span>
                    <span className="badge badge-green ml-auto">▲ {p.growth}%</span>
                  </div>
                  <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Views", value: formatNumber(p.views) },
                      { label: "Reach", value: formatNumber(p.reach) },
                      { label: "Followers", value: formatNumber(p.followers) },
                      { label: "Growth", value: `+${p.growth}%` },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top content table */}
        <div className="card p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Top Performing Content</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="flex gap-4 px-2 pb-2 text-xs font-semibold" style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 24 }}>#</div>
              <div style={{ flex: 1 }}>Content</div>
              <div className="hide-mobile" style={{ width: 70, textAlign: "right" }}>Views</div>
              <div className="hide-mobile" style={{ width: 70, textAlign: "right" }}>Likes</div>
              <div className="hide-mobile" style={{ width: 70, textAlign: "right" }}>Shares</div>
              <div style={{ width: 60, textAlign: "right" }}>Score</div>
            </div>
            {topContent.map((item, i) => (
              <div key={item.id} className="flex items-center gap-4 px-2 py-2 rounded-lg" style={{ background: i === 0 ? "rgba(108,99,255,0.05)" : undefined }}>
                <div className="font-black text-sm" style={{ width: 24, color: i < 3 ? "var(--accent-light)" : "var(--text-muted)" }}>
                  {i + 1}
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`bg-gradient-to-br ${item.thumbnailGradient} rounded-md flex-shrink-0`}
                    style={{ width: 36, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 13, color: "white" }}>▶</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                    <div className="flex gap-1 mt-0.5">
                      {item.platforms.slice(0, 3).map(p => (
                        <span key={p} className={`platform-icon ${PLATFORM_META[p].cssClass}`} style={{ width: 13, height: 13, fontSize: 7, borderRadius: 2 }}>
                          {PLATFORM_META[p].abbr}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hide-mobile text-sm font-semibold text-right" style={{ width: 70, color: "var(--text-primary)" }}>{formatNumber(item.views ?? 0)}</div>
                <div className="hide-mobile text-sm text-right" style={{ width: 70, color: "var(--text-secondary)" }}>{formatNumber(item.likes ?? 0)}</div>
                <div className="hide-mobile text-sm text-right" style={{ width: 70, color: "var(--text-secondary)" }}>{formatNumber(item.shares ?? 0)}</div>
                <div style={{ width: 60, display: "flex", justifyContent: "flex-end" }}>
                  <div
                    className={`score-ring ${item.viralScore >= 75 ? "score-high" : "score-med"}`}
                    style={{ width: 30, height: 30, fontSize: 10 }}
                  >
                    {item.viralScore}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
