"use client";

import { useState } from "react";
import Header from "../../components/Header";
import { PLATFORM_CONNECTIONS } from "../../lib/data";
import { PLATFORM_META } from "../../lib/utils";
import type { Platform, PlatformConnection } from "../../lib/types";

export default function PlatformsPage() {
  const [connections, setConnections] = useState<PlatformConnection[]>(PLATFORM_CONNECTIONS);
  const [connecting, setConnecting] = useState<Platform | null>(null);

  function connect(platform: Platform) {
    setConnecting(platform);
    setTimeout(() => {
      setConnections(prev => prev.map(c =>
        c.platform === platform
          ? { ...c, connected: true, accountName: `@demo_${platform}`, followers: Math.floor(Math.random() * 10000 + 1000), lastSync: new Date().toISOString() }
          : c
      ));
      setConnecting(null);
    }, 2000);
  }

  function disconnect(platform: Platform) {
    setConnections(prev => prev.map(c =>
      c.platform === platform
        ? { platform, connected: false }
        : c
    ));
  }

  const connected = connections.filter(c => c.connected);
  const notConnected = connections.filter(c => !c.connected);

  const PLATFORM_PHASES: Record<Platform, string> = {
    instagram: "Phase 1",
    facebook: "Phase 1",
    youtube: "Phase 1",
    tiktok: "Phase 2",
    linkedin: "Phase 2",
    twitter: "Phase 2",
    pinterest: "Phase 2",
    threads: "Phase 3",
  };

  return (
    <>
      <Header
        title="Platforms"
        subtitle="Connect and manage your social media accounts"
      />
      <div className="page-body fade-in">

        {/* Summary */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
          <div className="stat-card">
            <div className="text-xs uppercase font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Connected</div>
            <div className="font-black" style={{ fontSize: 28, color: "#10b981" }}>{connected.length}</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>platforms active</div>
          </div>
          <div className="stat-card">
            <div className="text-xs uppercase font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Total Followers</div>
            <div className="font-black" style={{ fontSize: 28, color: "var(--accent-light)" }}>
              {(connected.reduce((a, c) => a + (c.followers ?? 0), 0) / 1000).toFixed(1)}K
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>across all accounts</div>
          </div>
          <div className="stat-card">
            <div className="text-xs uppercase font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Publishing To</div>
            <div className="font-black" style={{ fontSize: 28, color: "#f59e0b" }}>{connected.length}</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>platforms auto-publishing</div>
          </div>
        </div>

        {/* Connected */}
        {connected.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
              Connected Platforms
            </h3>
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))" }}>
              {connected.map(conn => {
                const meta = PLATFORM_META[conn.platform];
                const phase = PLATFORM_PHASES[conn.platform];
                return (
                  <div key={conn.platform} className="card card-hover p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`platform-icon ${meta.cssClass}`} style={{ width: 36, height: 36, fontSize: 14, borderRadius: 9 }}>
                          {meta.abbr}
                        </span>
                        <div>
                          <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{meta.label}</div>
                          <div className="text-xs" style={{ color: "var(--text-muted)" }}>{conn.accountName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                        <span className="text-xs" style={{ color: "#10b981", fontWeight: 600 }}>Connected</span>
                      </div>
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                      <div className="rounded-lg p-3 text-center" style={{ background: "var(--surface-2)" }}>
                        <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                          {((conn.followers ?? 0) / 1000).toFixed(1)}K
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Followers</div>
                      </div>
                      <div className="rounded-lg p-3 text-center" style={{ background: "var(--surface-2)" }}>
                        <div className="font-bold text-sm" style={{ color: "#10b981" }}>Active</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Publishing</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Last sync: {new Date(conn.lastSync ?? "").toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-xs">↻ Sync</button>
                        <button className="btn btn-xs" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}
                          onClick={() => disconnect(conn.platform)}>
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Not connected */}
        {notConnected.length > 0 && (
          <div>
            <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
              Available Platforms
            </h3>
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))" }}>
              {notConnected.map(conn => {
                const meta = PLATFORM_META[conn.platform];
                const phase = PLATFORM_PHASES[conn.platform];
                const isConnecting = connecting === conn.platform;
                const isPhase1 = phase === "Phase 1";
                return (
                  <div
                    key={conn.platform}
                    className="card p-5"
                    style={{ opacity: isPhase1 ? 1 : 0.7 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`platform-icon ${meta.cssClass}`} style={{ width: 36, height: 36, fontSize: 14, borderRadius: 9, opacity: isPhase1 ? 1 : 0.5 }}>
                          {meta.abbr}
                        </span>
                        <div>
                          <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{meta.label}</div>
                          <span className={`badge ${isPhase1 ? "badge-purple" : "badge-gray"}`}>{phase}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
                      {isPhase1
                        ? `Connect your ${meta.label} account to start auto-publishing content.`
                        : `${meta.label} integration coming soon in ${phase}.`}
                    </p>

                    <button
                      className={`btn ${isPhase1 ? "btn-primary" : "btn-outline"} w-full`}
                      style={{ justifyContent: "center", width: "100%" }}
                      disabled={!isPhase1 || isConnecting}
                      onClick={() => isPhase1 && connect(conn.platform)}
                    >
                      {isConnecting ? (
                        <><span className="spin">◌</span> Connecting…</>
                      ) : isPhase1 ? (
                        `Connect ${meta.label}`
                      ) : (
                        "Coming Soon"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
