"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { supabase } from "../../lib/supabase";
import { DASHBOARD_STATS, PLATFORM_CONNECTIONS, SAMPLE_CONTENT, AI_RECOMMENDATIONS } from "../../lib/data";
import { formatNumber } from "../../lib/utils";

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸", facebook: "👥", youtube: "▶️", tiktok: "🎵",
};
const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#e1306c", facebook: "#1877f2", youtube: "#ff0000", tiktok: "#69c9d0",
};

function fmtRevenue(n: number) {
  return "$" + n.toLocaleString("en-US");
}

export default function DashboardPage() {
  const [name, setName] = useState("Chino");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.name) setName(user.user_metadata.name.split(" ")[0]);
      else if (user?.email) setName(user.email.split("@")[0]);
    });
  }, []);

  const connectedPlatforms = PLATFORM_CONNECTIONS.filter(p => p.connected);
  const recentContent = SAMPLE_CONTENT.filter(c => c.status === "published").slice(0, 3);
  const topRec = AI_RECOMMENDATIONS.filter(r => r.priority === "high").slice(0, 2);

  return (
    <>
      <Header title="Dashboard" subtitle="Your content empire command center" />
      <div className="page-body fade-in">

        {/* Welcome banner */}
        <div className="card p-6 mb-6" style={{ background: "linear-gradient(135deg,rgba(108,99,255,0.15),rgba(236,72,153,0.08))", border: "1px solid rgba(108,99,255,0.25)" }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", marginBottom: 4 }}>
            Welcome back, {name}! 👑
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Your empire grew <strong style={{ color: "#10b981" }}>+{DASHBOARD_STATS.weeklyGrowthPct}%</strong> this week.
            You&apos;re on track to hit 100K followers next month.
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          <div className="card p-5">
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Total Followers</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", marginBottom: 4 }}>{formatNumber(DASHBOARD_STATS.totalFollowers)}</div>
            <div className="text-xs" style={{ color: "#10b981" }}>+{formatNumber(DASHBOARD_STATS.followersGainedThisMonth)} this month</div>
          </div>
          <div className="card p-5">
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Total Views</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", marginBottom: 4 }}>{formatNumber(DASHBOARD_STATS.totalViews)}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Across {connectedPlatforms.length} platforms</div>
          </div>
          <div className="card p-5">
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Est. Revenue</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", marginBottom: 4 }}>{fmtRevenue(DASHBOARD_STATS.estimatedMonthlyRevenue)}</div>
            <div className="text-xs" style={{ color: "#10b981" }}>This month</div>
          </div>
          <div className="card p-5">
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Content Pieces</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", marginBottom: 4 }}>{DASHBOARD_STATS.totalContent}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>{DASHBOARD_STATS.scheduledPosts} scheduled · {DASHBOARD_STATS.draftPosts} drafts</div>
          </div>
        </div>

        {/* Two-column: platforms + AI recs */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "1fr 1fr" }}>

          {/* Connected platforms */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Connected Platforms</h3>
              <a href="/platforms" className="btn btn-outline btn-sm" style={{ fontSize: 12, textDecoration: "none" }}>Manage →</a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {connectedPlatforms.map(p => (
                <div key={p.platform} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: PLATFORM_COLORS[p.platform] ?? "#6c63ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {PLATFORM_ICONS[p.platform] ?? "📱"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-sm font-semibold" style={{ color: "var(--text-primary)", textTransform: "capitalize" }}>{p.platform}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.accountName}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{formatNumber(p.followers ?? 0)}</div>
                    <span className="badge badge-green" style={{ fontSize: 10 }}>Live</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>AI Insights</h3>
              <a href="/ai-tools" className="btn btn-outline btn-sm" style={{ fontSize: 12, textDecoration: "none" }}>All →</a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topRec.map(rec => (
                <div key={rec.id} className="p-4 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: 18 }}>{rec.icon}</span>
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{rec.title}</span>
                    {rec.priority === "high" && <span className="badge badge-red ml-auto" style={{ fontSize: 10 }}>Hot</span>}
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{rec.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent content */}
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Recent Content</h3>
            <a href="/content" className="btn btn-outline btn-sm" style={{ fontSize: 12, textDecoration: "none" }}>View All →</a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentContent.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, var(--tw-gradient-stops))`, backgroundImage: `linear-gradient(135deg,#6c63ff,#ec4899)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {item.type === "reel" ? "🎬" : item.type === "video" ? "▶️" : "📸"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {formatNumber(item.views ?? 0)} views · {formatNumber(item.likes ?? 0)} likes
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="text-xs font-bold" style={{ color: item.viralScore && item.viralScore >= 90 ? "#f59e0b" : "var(--text-muted)" }}>
                    {item.viralScore && item.viralScore >= 90 ? "🔥 " : ""}{item.viralScore}/100
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>viral score</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance strip */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          {[
            { label: "Avg Engagement",    value: `${DASHBOARD_STATS.avgEngagementRate}%`, sub: "Above industry avg" },
            { label: "Avg Viral Score",   value: `${DASHBOARD_STATS.avgViralScore}/100`,  sub: "Excellent"         },
            { label: "Posts This Week",   value: `${DASHBOARD_STATS.postsThisWeek}`,       sub: "Posting streak 🔥"  },
            { label: "Top Platform",      value: DASHBOARD_STATS.topPerformingPlatform,   sub: "Highest reach"      },
          ].map(k => (
            <div key={k.label} className="card p-5">
              <div className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", marginBottom: 4 }}>{k.value}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{k.sub}</div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
