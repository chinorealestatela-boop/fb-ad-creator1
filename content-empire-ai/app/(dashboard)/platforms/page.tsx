"use client";
import { useState, useEffect, useCallback } from "react";
import Header from "../../components/Header";
import { supabase } from "../../lib/supabase";

const PLATFORMS = [
  {
    id: "facebook",
    name: "Facebook & Instagram",
    icons: ["👥", "📸"],
    color: "#1877f2",
    description: "One click connects your Facebook Page AND your linked Instagram Business account.",
  },
  {
    id: "youtube",
    name: "YouTube",
    icons: ["▶️"],
    color: "#ff0000",
    description: "Connect your YouTube channel to track subscribers and video performance.",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icons: ["🎵"],
    color: "linear-gradient(135deg,#010101,#69c9d0)",
    description: "Connect your TikTok account to track followers and video stats.",
  },
];

const COMING_SOON = [
  { id: "linkedin",  name: "LinkedIn",  icon: "💼" },
  { id: "twitter",   name: "Twitter/X", icon: "🐦" },
  { id: "pinterest", name: "Pinterest", icon: "📌" },
  { id: "threads",   name: "Threads",   icon: "🧵" },
];

type ConnectedPlatform = {
  platform: string;
  platform_username: string;
  platform_display_name: string;
};

export default function PlatformsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [connected, setConnected] = useState<ConnectedPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  }

  const loadConnected = useCallback(async (uid: string) => {
    const res = await fetch(`/api/platforms/connected?userId=${uid}`);
    const data = await res.json();
    setConnected(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      loadConnected(user.id);

      const params = new URLSearchParams(window.location.search);
      const conn = params.get("connected");
      const err = params.get("error");
      if (conn) showToast(`✓ ${conn} connected successfully!`);
      if (err) showToast(`Connection failed: ${err.replace(/_/g, " ")}`, "error");
      if (conn || err) window.history.replaceState({}, "", "/platforms");
    });
  }, [loadConnected]);

  async function connect(platformId: string) {
    if (!userId) return;
    setConnecting(platformId);
    try {
      const res = await fetch(`/api/auth/${platformId}/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const { redirectUrl } = await res.json();
      if (!redirectUrl) throw new Error("No redirect URL returned");
      window.location.href = redirectUrl;
    } catch {
      showToast("Failed to start connection. Try again.", "error");
      setConnecting(null);
    }
  }

  async function disconnect(platformId: string) {
    if (!userId) return;
    setDisconnecting(platformId);
    await fetch(`/api/platforms/connected?userId=${userId}&platform=${platformId}`, { method: "DELETE" });
    // If disconnecting facebook, also remove instagram (they share one OAuth flow)
    if (platformId === "facebook") {
      await fetch(`/api/platforms/connected?userId=${userId}&platform=instagram`, { method: "DELETE" });
      setConnected(c => c.filter(x => x.platform !== "instagram"));
    }
    setConnected(c => c.filter(x => x.platform !== platformId));
    setDisconnecting(null);
    showToast(`Disconnected.`);
  }

  function getConn(id: string) {
    return connected.find(c => c.platform === id);
  }

  return (
    <>
      <Header title="Platforms" subtitle="Connect your real social media accounts" />

      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
          border: `1px solid ${toast.type === "success" ? "#10b981" : "#ef4444"}`,
          color: toast.type === "success" ? "#10b981" : "#ef4444",
          padding: "12px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14,
          backdropFilter: "blur(8px)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}>
          {toast.msg}
        </div>
      )}

      <div className="page-body fade-in">

        {/* How it works banner */}
        <div className="card p-5 mb-6" style={{ background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.2)" }}>
          <div className="flex items-center gap-3 mb-2">
            <span style={{ fontSize: 20 }}>🔐</span>
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>Secure OAuth — we never see your password</span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Click Connect → you're redirected to the official platform → you approve access → you're brought back here.
            We store only your access token to fetch analytics. You can disconnect anytime.
          </p>
        </div>

        {/* Phase 1 */}
        <div className="mb-8">
          <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)", fontSize: 16 }}>
            Connect Now
            <span className="badge badge-green ml-2" style={{ fontSize: 11 }}>Phase 1</span>
          </h3>

          {loading ? (
            <div className="card p-10" style={{ textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PLATFORMS.map(pl => {
                const conn = getConn(pl.id);
                const igConn = pl.id === "facebook" ? getConn("instagram") : null;
                const isConnecting = connecting === pl.id;
                const isDisconnecting = disconnecting === pl.id;

                return (
                  <div key={pl.id} className="card p-5">
                    <div className="flex items-center gap-4">
                      <div style={{
                        width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                        background: pl.color, display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 4, fontSize: 24,
                      }}>
                        {pl.icons.map(i => <span key={i}>{i}</span>)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="font-semibold" style={{ color: "var(--text-primary)", fontSize: 15 }}>
                          {pl.name}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {pl.description}
                        </div>
                        {conn && (
                          <div className="text-xs mt-1.5 font-semibold" style={{ color: "#10b981" }}>
                            ✓ {conn.platform_display_name || conn.platform_username}
                            {igConn ? ` · @${igConn.platform_username} on Instagram` : ""}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {conn && <span className="badge badge-green">Connected</span>}
                        {conn ? (
                          <button
                            className="btn btn-sm"
                            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}
                            onClick={() => disconnect(pl.id)}
                            disabled={isDisconnecting}
                          >
                            {isDisconnecting ? "..." : "Disconnect"}
                          </button>
                        ) : (
                          <button
                            className="btn btn-gradient btn-sm"
                            onClick={() => connect(pl.id)}
                            disabled={!!connecting}
                            style={{ whiteSpace: "nowrap" }}
                          >
                            {isConnecting ? "Redirecting..." : `Connect ${pl.icons[0]}`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Phase 2 */}
        <div>
          <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)", fontSize: 16 }}>
            Coming Soon
            <span className="badge badge-gray ml-2" style={{ fontSize: 11 }}>Phase 2</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {COMING_SOON.map(pl => (
              <div key={pl.id} className="card p-5 flex items-center gap-4" style={{ opacity: 0.45 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                  {pl.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{pl.name}</div>
                  <div className="text-sm" style={{ color: "var(--text-muted)" }}>Coming in Phase 2</div>
                </div>
                <span className="badge badge-gray">Soon</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
