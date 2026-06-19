"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getProfile } from "../lib/storage";
import { supabase } from "../lib/supabase";

const NAV = [
  {
    group: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "⊞" },
      { href: "/upload",    label: "Bulk Upload",  icon: "⬆", badge: "AI" },
      { href: "/library",   label: "Content Library", icon: "▤" },
    ],
  },
  {
    group: "Publishing",
    items: [
      { href: "/calendar",  label: "Calendar",      icon: "◫" },
      { href: "/scheduler", label: "AI Scheduler",  icon: "⏱", badge: "AUTO" },
      { href: "/platforms", label: "Platforms",     icon: "◉" },
    ],
  },
  {
    group: "AI Tools",
    items: [
      { href: "/strategy",    label: "AI Strategist",   icon: "✦", badge: "AI" },
      { href: "/captions",    label: "Caption Studio",  icon: "✎" },
      { href: "/recycle",     label: "Repost Engine",   icon: "↻" },
      { href: "/cloning",     label: "Content Cloning", icon: "⧉" },
    ],
  },
  {
    group: "Growth",
    items: [
      { href: "/analytics",     label: "Analytics",      icon: "◇" },
      { href: "/monetization",  label: "Monetization",   icon: "◈" },
      { href: "/consultant",    label: "Growth AI",      icon: "◆" },
    ],
  },
  {
    group: "Account",
    items: [
      { href: "/team",     label: "Team",     icon: "◎" },
      { href: "/settings", label: "Settings", icon: "⚙" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState("Loading...");
  const [userInitial, setUserInitial] = useState("?");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    getProfile().then(p => {
      if (p?.name) {
        setUserName(p.businessName || p.name);
        setUserInitial((p.businessName || p.name)[0].toUpperCase());
        setUserEmail(p.email || "");
      } else {
        setUserName("My Account");
        setUserInitial("?");
      }
    });
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #6c63ff 0%, #a855f7 50%, #ec4899 100%)" }}
            >
              CE
            </div>
            <div>
              <div className="font-bold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
                Content Empire
              </div>
              <div className="ai-chip mt-0.5" style={{ fontSize: "9px", padding: "1px 6px" }}>
                ✦ AI Powered
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {NAV.map((group) => (
          <div key={group.group}>
            <div
              className="text-xs font-semibold uppercase tracking-widest mb-1.5 px-2"
              style={{ color: "var(--text-muted)", letterSpacing: "0.1em" }}
            >
              {group.group}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`sidebar-item ${active ? "active" : ""}`}>
                    <span style={{ width: 18, textAlign: "center", fontSize: 15, lineHeight: 1, flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "1px 5px",
                          borderRadius: 4,
                          background: "rgba(108,99,255,0.2)",
                          color: "var(--accent-light)",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
        {/* Storage bar */}
        <div className="mb-3 px-1">
          <div className="flex justify-between mb-1" style={{ fontSize: 11, color: "var(--text-muted)" }}>
            <span>Storage used</span>
            <span style={{ color: "var(--text-secondary)" }}>0 GB / 100 GB</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "0%" }} />
          </div>
        </div>

        <div
          className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer"
          style={{ transition: "background 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
          onMouseLeave={e => (e.currentTarget.style.background = "")}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6c63ff, #ec4899)" }}
          >
            {userInitial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {userName}
            </div>
            <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{userEmail || "Pro Plan"}</div>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, padding: "2px 4px", flexShrink: 0 }}
          >⏻</button>
        </div>
      </div>
    </aside>
  );
}
