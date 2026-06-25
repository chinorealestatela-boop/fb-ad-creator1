"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { supabase } from "../../lib/supabase";
import { formatNumber } from "../../lib/utils";
import { DASHBOARD_STATS, PLATFORM_CONNECTIONS, SAMPLE_ANALYTICS, SAMPLE_CONTENT } from "../../lib/data";

type PlatformData = {
  connected: boolean;
  username?: string;
  displayName?: string;
  followers?: number;
  posts?: number;
  subscribers?: number;
  totalViews?: number;
  videoCount?: number;
  likes?: number;
  videos?: number;
  recentMedia?: Array<{
    id: string;
    caption?: string;
    media_type?: string;
    timestamp?: string;
    like_count?: number;
    comments_count?: number;
    media_url?: string;
    thumbnail_url?: string;
  }>;
};

type Analytics = {
  instagram?: PlatformData;
  facebook?: PlatformData;
  youtube?: PlatformData;
  tiktok?: PlatformData;
};

const PLATFORM_STYLE: Record<string, { label: string; icon: string; color: string }> = {
  instagram: { label: "Instagram",  icon: "📸", color: "#e1306c" },
  facebook:  { label: "Facebook",   icon: "👥", color: "#1877f2" },
  youtube:   { label: "YouTube",    icon: "▶️", color: "#ff0000" },
  tiktok:    { label: "TikTok",     icon: "🎵", color: "#69c9d0" },
};

const DEMO_ANALYTICS: Analytics = {
  instagram: {
    connected: true,
    username: "chinorealestatela",
    displayName: "Chino Real Estate LA",
    followers: 42800,
    posts: 289,
  },
  facebook: {
    connected: true,
    username: "Chino Real Estate LA",
    followers: 8200,
  },
  youtube: {
    connected: true,
    username: "chinorealestatela",
    displayName: "Chino Real Estate LA",
    subscribers: 28500,
    totalViews: 9480000,
    videoCount: 312,
  },
  tiktok: {
    connected: true,
    username: "chinorealestatela",
    followers: 6300,
    likes: 847000,
    videos: 198,
  },
};

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text-primary)" }}>
        {typeof value === "number" ? formatNumber(value) : value}
      </div>
    </div>
  );
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function MiniChart({ data }: { data: { date: string; views: number }[] }) {
  const last30 = data.slice(-30);
  const maxViews = Math.max(...last30.map(d => d.views));
  const barWidth = 100 / last30.length;

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 60, padding: "0 4px" }}>
      {last30.map((d, i) => {
        const h = maxViews > 0 ? (d.views / maxViews) * 100 : 0;
        const isSpike = d.views > maxViews * 0.7;
        return (
          <div
            key={i}
            title={`${d.date}: ${formatNumber(d.views)} views`}
            style={{
              flex: 1,
              height: `${Math.max(h, 4)}%`,
              background: isSpike
                ? "linear-gradient(180deg,#f59e0b,#f97316)"
                : "linear-gradient(180deg,#6c63ff,#ec4899)",
              borderRadius: 2,
              opacity: 0.85,
              transition: "height 0.3s",
            }}
          />
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics>({});
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      try {
        const res = await fetch(`/api/analytics?userId=${user.id}`);
        const data = await res.json();
        const hasReal = Object.values(data).some((d: any) => d?.connected);
        if (hasReal) {
          setAnalytics(data);
          setIsDemo(false);
        } else {
          setAnalytics(DEMO_ANALYTICS);
          setIsDemo(true);
        }
      } catch {
        setAnalytics(DEMO_ANALYTICS);
        setIsDemo(true);
      }
      setLoading(false);
    });
  }, []);

  const connectedPlatforms = Object.entries(analytics).filter(([, d]) => d?.connected);
  const totalFollowers = (analytics.instagram?.followers ?? 0)
    + (analytics.facebook?.followers ?? 0)
    + (analytics.youtube?.subscribers ?? 0)
    + (analytics.tiktok?.followers ?? 0);

  if (loading) {
    return (
      <>
        <Header title="Analytics" subtitle="Real data from your connected platforms" />
        <div className="page-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
          <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
            <div>Loading your analytics...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Analytics" subtitle="Live data pulled directly from your connected platforms" />
      <div className="page-body fade-in">

        {/* Demo mode banner */}
        {isDemo && (
          <div className="card p-4 mb-6 flex items-center gap-3" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
            <span style={{ fontSize: 20 }}>✨</span>
            <div style={{ flex: 1 }}>
              <div className="font-semibold text-sm" style={{ color: "#f59e0b" }}>Demo Preview — Connect platforms to see your real data</div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Showing sample analytics for a real estate content creator. <a href="/platforms" style={{ color: "#f59e0b", textDecoration: "underline" }}>Connect Instagram, YouTube, or TikTok →</a>
              </div>
            </div>
          </div>
        )}

        {/* Summary KPIs */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          <div className="card p-5">
            <div className="text-xs uppercase font-semibold mb-2" style={{ color: "var(--text-muted)", letterSpacing: "0.07em" }}>Total Followers</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)" }}>{formatNumber(isDemo ? DASHBOARD_STATS.totalFollowers : totalFollowers)}</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Across {connectedPlatforms.length} platforms</div>
          </div>
          <div className="card p-5">
            <div className="text-xs uppercase font-semibold mb-2" style={{ color: "var(--text-muted)", letterSpacing: "0.07em" }}>YouTube Views</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)" }}>
              {analytics.youtube ? formatNumber(analytics.youtube.totalViews ?? 0) : "—"}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{analytics.youtube ? "Total channel views" : "YouTube not connected"}</div>
          </div>
          <div className="card p-5">
            <div className="text-xs uppercase font-semibold mb-2" style={{ color: "var(--text-muted)", letterSpacing: "0.07em" }}>IG Posts</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)" }}>
              {analytics.instagram ? formatNumber(analytics.instagram.posts ?? 0) : "—"}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{analytics.instagram ? "Published posts" : "Instagram not connected"}</div>
          </div>
          <div className="card p-5">
            <div className="text-xs uppercase font-semibold mb-2" style={{ color: "var(--text-muted)", letterSpacing: "0.07em" }}>TikTok Likes</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)" }}>
              {analytics.tiktok ? formatNumber(analytics.tiktok.likes ?? 0) : "—"}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{analytics.tiktok ? "Total likes" : "TikTok not connected"}</div>
          </div>
        </div>

        {/* Views over time chart */}
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

        {/* Per-platform cards */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
          {connectedPlatforms.map(([platform, data]) => {
            const style = PLATFORM_STYLE[platform];
            if (!style || !data) return null;

            const stats: Array<{ label: string; value: string | number }> = [];
            if (platform === "instagram") {
              stats.push(
                { label: "Followers", value: data.followers ?? 0 },
                { label: "Posts",     value: data.posts ?? 0 },
              );
            }
            if (platform === "facebook") {
              stats.push({ label: "Page Likes / Followers", value: data.followers ?? 0 });
            }
            if (platform === "youtube") {
              stats.push(
                { label: "Subscribers", value: data.subscribers ?? 0 },
                { label: "Total Views", value: data.totalViews ?? 0 },
                { label: "Videos",      value: data.videoCount ?? 0 },
              );
            }
            if (platform === "tiktok") {
              stats.push(
                { label: "Followers",   value: data.followers ?? 0 },
                { label: "Total Likes", value: data.likes ?? 0 },
                { label: "Videos",      value: data.videos ?? 0 },
              );
            }

            return (
              <div key={platform} className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: style.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {style.icon}
                  </div>
                  <div>
                    <div className="font-bold" style={{ color: "var(--text-primary)" }}>{style.label}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {data.username ? `@${data.username}` : data.displayName || "Connected"}
                    </div>
                  </div>
                  <span className="badge badge-green ml-auto">{isDemo ? "Demo" : "Live"}</span>
                </div>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 3)},1fr)` }}>
                  {stats.map(s => <StatBox key={s.label} label={s.label} value={s.value} />)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Top content performance */}
        <div className="card p-5 mb-6">
          <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            🏆 Top Performing Content
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SAMPLE_CONTENT.filter(c => c.status === "published").slice(0, 5).map((item, idx) => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: idx === 0 ? "#f59e0b" : idx === 1 ? "#94a3b8" : idx === 2 ? "#cd7f32" : "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: idx < 3 ? "#000" : "var(--text-muted)", flexShrink: 0 }}>
                  #{idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {item.platforms.map(p => PLATFORM_STYLE[p]?.icon ?? "📱").join(" ")} · {item.category}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{formatNumber(item.views ?? 0)}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>views</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, minWidth: 48 }}>
                  <div className="text-sm font-bold" style={{ color: (item.viralScore ?? 0) >= 90 ? "#f59e0b" : "var(--text-muted)" }}>
                    {item.viralScore}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>viral</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connect more platforms nudge */}
        {isDemo && (
          <div className="card p-5" style={{ background: "rgba(108,99,255,0.05)", border: "1px solid rgba(108,99,255,0.2)", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 12 }}>
              Connect your real social accounts to replace this demo data with your live analytics.
            </p>
            <a href="/platforms" className="btn btn-gradient" style={{ textDecoration: "none", display: "inline-flex" }}>
              Connect Platforms →
            </a>
          </div>
        )}
        {!isDemo && connectedPlatforms.length < 4 && (
          <div className="card p-5" style={{ background: "rgba(108,99,255,0.05)", border: "1px solid rgba(108,99,255,0.2)", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 12 }}>
              Connect more platforms to see all your analytics in one place.
            </p>
            <a href="/platforms" className="btn btn-outline btn-sm" style={{ textDecoration: "none", display: "inline-flex" }}>
              Manage Platforms →
            </a>
          </div>
        )}
      </div>
    </>
  );
}
