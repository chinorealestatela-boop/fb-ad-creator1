"use client";

import { useState } from "react";
import Header from "../../components/Header";
import { SAMPLE_SCHEDULED_POSTS } from "../../lib/data";
import { PLATFORM_META } from "../../lib/utils";

type CalView = "month" | "week" | "day";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function CalendarPage() {
  const [calView, setCalView] = useState<CalView>("month");
  const [currentDate, setCurrentDate] = useState(new Date("2026-06-19"));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const today = new Date("2026-06-19");

  const cells: (null | number)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  function postsForDay(day: number | null): typeof SAMPLE_SCHEDULED_POSTS {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return SAMPLE_SCHEDULED_POSTS.filter(p => p.scheduledAt.startsWith(dateStr));
  }

  function isToday(day: number | null) {
    if (!day) return false;
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  const totalScheduled = SAMPLE_SCHEDULED_POSTS.filter(p => p.status === "pending").length;

  return (
    <>
      <Header
        title="Content Calendar"
        subtitle={`${totalScheduled} posts scheduled`}
        actions={
          <button className="btn btn-gradient btn-sm">
            + Add Post
          </button>
        }
      />
      <div className="page-body fade-in">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button className="btn btn-outline btn-sm" onClick={prevMonth}>←</button>
            <h2 className="font-bold" style={{ fontSize: 18, color: "var(--text-primary)", minWidth: 160, textAlign: "center" }}>
              {MONTHS[month]} {year}
            </h2>
            <button className="btn btn-outline btn-sm" onClick={nextMonth}>→</button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setCurrentDate(new Date("2026-06-19"))}
              style={{ color: "var(--accent-light)" }}
            >
              Today
            </button>
          </div>

          <div className="flex gap-1 rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {(["month", "week", "day"] as CalView[]).map(v => (
              <button
                key={v}
                className="btn btn-ghost btn-sm"
                style={{
                  borderRadius: 0,
                  background: calView === v ? "var(--surface-2)" : "transparent",
                  color: calView === v ? "var(--accent-light)" : "var(--text-muted)",
                  textTransform: "capitalize",
                }}
                onClick={() => setCalView(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4 flex-wrap">
          {[
            { label: "Instagram", class: "p-ig", abbr: "IG" },
            { label: "Facebook", class: "p-fb", abbr: "FB" },
            { label: "YouTube", class: "p-yt", abbr: "YT" },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-1.5">
              <span className={`platform-icon ${p.class}`} style={{ width: 16, height: 16, fontSize: 8 }}>{p.abbr}</span>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{p.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="card" style={{ overflow: "hidden" }}>
          {/* Day headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {DAYS.map(d => (
              <div
                key={d}
                className="text-xs font-semibold text-center py-3"
                style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {cells.map((day, idx) => {
              const posts = postsForDay(day);
              const isOther = !day;
              const todayCell = isToday(day);
              return (
                <div
                  key={idx}
                  className={`cal-cell ${todayCell ? "today" : ""} ${posts.length > 0 ? "has-posts" : ""} ${isOther ? "other-month" : ""}`}
                  style={{
                    borderRadius: 0,
                    borderRight: (idx + 1) % 7 !== 0 ? "1px solid var(--border)" : "none",
                    borderBottom: idx < cells.length - 7 ? "1px solid var(--border)" : "none",
                    border: todayCell ? `1px solid var(--accent)` : undefined,
                  }}
                >
                  {day && (
                    <>
                      <div
                        className="text-xs font-bold mb-1"
                        style={{
                          color: todayCell ? "var(--accent-light)" : "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            width: 22, height: 22, borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: todayCell ? "var(--accent)" : "transparent",
                            color: todayCell ? "white" : undefined,
                          }}
                        >
                          {day}
                        </span>
                        {posts.length > 0 && (
                          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{posts.length}</span>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {posts.slice(0, 3).map(p => {
                          const meta = PLATFORM_META[p.platform];
                          return (
                            <div
                              key={p.id}
                              className="flex items-center gap-1 rounded px-1.5 py-0.5"
                              style={{
                                background: "var(--surface-2)",
                                cursor: "pointer",
                                overflow: "hidden",
                              }}
                            >
                              <span className={`platform-icon ${meta.cssClass}`} style={{ width: 12, height: 12, fontSize: 7, borderRadius: 2, flexShrink: 0 }}>
                                {meta.abbr}
                              </span>
                              <span
                                className="text-xs truncate"
                                style={{ color: "var(--text-secondary)", fontSize: 10 }}
                              >
                                {p.contentTitle.split(" ").slice(0, 4).join(" ")}
                              </span>
                            </div>
                          );
                        })}
                        {posts.length > 3 && (
                          <span style={{ fontSize: 10, color: "var(--text-muted)", paddingLeft: 4 }}>
                            +{posts.length - 3} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming list */}
        <div className="mt-6">
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
            Upcoming Scheduled Posts
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SAMPLE_SCHEDULED_POSTS
              .filter(p => p.status === "pending")
              .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
              .slice(0, 8)
              .map(post => {
                const meta = PLATFORM_META[post.platform];
                const d = new Date(post.scheduledAt);
                return (
                  <div
                    key={post.id}
                    className="card flex items-center gap-4 px-4 py-3"
                  >
                    <div
                      className={`bg-gradient-to-br ${post.thumbnailGradient} rounded-lg flex-shrink-0`}
                      style={{ width: 48, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <span style={{ color: "white", fontSize: 16 }}>▶</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {post.contentTitle}
                      </p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                        {post.caption.slice(0, 80)}…
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`platform-icon ${meta.cssClass}`}>{meta.abbr}</span>
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{meta.label}</span>
                    </div>
                    <div className="text-right flex-shrink-0" style={{ minWidth: 100 }}>
                      <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button className="btn btn-ghost btn-xs">✎</button>
                      <button className="btn btn-ghost btn-xs">⋮</button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}
