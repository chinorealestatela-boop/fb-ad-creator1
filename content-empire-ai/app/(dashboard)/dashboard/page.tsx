"use client";

import Link from "next/link";
import Header from "../../components/Header";
import StatCard from "../../components/StatCard";
import AIRecommendationCard from "../../components/AIRecommendationCard";
import { DASHBOARD_STATS, SAMPLE_CONTENT, SAMPLE_SCHEDULED_POSTS, AI_RECOMMENDATIONS } from "../../lib/data";
import { formatNumber, formatCurrency, PLATFORM_META, formatDate } from "../../lib/utils";
import type { AIRecommendation } from "../../lib/types";

export default function DashboardPage() {
  const upcomingPosts = SAMPLE_SCHEDULED_POSTS
    .filter(p => p.status === "pending")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 6);

  const topContent = SAMPLE_CONTENT
    .filter(c => c.status === "published" && c.views != null)
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 5);

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Good morning — here's your content empire overview"
        actions={
          <Link href="/upload" className="btn btn-gradient btn-sm" style={{ textDecoration: "none" }}>
            ⬆ Upload Content
          </Link>
        }
      />
      <div className="page-body fade-in">

        {/* AI Banner */}
        <div
          className="rounded-xl p-4 mb-6 flex items-center justify-between gap-4"
          style={{
            background: "linear-gradient(135deg, rgba(108,99,255,0.18) 0%, rgba(168,85,247,0.12) 50%, rgba(236,72,153,0.08) 100%)",
            border: "1px solid rgba(108,99,255,0.3)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="ai-pulse"
              style={{
                width: 42, height: 42, borderRadius: 12,
                background: "linear-gradient(135deg, #6c63ff, #a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
              }}
            >
              🤖
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                AI is managing your content empire
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {DASHBOARD_STATS.scheduledPosts} posts scheduled · {DASHBOARD_STATS.contentDaysRemaining} days of content ready · 3 platforms active · Publishing every day automatically
              </div>
            </div>
          </div>
          <Link href="/strategy" className="btn btn-outline btn-sm" style={{ textDecoration: "none", flexShrink: 0 }}>
            View Strategy →
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          <StatCard
            label="Total Content"
            value={DASHBOARD_STATS.totalContent}
            sub={`${DASHBOARD_STATS.scheduledPosts} scheduled`}
            change={8}
            icon="📦"
            accent="#6c63ff"
          />
          <StatCard
            label="Total Views"
            value={formatNumber(DASHBOARD_STATS.totalViews)}
            sub="across all platforms"
            change={24}
            icon="👁"
            accent="#3b82f6"
          />
          <StatCard
            label="Total Followers"
            value={formatNumber(DASHBOARD_STATS.totalFollowers)}
            sub={`+${formatNumber(DASHBOARD_STATS.followersGainedThisMonth)} this month`}
            change={DASHBOARD_STATS.weeklyGrowthPct}
            icon="👥"
            accent="#10b981"
          />
          <StatCard
            label="Est. Revenue"
            value={formatCurrency(DASHBOARD_STATS.estimatedMonthlyRevenue)}
            sub="this month"
            change={18}
            icon="💰"
            accent="#f59e0b"
          />
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 340px" }}>

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Content runway */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Content Runway</h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>How long your scheduled content will last</p>
                </div>
                <Link href="/calendar" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>View Calendar →</Link>
              </div>

              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                {[
                  { platform: "Instagram", days: 94, posts: 94, color: "#e1306c" },
                  { platform: "Facebook", days: 72, posts: 72, color: "#1877f2" },
                  { platform: "YouTube",  days: 48, posts: 48, color: "#ff0000" },
                ].map((p) => (
                  <div key={p.platform} className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)" }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: p.color, lineHeight: 1 }}>{p.days}</div>
                    <div className="text-xs font-semibold mt-1" style={{ color: "var(--text-secondary)" }}>days</div>
                    <div className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{p.platform}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{p.posts} posts queued</div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex justify-between mb-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>Overall runway</span>
                  <span style={{ color: "var(--success)", fontWeight: 600 }}>82 days — Great!</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "82%" }} />
                </div>
              </div>
            </div>

            {/* Upcoming posts */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Upcoming Posts</h2>
                <Link href="/calendar" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>See all →</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {upcomingPosts.map((post) => {
                  const meta = PLATFORM_META[post.platform];
                  const d = new Date(post.scheduledAt);
                  return (
                    <div
                      key={post.id}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                    >
                      <div
                        className={`bg-gradient-to-br ${post.thumbnailGradient} rounded-lg flex-shrink-0`}
                        style={{ width: 44, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <span style={{ fontSize: 16, color: "white" }}>▶</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                          {post.contentTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`platform-icon ${meta.cssClass}`} style={{ width: 16, height: 16, fontSize: 8, borderRadius: 3 }}>
                            {meta.abbr}
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{meta.label}</span>
                        </div>
                      </div>
                      <div className="text-right" style={{ flexShrink: 0 }}>
                        <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                          {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top performing content */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Top Performing Content</h2>
                <Link href="/analytics" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>Analytics →</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {topContent.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "var(--surface-2)" }}>
                    <span className="font-black text-sm w-5 text-center" style={{ color: "var(--text-muted)" }}>
                      {i + 1}
                    </span>
                    <div className={`bg-gradient-to-br ${item.thumbnailGradient} rounded-md flex-shrink-0`}
                      style={{ width: 36, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 13, color: "white" }}>▶</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                      <div className="flex gap-2 mt-0.5">
                        {item.platforms.slice(0, 2).map(p => (
                          <span key={p} className={`platform-icon ${PLATFORM_META[p].cssClass}`} style={{ width: 14, height: 14, fontSize: 7, borderRadius: 2 }}>
                            {PLATFORM_META[p].abbr}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right" style={{ flexShrink: 0 }}>
                      <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{formatNumber(item.views ?? 0)}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>views</div>
                    </div>
                    <div
                      className={`score-ring ${item.viralScore >= 75 ? "score-high" : "score-med"}`}
                      style={{ width: 30, height: 30, fontSize: 10, flexShrink: 0 }}
                    >
                      {item.viralScore}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Quick stats */}
            <div className="card p-5">
              <h2 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Quick Stats</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Avg Viral Score", value: `${DASHBOARD_STATS.avgViralScore}/100`, color: "#6c63ff" },
                  { label: "Avg Engagement Rate", value: `${DASHBOARD_STATS.avgEngagementRate}%`, color: "#10b981" },
                  { label: "Posts This Week", value: DASHBOARD_STATS.postsThisWeek, color: "#3b82f6" },
                  { label: "Draft Content", value: DASHBOARD_STATS.draftPosts, color: "var(--text-muted)" },
                  { label: "Top Platform", value: DASHBOARD_STATS.topPerformingPlatform, color: "#e1306c" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.label}</span>
                    <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>AI Recommendations</h2>
                <Link href="/strategy" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>All →</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {AI_RECOMMENDATIONS.slice(0, 4).map(rec => (
                  <AIRecommendationCard key={rec.id} rec={rec} compact onAction={() => {}} />
                ))}
              </div>
            </div>

            {/* Platform health */}
            <div className="card p-5">
              <h2 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Platform Health</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { platform: "Instagram", followers: "12.4K", growth: "+8.2%", color: "#e1306c", class: "p-ig", abbr: "IG" },
                  { platform: "Facebook", followers: "6.8K", growth: "+3.1%", color: "#1877f2", class: "p-fb", abbr: "FB" },
                  { platform: "YouTube", followers: "3.2K", growth: "+14.7%", color: "#ff0000", class: "p-yt", abbr: "YT" },
                ].map(p => (
                  <div key={p.platform} className="flex items-center gap-3">
                    <span className={`platform-icon ${p.class}`}>{p.abbr}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{p.platform}</span>
                        <span className="text-xs" style={{ color: "var(--success)", fontWeight: 700 }}>{p.growth}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: "60%", background: p.color }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold" style={{ color: "var(--text-primary)", minWidth: 40, textAlign: "right" }}>
                      {p.followers}
                    </span>
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
