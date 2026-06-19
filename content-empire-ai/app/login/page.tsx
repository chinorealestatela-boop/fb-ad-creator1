"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👑</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>Content Empire AI</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        {sent ? (
          <div className="card p-6" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
            <h3 style={{ color: "var(--text-primary)", marginBottom: 8, fontWeight: 700 }}>Check your email</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back here to sign in.
            </p>
            <button className="btn btn-outline mt-4" onClick={() => { setSent(false); setMode("login"); }}>
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="card p-6" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
                <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Password</label>
                <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
              {error && <p style={{ color: "#ef4444", fontSize: 13, background: "rgba(239,68,68,0.1)", padding: "10px 14px", borderRadius: 8 }}>{error}</p>}
              <button className="btn btn-gradient" type="submit" disabled={loading} style={{ justifyContent: "center", padding: "13px 0" }}>
                {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </div>
          </form>
        )}

        <p style={{ textAlign: "center", marginTop: 16, color: "var(--text-muted)", fontSize: 13 }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} style={{ background: "none", border: "none", color: "var(--accent-light)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
            {mode === "login" ? "Sign up free" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
