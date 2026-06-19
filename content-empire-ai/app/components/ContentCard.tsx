"use client";

import { useState } from "react";
import type { ContentItem } from "../lib/types";
import { PLATFORM_META, formatNumber, formatDuration, scoreClass, statusBadgeClass, formatDate } from "../lib/utils";

interface Props {
  item: ContentItem;
  onSelect?: (id: string) => void;
  selected?: boolean;
  view?: "grid" | "list";
}

export default function ContentCard({ item, onSelect, selected, view = "grid" }: Props) {
  const [hover, setHover] = useState(false);

  if (view === "list") {
    return (
      <div
        className={`card card-hover flex items-center gap-4 px-4 py-3 cursor-pointer ${selected ? "glow-accent" : ""}`}
        style={{ borderColor: selected ? "var(--accent)" : undefined }}
        onClick={() => onSelect?.(item.id)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* Checkbox */}
        <div
          style={{
            width: 18, height: 18, borderRadius: 4, border: `2px solid ${selected ? "var(--accent)" : "var(--border-light)"}`,
            background: selected ? "var(--accent)" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.15s",
          }}
        >
          {selected && <span style={{ color: "white", fontSize: 10 }}>✓</span>}
        </div>

        {/* Thumbnail */}
        <div
          className={`bg-gradient-to-br ${item.thumbnailGradient} rounded-lg flex-shrink-0`}
          style={{ width: 56, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <span style={{ fontSize: 18, color: "white" }}>
            {item.type === "reel" || item.type === "short" ? "▶" : item.type === "photo" ? "🖼" : item.type === "carousel" ? "⊞" : "▶"}
          </span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>{item.title}</div>
          <div className="flex items-center gap-2 mt-1" style={{ flexWrap: "wrap" }}>
            <span className={`badge ${statusBadgeClass(item.status)}`}>{item.status}</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.category}</span>
            {item.durationSec && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDuration(item.durationSec)}</span>
            )}
          </div>
        </div>

        {/* Platforms */}
        <div className="flex gap-1 hide-mobile">
          {item.platforms.map(p => {
            const m = PLATFORM_META[p];
            return (
              <span key={p} className={`platform-icon ${m.cssClass}`} title={m.label}>{m.abbr}</span>
            );
          })}
        </div>

        {/* Scores */}
        <div className="flex gap-3 hide-mobile">
          {[
            { label: "Viral", score: item.viralScore },
            { label: "Engage", score: item.engagementScore },
          ].map(({ label, score }) => (
            <div key={label} className="text-center">
              <div
                className={`score-ring ${scoreClass(score)}`}
                style={{ width: 32, height: 32, fontSize: 10, fontWeight: 700 }}
              >
                {score}
              </div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        {item.views != null && (
          <div className="text-right hide-mobile" style={{ minWidth: 80 }}>
            <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{formatNumber(item.views)}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>views</div>
          </div>
        )}

        {/* Date */}
        <div className="text-xs hide-mobile" style={{ color: "var(--text-muted)", minWidth: 70, textAlign: "right" }}>
          {item.scheduledAt ? formatDate(item.scheduledAt, { month: "short", day: "numeric" }) :
           item.publishedAt ? formatDate(item.publishedAt, { month: "short", day: "numeric" }) :
           formatDate(item.createdAt, { month: "short", day: "numeric" })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`card card-hover cursor-pointer overflow-hidden ${selected ? "glow-accent" : ""}`}
      style={{ borderColor: selected ? "var(--accent)" : undefined }}
      onClick={() => onSelect?.(item.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Thumbnail */}
      <div
        className={`bg-gradient-to-br ${item.thumbnailGradient} relative`}
        style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <span style={{ fontSize: 32, color: "rgba(255,255,255,0.9)" }}>
          {item.type === "reel" || item.type === "short" ? "▶" : item.type === "photo" ? "🖼" : item.type === "carousel" ? "⊞" : "▶"}
        </span>

        {/* Duration badge */}
        {item.durationSec && (
          <span
            style={{
              position: "absolute", bottom: 6, right: 6,
              background: "rgba(0,0,0,0.7)", color: "white",
              fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
            }}
          >
            {formatDuration(item.durationSec)}
          </span>
        )}

        {/* Type badge */}
        <span
          style={{
            position: "absolute", top: 6, left: 6,
            background: "rgba(0,0,0,0.6)", color: "white",
            fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
            textTransform: "capitalize",
          }}
        >
          {item.type}
        </span>

        {/* Checkbox */}
        <div
          style={{
            position: "absolute", top: 6, right: 6,
            width: 20, height: 20, borderRadius: 4,
            border: `2px solid ${selected ? "var(--accent)" : "rgba(255,255,255,0.6)"}`,
            background: selected ? "var(--accent)" : "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
            opacity: selected || hover ? 1 : 0,
          }}
        >
          {selected && <span style={{ color: "white", fontSize: 11 }}>✓</span>}
        </div>

        {/* AI badge */}
        {item.aiAnalyzed && (
          <span
            className="ai-chip"
            style={{ position: "absolute", bottom: 6, left: 6, fontSize: 9 }}
          >
            ✦ AI
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="truncate-2 text-xs font-medium mb-2 leading-snug" style={{ color: "var(--text-primary)" }}>
          {item.title}
        </p>

        <div className="flex items-center justify-between mb-2">
          <span className={`badge ${statusBadgeClass(item.status)}`}>{item.status}</span>
          <div className="flex gap-1">
            {item.platforms.slice(0, 3).map(p => {
              const m = PLATFORM_META[p];
              return <span key={p} className={`platform-icon ${m.cssClass}`}>{m.abbr}</span>;
            })}
          </div>
        </div>

        {/* Score bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            { label: "Viral", score: item.viralScore, color: "#6c63ff" },
            { label: "Engage", score: item.engagementScore, color: "#10b981" },
          ].map(({ label, score, color }) => (
            <div key={label}>
              <div className="flex justify-between mb-0.5" style={{ fontSize: 10 }}>
                <span style={{ color: "var(--text-muted)" }}>{label}</span>
                <span style={{ color, fontWeight: 700 }}>{score}</span>
              </div>
              <div className="progress-bar">
                <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Stats row if published */}
        {item.views != null && (
          <div className="flex gap-3 mt-2.5 pt-2.5" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="text-center" style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{formatNumber(item.views)}</div>
              <div style={{ fontSize: 9, color: "var(--text-muted)" }}>views</div>
            </div>
            <div className="text-center" style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{formatNumber(item.likes ?? 0)}</div>
              <div style={{ fontSize: 9, color: "var(--text-muted)" }}>likes</div>
            </div>
            <div className="text-center" style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{formatNumber(item.shares ?? 0)}</div>
              <div style={{ fontSize: 9, color: "var(--text-muted)" }}>shares</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
