"use client";
import { useState } from "react";
import {
  DASHBOARD_STATS, PLATFORM_CONNECTIONS, SAMPLE_CONTENT,
  AI_RECOMMENDATIONS, SAMPLE_ANALYTICS, SAMPLE_SCHEDULED_POSTS,
} from "../lib/data";
import { formatNumber } from "../lib/utils";

const PLATFORM_ICONS: Record<string, string>  = { instagram: "📸", facebook: "👥", youtube: "▶️", tiktok: "🎵" };
const PLATFORM_COLORS: Record<string, string> = { instagram: "#e1306c", facebook: "#1877f2", youtube: "#ff0000", tiktok: "#69c9d0" };
const PLATFORM_LABEL: Record<string, string>  = { instagram: "Instagram", facebook: "Facebook", youtube: "YouTube", tiktok: "TikTok" };
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",  icon: "🏠" },
  { id: "content",   label: "Content",    icon: "🎬" },
  { id: "analytics", label: "Analytics",  icon: "📊" },
  { id: "schedule",  label: "Scheduled",  icon: "📅" },
  { id: "ai",        label: "AI Insights",icon: "✦"  },
];

function MiniChart({ data }: { data: { date: string; views: number }[] }) {
  const last30 = data.slice(-30);
  const maxV = Math.max(...last30.map(d => d.views));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 72, padding: "0 4px" }}>
      {last30.map((d, i) => {
        const h = maxV > 0 ? (d.views / maxV) * 100 : 4;
        const spike = d.views > maxV * 0.7;
        return (
          <div key={i} title={`${d.date}: ${formatNumber(d.views)} views`}
            style={{ flex: 1, height: `${Math.max(h, 4)}%`, borderRadius: 2, opacity: 0.85,
              background: spike ? "linear-gradient(180deg,#f59e0b,#f97316)" : "linear-gradient(180deg,#6c63ff,#ec4899)" }} />
        );
      })}
    </div>
  );
}

function DashboardTab() {
  const connected = PLATFORM_CONNECTIONS.filter(p => p.connected);
  const recent = SAMPLE_CONTENT.filter(c => c.status === "published").slice(0, 3);
  const topRecs = AI_RECOMMENDATIONS.filter(r => r.priority === "high").slice(0, 2);
  return (
    <div>
      <div className="card p-6 mb-6" style={{ background: "linear-gradient(135deg,rgba(108,99,255,0.15),rgba(236,72,153,0.08))", border: "1px solid rgba(108,99,255,0.25)" }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", marginBottom: 4 }}>Welcome back, Chino! 👑</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Your empire grew <strong style={{ color: "#10b981" }}>+{DASHBOARD_STATS.weeklyGrowthPct}%</strong> this week. You&apos;re on track to hit 100K followers next month.
        </p>
      </div>
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { label: "Total Followers", value: formatNumber(DASHBOARD_STATS.totalFollowers), sub: `+${formatNumber(DASHBOARD_STATS.followersGainedThisMonth)} this month`, green: true },
          { label: "Total Views",     value: formatNumber(DASHBOARD_STATS.totalViews),     sub: `Across ${connected.length} platforms` },
          { label: "Est. Revenue",    value: "$" + DASHBOARD_STATS.estimatedMonthlyRevenue.toLocaleString(), sub: "This month", green: true },
          { label: "Content Pieces",  value: String(DASHBOARD_STATS.totalContent), sub: `${DASHBOARD_STATS.scheduledPosts} scheduled · ${DASHBOARD_STATS.draftPosts} drafts` },
        ].map(k => (
          <div key={k.label} className="card p-5">
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", marginBottom: 4 }}>{k.value}</div>
            <div className="text-xs" style={{ color: k.green ? "#10b981" : "var(--text-muted)" }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Connected Platforms</h3>
            <span className="badge badge-green" style={{ fontSize: 11 }}>All Live</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {connected.map(p => (
              <div key={p.platform} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: PLATFORM_COLORS[p.platform] ?? "#6c63ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {PLATFORM_ICONS[p.platform]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{PLATFORM_LABEL[p.platform] ?? p.platform}</div>
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
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>AI Insights</h3>
            <span className="badge badge-red" style={{ fontSize: 11 }}>2 Hot</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topRecs.map(rec => (
              <div key={rec.id} className="p-4 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: 18 }}>{rec.icon}</span>
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{rec.title}</span>
                  <span className="badge badge-red ml-auto" style={{ fontSize: 10 }}>Hot</span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{rec.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Recent Content</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recent.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg,#6c63ff,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                {item.type === "reel" ? "🎬" : "▶️"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-sm font-semibold" style={{ color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{formatNumber(item.views ?? 0)} views · {formatNumber(item.likes ?? 0)} likes</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div className="text-xs font-bold" style={{ color: (item.viralScore ?? 0) >= 90 ? "#f59e0b" : "var(--text-muted)" }}>
                  {(item.viralScore ?? 0) >= 90 ? "🔥 " : ""}{item.viralScore}/100
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>viral score</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { label: "Avg Engagement",  value: `${DASHBOARD_STATS.avgEngagementRate}%`,  sub: "Above industry avg" },
          { label: "Avg Viral Score", value: `${DASHBOARD_STATS.avgViralScore}/100`,   sub: "Excellent"          },
          { label: "Posts This Week", value: String(DASHBOARD_STATS.postsThisWeek),    sub: "Posting streak 🔥"   },
          { label: "Top Platform",    value: DASHBOARD_STATS.topPerformingPlatform,    sub: "Highest reach"       },
        ].map(k => (
          <div key={k.label} className="card p-5">
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", marginBottom: 4 }}>{k.value}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>{k.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentTab() {
  const published = SAMPLE_CONTENT.filter(c => c.status === "published");
  return (
    <div>
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        {[
          { label: "Published", value: DASHBOARD_STATS.publishedPosts, color: "#10b981" },
          { label: "Scheduled", value: DASHBOARD_STATS.scheduledPosts, color: "#6c63ff" },
          { label: "Drafts",    value: DASHBOARD_STATS.draftPosts,     color: "var(--text-muted)" },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {published.map((item, idx) => (
          <div key={item.id} className="card p-5 flex items-center gap-4">
            <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, background: "linear-gradient(135deg,#6c63ff,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
              {item.type === "reel" ? "🎬" : item.type === "video" ? "▶️" : "📸"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="font-bold" style={{ color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {item.platforms.map(p => PLATFORM_ICONS[p] ?? "📱").join(" ")} · {item.category}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {formatNumber(item.views ?? 0)} views · {formatNumber(item.likes ?? 0)} likes · {formatNumber(item.comments ?? 0)} comments
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: (item.viralScore ?? 0) >= 90 ? "#f59e0b" : "var(--text-primary)" }}>
                {item.viralScore}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>viral score</div>
            </div>
            <span className={`badge ${(item.viralScore ?? 0) >= 90 ? "badge-yellow" : "badge-green"}`} style={{ flexShrink: 0 }}>
              {(item.viralScore ?? 0) >= 90 ? "🔥 Viral" : "Live"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const connected = PLATFORM_CONNECTIONS.filter(p => p.connected);
  const topContent = SAMPLE_CONTENT.filter(c => c.status === "published").slice(0, 5);
  return (
    <div>
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { label: "Total Followers", value: formatNumber(DASHBOARD_STATS.totalFollowers), sub: `+${formatNumber(DASHBOARD_STATS.followersGainedThisMonth)} this month` },
          { label: "YouTube Views",   value: formatNumber(9480000),  sub: "Total channel views" },
          { label: "IG Posts",        value: "289",                  sub: "Published posts"      },
          { label: "TikTok Likes",    value: formatNumber(847000),   sub: "Total likes"          },
        ].map(k => (
          <div key={k.label} className="card p-5">
            <div className="text-xs uppercase font-semibold mb-2" style={{ color: "var(--text-muted)", letterSpacing: "0.07em" }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)" }}>{k.value}</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Views — Last 30 Days</h3>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            Total: {formatNumber(SAMPLE_ANALYTICS.slice(-30).reduce((s, d) => s + d.views, 0))} views
          </div>
        </div>
        <MiniChart data={SAMPLE_ANALYTICS} />
        <div className="flex justify-between text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          <span>{SAMPLE_ANALYTICS[SAMPLE_ANALYTICS.length - 30]?.date?.slice(5)}</span>
          <span>{SAMPLE_ANALYTICS[SAMPLE_ANALYTICS.length - 1]?.date?.slice(5)}</span>
        </div>
      </div>
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
        {[
          { platform: "instagram", username: "chinorealestatela", followers: 42800, posts: 289 },
          { platform: "facebook",  username: "Chino Real Estate LA", followers: 8200 },
          { platform: "youtube",   username: "chinorealestatela", subscribers: 28500, totalViews: 9480000, videoCount: 312 },
          { platform: "tiktok",    username: "chinorealestatela", followers: 6300, likes: 847000, videos: 198 },
        ].map(p => {
          const style = { label: PLATFORM_LABEL[p.platform], icon: PLATFORM_ICONS[p.platform], color: PLATFORM_COLORS[p.platform] };
          const stats = p.platform === "instagram" ? [{ l: "Followers", v: p.followers }, { l: "Posts", v: p.posts }]
            : p.platform === "facebook" ? [{ l: "Page Likes", v: p.followers }]
            : p.platform === "youtube"  ? [{ l: "Subscribers", v: p.subscribers }, { l: "Total Views", v: p.totalViews }, { l: "Videos", v: p.videoCount }]
            : [{ l: "Followers", v: p.followers }, { l: "Total Likes", v: p.likes }, { l: "Videos", v: p.videos }];
          return (
            <div key={p.platform} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div style={{ width: 40, height: 40, borderRadius: 10, background: style.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{style.icon}</div>
                <div>
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>{style.label}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>@{p.username}</div>
                </div>
                <span className="badge badge-green ml-auto">Live</span>
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 3)},1fr)` }}>
                {stats.map(s => (
                  <div key={s.l}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>{s.l}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text-primary)" }}>{formatNumber(s.v ?? 0)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="card p-5">
        <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>🏆 Top Performing Content</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {topContent.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: idx === 0 ? "#f59e0b" : idx === 1 ? "#94a3b8" : idx === 2 ? "#cd7f32" : "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: idx < 3 ? "#000" : "var(--text-muted)", flexShrink: 0 }}>
                #{idx + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-sm font-semibold" style={{ color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{item.platforms.map(p => PLATFORM_ICONS[p] ?? "📱").join(" ")} · {item.category}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{formatNumber(item.views ?? 0)}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>views</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScheduleTab() {
  return (
    <div>
      <div className="card p-5 mb-4" style={{ background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.2)" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 20 }}>📅</span>
          <div>
            <div className="font-bold" style={{ color: "var(--text-primary)" }}>{DASHBOARD_STATS.scheduledPosts} posts scheduled</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Best posting windows: Tue & Thu 9–11am</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SAMPLE_SCHEDULED_POSTS.map(post => (
          <div key={post.id} className="card p-5 flex items-center gap-4">
            <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg,#6c63ff,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              🎬
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="font-semibold text-sm" style={{ color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.contentTitle}</div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {PLATFORM_ICONS[post.platform]} {PLATFORM_LABEL[post.platform]} · {new Date(post.scheduledAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </div>
            </div>
            <span className="badge badge-gray" style={{ flexShrink: 0 }}>Scheduled</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AITab() {
  return (
    <div>
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        {[
          { label: "Avg Viral Score",  value: `${DASHBOARD_STATS.avgViralScore}/100`, sub: "Excellent performance" },
          { label: "Engagement Rate",  value: `${DASHBOARD_STATS.avgEngagementRate}%`, sub: "2.1x above average"  },
          { label: "Weekly Growth",    value: `+${DASHBOARD_STATS.weeklyGrowthPct}%`,  sub: "Follower growth rate" },
        ].map(k => (
          <div key={k.label} className="card p-5">
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", marginBottom: 4 }}>{k.value}</div>
            <div className="text-xs" style={{ color: "#10b981" }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {AI_RECOMMENDATIONS.map(rec => (
          <div key={rec.id} className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <span style={{ fontSize: 24 }}>{rec.icon}</span>
              <div style={{ flex: 1 }}>
                <div className="font-bold" style={{ color: "var(--text-primary)" }}>{rec.title}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>{rec.type}</div>
              </div>
              <span className={`badge ${rec.priority === "high" ? "badge-red" : rec.priority === "medium" ? "badge-yellow" : "badge-gray"}`}>
                {rec.priority}
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{rec.message}</p>
            <button className="btn btn-gradient btn-sm mt-3" style={{ fontSize: 12 }}>{rec.action}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const TAB_CONTENT: Record<string, () => JSX.Element> = {
  dashboard: DashboardTab,
  content:   ContentTab,
  analytics: AnalyticsTab,
  schedule:  ScheduleTab,
  ai:        AITab,
};

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard",  subtitle: "Your content empire command center"          },
  content:   { title: "Content",    subtitle: "All your published, scheduled & draft posts" },
  analytics: { title: "Analytics",  subtitle: "Live data across all platforms"              },
  schedule:  { title: "Scheduled",  subtitle: "Upcoming posts ready to publish"             },
  ai:        { title: "AI Insights",subtitle: "Smart recommendations to grow your empire"  },
};

export default function DemoPage() {
  const [tab, setTab] = useState("dashboard");
  const TabComp = TAB_CONTENT[tab] ?? DashboardTab;
  const { title, subtitle } = TAB_TITLES[tab] ?? TAB_TITLES.dashboard;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans, system-ui)" }}>

      {/* Sidebar */}
      <aside style={{ width: 240, flexShrink: 0, background: "var(--surface-1)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "24px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6c63ff,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👑</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 15, color: "var(--text-primary)" }}>Content Empire AI</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Demo Preview</div>
          </div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
                background: tab === item.id ? "rgba(108,99,255,0.15)" : "transparent",
                color: tab === item.id ? "#6c63ff" : "var(--text-secondary)",
                fontWeight: tab === item.id ? 700 : 500, fontSize: 14, width: "100%",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 17 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: "auto", padding: "16px 12px", background: "rgba(108,99,255,0.08)", borderRadius: 12, border: "1px solid rgba(108,99,255,0.2)" }}>
          <div className="text-xs font-bold" style={{ color: "#6c63ff", marginBottom: 4 }}>Demo Mode</div>
          <div className="text-xs" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
            Real estate content creator · 85.8K followers
          </div>
          <a href="/login" style={{ display: "block", marginTop: 10, textAlign: "center", padding: "6px 12px", background: "linear-gradient(135deg,#6c63ff,#ec4899)", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            Sign In →
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "24px 28px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface-1)" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)" }}>{title}</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{subtitle}</div>
        </div>
        <div style={{ padding: "24px 28px" }}>
          <TabComp />
        </div>
      </main>
    </div>
  );
}
