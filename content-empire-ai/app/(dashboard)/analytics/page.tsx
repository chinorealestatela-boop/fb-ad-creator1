"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { supabase } from "../../lib/supabase";
import { formatNumber } from "../../lib/utils";

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

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const res = await fetch(`/api/analytics?userId=${user.id}`);
      const data = await res.json();
      setAnalytics(data);
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

  if (connectedPlatforms.length === 0) {
    return (
      <>
        <Header title="Analytics" subtitle="Real data from your connected platforms" />
        <div className="page-body fade-in">
          <div className="card p-10" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>
              No platforms connected yet
            </h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 14 }}>
              Connect Instagram, Facebook, YouTube, or TikTok to see your real analytics here.
            </p>
            <a href="/platforms" className="btn btn-gradient" style={{ display: "inline-flex", textDecoration: "none" }}>
              Connect Platforms →
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Analytics" subtitle="Live data pulled directly from your connected platforms" />
      <div className="page-body fade-in">

        {/* Summary KPIs */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          <div className="card p-5">
            <div className="text-xs uppercase font-semibold mb-2" style={{ color: "var(--text-muted)", letterSpacing: "0.07em" }}>Total Followers</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)" }}>{formatNumber(totalFollowers)}</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Across {connectedPlatforms.length} platform{connectedPlatforms.length !== 1 ? "s" : ""}</div>
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

        {/* Per-platform cards */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
          {connectedPlatforms.map(([platform, data]) => {
            const style = PLATFORM_STYLE[platform];
            if (!style || !data) return null;

            const stats: Array<{ label: string; value: string | number }> = [];
            if (platform === "instagram") {
              stats.push(
                { label: "Followers", value: data.followers ?? 0 },
                { label: "Posts", value: data.posts ?? 0 },
              );
            }
            if (platform === "facebook") {
              stats.push({ label: "Page Likes / Followers", value: data.followers ?? 0 });
            }
            if (platform === "youtube") {
              stats.push(
                { label: "Subscribers", value: data.subscribers ?? 0 },
                { label: "Total Views", value: data.totalViews ?? 0 },
                { label: "Videos", value: data.videoCount ?? 0 },
              );
            }
            if (platform === "tiktok") {
              stats.push(
                { label: "Followers", value: data.followers ?? 0 },
                { label: "Total Likes", value: data.likes ?? 0 },
                { label: "Videos", value: data.videos ?? 0 },
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
                  <span className="badge badge-green ml-auto">Live</span>
                </div>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 3)},1fr)` }}>
                  {stats.map(s => <StatBox key={s.label} label={s.label} value={s.value} />)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Instagram recent media */}
        {analytics.instagram?.recentMedia && analytics.instagram.recentMedia.length > 0 && (
          <div className="card p-5 mb-6">
            <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              📸 Recent Instagram Posts
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
              {analytics.instagram.recentMedia.slice(0, 6).map(item => (
                <div key={item.id} style={{ borderRadius: 10, overflow: "hidden", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  {(item.media_url || item.thumbnail_url) ? (
                    <img
                      src={item.media_url || item.thumbnail_url}
                      alt={item.caption?.slice(0, 40) || "Post"}
                      style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <div style={{ width: "100%", aspectRatio: "1", background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>📷</div>
                  )}
                  <div style={{ padding: "8px 10px" }}>
                    <p className="text-xs truncate" style={{ color: "var(--text-secondary)", marginBottom: 4 }}>
                      {item.caption?.slice(0, 60) || "(no caption)"}
                    </p>
                    <div className="flex gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span>❤ {formatNumber(item.like_count ?? 0)}</span>
                      <span>💬 {formatNumber(item.comments_count ?? 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connect more platforms nudge */}
        {connectedPlatforms.length < 4 && (
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
