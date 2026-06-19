"use client";

import type { AIRecommendation } from "../lib/types";
import { priorityBadge } from "../lib/utils";

interface Props {
  rec: AIRecommendation;
  onAction?: (rec: AIRecommendation) => void;
  compact?: boolean;
}

export default function AIRecommendationCard({ rec, onAction, compact }: Props) {
  return (
    <div
      className="card card-hover p-4"
      style={{
        borderLeft: `3px solid ${rec.priority === "high" ? "var(--error)" : rec.priority === "medium" ? "var(--warning)" : "var(--accent)"}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--surface-2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
          }}
        >
          {rec.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 mb-1" style={{ flexWrap: "wrap" }}>
            <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{rec.title}</span>
            <span className={`badge ${priorityBadge(rec.priority)}`}>{rec.priority}</span>
          </div>
          {!compact && (
            <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
              {rec.message}
            </p>
          )}
          <button
            className="btn btn-primary btn-xs"
            onClick={() => onAction?.(rec)}
          >
            {rec.action} →
          </button>
        </div>
      </div>
    </div>
  );
}
