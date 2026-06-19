"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { getProfile, getConnections, type StoredConnection } from "../../lib/storage";

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸", facebook: "👥", youtube: "▶️", tiktok: "🎵",
};

export default function DashboardPage() {
  const [name, setName] = useState("there");
  const [connections, setConnections] = useState<Record<string, StoredConnection>>({});

  useEffect(() => {
    async function load() {
      const p = await getProfile();
      if (p?.name) setName(p.name.split(" ")[0]);
      const c = await getConnections();
      setConnections(c);
    }
    load();
  }, []);

  const connected = Object.entries(connections).filter(([, c]) => c.connected);

  const steps = [
    { done: true,               label: "Account created"                                       },
    { done: connected.length > 0, label: connected.length > 0 ? `${connected.length} platform${connected.length !== 1 ? "s" : ""} connected` : "Connect a platform", href: "/platforms/" },
    { done: false,              label: "Upload your first content",                             href: "/upload/"    },
  ];

  return (
    <>
      <Header title="Dashboard" subtitle="Your content empire command center" />
      <div className="page-body fade-in">

        {/* Welcome banner */}
        <div className="card p-6 mb-6" style={{ background: "linear-gradient(135deg,rgba(108,99,255,0.15),rgba(236,72,153,0.08))", border: "1px solid rgba(108,99,255,0.25)" }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", marginBottom: 4 }}>Welcome, {name}! 👋</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Your Content Empire is ready. Follow the steps below to get started.</p>
        </div>

        {/* Quick start checklist */}
        <div className="card p-6 mb-6">
          <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Quick Start</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: s.done ? "rgba(16,185,129,0.15)" : "var(--surface-2)",
                  border: `2px solid ${s.done ? "#10b981" : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: s.done ? "#10b981" : "var(--text-muted)",
                }}>
                  {s.done ? "✓" : i + 1}
                </div>
                <span className="text-sm flex-1" style={{ color: s.done ? "var(--text-muted)" : "var(--text-primary)", textDecoration: s.done ? "line-through" : "none" }}>
                  {s.label}
                </span>
                {!s.done && "href" in s && (
                  <a href={(s as any).href} className="btn btn-gradient btn-sm" style={{ fontSize: 12, textDecoration: "none" }}>Go →</a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          {[
            { label: "Total Content",   value: "0",  sub: "Upload content to start"                                       },
            { label: "Followers",       value: "0",  sub: connected.length > 0 ? `${connected.length} platform${connected.length !== 1 ? "s" : ""} linked` : "Connect platforms first" },
            { label: "Total Views",     value: "0",  sub: "Publish content to track"                                       },
            { label: "Est. Revenue",    value: "$0", sub: "Revenue tracking ready"                                         },
          ].map(k => (
            <div key={k.label} className="card p-5">
              <div className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{k.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", marginBottom: 4 }}>{k.value}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Connected platforms */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Connected Platforms</h3>
            <a href="/platforms/" className="btn btn-outline btn-sm" style={{ fontSize: 12, textDecoration: "none" }}>Manage →</a>
          </div>
          {connected.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📱</div>
              <p style={{ color: "var(--text-secondary)", marginBottom: 16, fontSize: 14 }}>
                No platforms connected yet.
              </p>
              <a href="/platforms/" className="btn btn-gradient" style={{ display: "inline-flex", textDecoration: "none" }}>
                Connect Instagram, Facebook, YouTube or TikTok →
              </a>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {connected.map(([id, c]) => (
                <div key={id} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 22 }}>{PLATFORM_ICONS[id] ?? "📱"}</span>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--text-primary)", textTransform: "capitalize" }}>{id}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{c.username}</div>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: 10 }}>Live</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
