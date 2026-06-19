"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  change?: number;
  icon?: string;
  accent?: string;
}

export default function StatCard({ label, value, sub, change, icon, accent = "var(--accent)" }: StatCardProps) {
  const up = change != null && change >= 0;

  return (
    <div className="stat-card" style={{ position: "relative", overflow: "hidden" }}>
      {/* Glow blob */}
      <div
        style={{
          position: "absolute", top: -20, right: -20,
          width: 80, height: 80, borderRadius: "50%",
          background: accent,
          opacity: 0.08,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <div className="flex items-start justify-between gap-2">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {label}
          </div>
          <div className="font-bold" style={{ fontSize: 26, color: "var(--text-primary)", lineHeight: 1 }}>
            {value}
          </div>
          {sub && (
            <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{sub}</div>
          )}
          {change != null && (
            <div className="flex items-center gap-1 mt-2">
              <span style={{ fontSize: 12, color: up ? "var(--success)" : "var(--error)", fontWeight: 700 }}>
                {up ? "▲" : "▼"} {Math.abs(change)}%
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: `${accent}22`,
              border: `1px solid ${accent}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
