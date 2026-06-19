"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { getConnections, saveConnections, type StoredConnection } from "../../lib/storage";

const PHASE1 = [
  { id: "instagram", name: "Instagram", icon: "📸", color: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", label: "Instagram Username", placeholder: "@yourusername",  hint: "Your @handle as it appears on Instagram."                },
  { id: "facebook",  name: "Facebook",  icon: "👥", color: "#1877f2",                                                           label: "Facebook Page Name", placeholder: "Your Page Name", hint: "The name of your Facebook Business Page."               },
  { id: "youtube",   name: "YouTube",   icon: "▶️", color: "#ff0000",                                                           label: "Channel Name",       placeholder: "Your Channel Name", hint: "Your YouTube channel name."                          },
  { id: "tiktok",    name: "TikTok",    icon: "🎵", color: "linear-gradient(135deg,#010101,#69c9d0)",                           label: "TikTok Username",    placeholder: "@yourusername",  hint: "Your @handle as it appears on TikTok."                },
];

const PHASE2 = [
  { id: "linkedin",  name: "LinkedIn",  icon: "💼" },
  { id: "twitter",   name: "Twitter/X", icon: "🐦" },
  { id: "pinterest", name: "Pinterest", icon: "📌" },
  { id: "threads",   name: "Threads",   icon: "🧵" },
];

export default function PlatformsPage() {
  const [connections, setConnections] = useState<Record<string, StoredConnection>>({});
  const [modal, setModal] = useState<typeof PHASE1[0] | null>(null);
  const [inputVal, setInputVal] = useState("");

  useEffect(() => {
    getConnections().then(setConnections);
  }, []);

  async function connect() {
    if (!modal || !inputVal.trim()) return;
    const updated = {
      ...connections,
      [modal.id]: { connected: true, username: inputVal.trim(), displayName: inputVal.trim() },
    };
    setConnections(updated);
    await saveConnections(updated);
    setModal(null);
    setInputVal("");
  }

  async function disconnect(id: string) {
    const updated = { ...connections };
    delete updated[id];
    setConnections(updated);
    await saveConnections(updated);
  }

  function openModal(pl: typeof PHASE1[0]) {
    setInputVal(connections[pl.id]?.username || "");
    setModal(pl);
  }

  return (
    <>
      <Header title="Platforms" subtitle="Manage your connected social media accounts" />
      <div className="page-body fade-in">

        {/* Connect modal */}
        {modal && (
          <>
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50, backdropFilter: "blur(4px)" }} onClick={() => setModal(null)} />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 420, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, zIndex: 51, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: modal.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{modal.icon}</div>
                <div>
                  <div className="font-bold" style={{ color: "var(--text-primary)", fontSize: 16 }}>Connect {modal.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>Enter your account details below</div>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>{modal.label}</label>
                <input
                  className="input"
                  placeholder={modal.placeholder}
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && connect()}
                  autoFocus
                />
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{modal.hint}</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-outline flex-1" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn btn-gradient flex-1" style={{ justifyContent: "center" }} disabled={!inputVal.trim()} onClick={connect}>
                  Connect {modal.name}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Phase 1 — Available Now */}
        <div className="mb-8">
          <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)", fontSize: 16 }}>
            Available Now
            <span className="badge badge-green ml-2" style={{ fontSize: 11 }}>Phase 1</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PHASE1.map(pl => {
              const conn = connections[pl.id];
              return (
                <div key={pl.id} className="card p-5 flex items-center gap-4">
                  <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: pl.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                    {pl.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{pl.name}</div>
                    {conn?.connected ? (
                      <div className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{conn.username}</div>
                    ) : (
                      <div className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Not connected</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {conn?.connected && <span className="badge badge-green">Connected</span>}
                    {conn?.connected ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openModal(pl)}>Edit</button>
                        <button className="btn btn-sm" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }} onClick={() => disconnect(pl.id)}>Disconnect</button>
                      </div>
                    ) : (
                      <button className="btn btn-gradient btn-sm" onClick={() => openModal(pl)}>Connect</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase 2 — Coming Soon */}
        <div>
          <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)", fontSize: 16 }}>
            Coming Soon
            <span className="badge badge-gray ml-2" style={{ fontSize: 11 }}>Phase 2</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PHASE2.map(pl => (
              <div key={pl.id} className="card p-5 flex items-center gap-4" style={{ opacity: 0.5 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                  {pl.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{pl.name}</div>
                  <div className="text-sm" style={{ color: "var(--text-muted)" }}>Coming in Phase 2</div>
                </div>
                <span className="badge badge-gray">Coming Soon</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
