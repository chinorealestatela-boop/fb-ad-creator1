"use client";

import { useState } from "react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const NOTIFS = [
  { id: 1, icon: "✅", text: "'Luxury Home Tour' went live on Instagram", time: "2m ago" },
  { id: 2, icon: "🚀", text: "AI detected viral potential in 3 new uploads", time: "18m ago" },
  { id: 3, icon: "💰", text: "Revenue milestone reached: $3,000 this month!", time: "1h ago" },
  { id: 4, icon: "📅", text: "247 posts scheduled — 82 days of content ready", time: "2h ago" },
  { id: 5, icon: "📈", text: "'Market Update' reel hit 10K views", time: "3h ago" },
];

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <header
      className="flex items-center justify-between px-6 flex-shrink-0"
      style={{
        height: 60,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div>
        <h1 className="font-bold" style={{ fontSize: 16, color: "var(--text-primary)", lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {actions}

        {/* Search */}
        <div className="relative hide-mobile">
          <input
            type="text"
            placeholder="Search content…"
            className="input input-sm"
            style={{ width: 190, paddingLeft: 30 }}
          />
          <span
            className="absolute"
            style={{ left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14 }}
          >
            ⌕
          </span>
        </div>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="btn btn-ghost"
            style={{ padding: "6px 8px", position: "relative" }}
          >
            🔔
            <span
              style={{
                position: "absolute", top: 4, right: 4,
                width: 7, height: 7, borderRadius: "50%",
                background: "var(--accent)",
              }}
            />
          </button>

          {showNotifs && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 40 }}
                onClick={() => setShowNotifs(false)}
              />
              <div
                style={{
                  position: "absolute", right: 0, top: 42, width: 320,
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  borderRadius: 12, zIndex: 50, overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                }}
              >
                <div
                  className="px-4 py-3 font-semibold text-sm"
                  style={{ borderBottom: "1px solid var(--border)", color: "var(--text-primary)" }}
                >
                  Notifications
                  <span className="badge badge-purple ml-2">{NOTIFS.length}</span>
                </div>
                {NOTIFS.map((n) => (
                  <div
                    key={n.id}
                    className="px-4 py-3 flex gap-3 cursor-pointer"
                    style={{ borderBottom: "1px solid var(--border)", transition: "background 0.13s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{n.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>{n.text}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{n.time}</p>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-2.5 text-center" style={{ borderTop: "1px solid var(--border)" }}>
                  <button className="text-xs" style={{ color: "var(--accent-light)", background: "none", border: "none", cursor: "pointer" }}>
                    View all notifications →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* AI status pill */}
        <div
          className="hide-mobile flex items-center gap-2 px-3"
          style={{
            height: 30, borderRadius: 99,
            background: "rgba(108,99,255,0.1)",
            border: "1px solid rgba(108,99,255,0.25)",
          }}
        >
          <span
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#10b981",
              animation: "aiPulse 2.2s ease-in-out infinite",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-light)" }}>AI Active</span>
        </div>

        {/* Upload CTA */}
        <Link href="/upload" className="btn btn-gradient btn-sm hide-mobile" style={{ textDecoration: "none" }}>
          ⬆ Upload
        </Link>
      </div>
    </header>
  );
}
