"use client";

import { useState } from "react";
import Header from "../../components/Header";
import { TEAM_MEMBERS } from "../../lib/data";
import type { TeamMember } from "../../lib/types";

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");

  function invite() {
    if (!inviteEmail.trim()) return;
    const newMember: TeamMember = {
      id: `u${members.length + 1}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      joinedAt: new Date().toISOString().split("T")[0],
    };
    setMembers(prev => [...prev, newMember]);
    setInviteEmail("");
    setShowInvite(false);
  }

  const ROLE_COLORS: Record<string, string> = {
    admin: "badge-purple",
    editor: "badge-blue",
    viewer: "badge-gray",
  };

  const ROLE_PERMS: Record<string, string[]> = {
    admin: ["Upload content", "Edit captions", "Approve posts", "Manage team", "View analytics", "Billing access"],
    editor: ["Upload content", "Edit captions", "Approve posts", "View analytics"],
    viewer: ["View content", "View analytics"],
  };

  return (
    <>
      <Header
        title="Team"
        subtitle="Manage access and permissions for your team"
        actions={
          <button className="btn btn-gradient btn-sm" onClick={() => setShowInvite(true)}>
            + Invite Member
          </button>
        }
      />
      <div className="page-body fade-in">

        {/* Invite modal */}
        {showInvite && (
          <>
            <div
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50, backdropFilter: "blur(4px)" }}
              onClick={() => setShowInvite(false)}
            />
            <div
              style={{
                position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                width: 420, background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: 16, padding: 28, zIndex: 51,
                boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              }}
            >
              <h3 className="font-bold mb-5" style={{ color: "var(--text-primary)", fontSize: 16 }}>Invite Team Member</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Email Address</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Role</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["editor", "viewer"] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => setInviteRole(r)}
                        className="flex-1 py-2 rounded-lg text-sm font-medium capitalize"
                        style={{
                          background: inviteRole === r ? "rgba(108,99,255,0.15)" : "var(--surface-3)",
                          border: `1px solid ${inviteRole === r ? "rgba(108,99,255,0.4)" : "var(--border)"}`,
                          color: inviteRole === r ? "var(--accent-light)" : "var(--text-secondary)",
                          transition: "all 0.13s",
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                    {inviteRole === "editor" ? "Can upload, edit captions, and approve posts" : "Can view content and analytics only"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="btn btn-outline flex-1" onClick={() => setShowInvite(false)}>Cancel</button>
                <button className="btn btn-gradient flex-1" onClick={invite} disabled={!inviteEmail.trim()}>Send Invite</button>
              </div>
            </div>
          </>
        )}

        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 280px" }}>
          {/* Members list */}
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {members.map(m => (
                <div key={m.id} className="card p-5 flex items-center gap-4">
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: "linear-gradient(135deg, #6c63ff, #ec4899)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontWeight: 800, fontSize: 16,
                    }}
                  >
                    {m.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{m.name}</span>
                      <span className={`badge ${ROLE_COLORS[m.role]}`}>{m.role}</span>
                      {m.role === "admin" && <span className="badge badge-yellow">Owner</span>}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{m.email}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      Joined {new Date(m.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {m.role !== "admin" && (
                      <>
                        <select
                          className="input input-sm"
                          defaultValue={m.role}
                          style={{ width: 90 }}
                          onChange={e => setMembers(prev => prev.map(x => x.id === m.id ? { ...x, role: e.target.value as TeamMember["role"] } : x))}
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button
                          className="btn btn-xs"
                          style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}
                          onClick={() => setMembers(prev => prev.filter(x => x.id !== m.id))}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(["admin", "editor", "viewer"] as const).map(role => (
              <div key={role} className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`badge ${ROLE_COLORS[role]}`}>{role}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {ROLE_PERMS[role].map(perm => (
                    <div key={perm} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <span style={{ color: "#10b981" }}>✓</span> {perm}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
