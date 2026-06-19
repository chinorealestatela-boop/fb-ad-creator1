"use client";

import { useState, useMemo } from "react";
import Header from "../../components/Header";
import ContentCard from "../../components/ContentCard";
import { SAMPLE_CONTENT } from "../../lib/data";
import type { ContentStatus, ContentType, Platform } from "../../lib/types";
import { PLATFORM_META } from "../../lib/utils";

type ViewMode = "grid" | "list";
type SortBy = "date" | "viral" | "engagement" | "views" | "title";

export default function LibraryPage() {
  const [view, setView] = useState<ViewMode>("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<ContentStatus | "all">("all");
  const [filterType, setFilterType] = useState<ContentType | "all">("all");
  const [filterPlatform, setFilterPlatform] = useState<Platform | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let items = [...SAMPLE_CONTENT];
    if (search) items = items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus !== "all") items = items.filter(i => i.status === filterStatus);
    if (filterType !== "all") items = items.filter(i => i.type === filterType);
    if (filterPlatform !== "all") items = items.filter(i => i.platforms.includes(filterPlatform));
    items.sort((a, b) => {
      switch (sortBy) {
        case "viral": return b.viralScore - a.viralScore;
        case "engagement": return b.engagementScore - a.engagementScore;
        case "views": return (b.views ?? 0) - (a.views ?? 0);
        case "title": return a.title.localeCompare(b.title);
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return items;
  }, [search, filterStatus, filterType, filterPlatform, sortBy]);

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(filtered.map(i => i.id)));
  }

  const statusCounts: Record<string, number> = {
    all: SAMPLE_CONTENT.length,
    published: SAMPLE_CONTENT.filter(c => c.status === "published").length,
    scheduled: SAMPLE_CONTENT.filter(c => c.status === "scheduled").length,
    draft: SAMPLE_CONTENT.filter(c => c.status === "draft").length,
  };

  return (
    <>
      <Header
        title="Content Library"
        subtitle={`${SAMPLE_CONTENT.length} pieces of content · AI-organized`}
        actions={
          <a href="/upload" className="btn btn-gradient btn-sm" style={{ textDecoration: "none" }}>
            ⬆ Upload
          </a>
        }
      />
      <div className="page-body fade-in">

        {/* Status tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {(["all", "published", "scheduled", "draft"] as const).map(s => (
            <button
              key={s}
              className={`btn btn-sm ${filterStatus === s ? "btn-primary" : "btn-outline"}`}
              onClick={() => setFilterStatus(s)}
              style={{ flexShrink: 0, textTransform: "capitalize" }}
            >
              {s}
              <span
                style={{
                  marginLeft: 4, fontSize: 11, fontWeight: 700,
                  background: filterStatus === s ? "rgba(255,255,255,0.2)" : "var(--surface-2)",
                  color: filterStatus === s ? "white" : "var(--text-muted)",
                  padding: "1px 6px", borderRadius: 99,
                }}
              >
                {statusCounts[s]}
              </span>
            </button>
          ))}
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <input
            type="text"
            placeholder="Search content…"
            className="input input-sm"
            style={{ width: 220 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="input input-sm" style={{ width: 130 }} value={filterType} onChange={e => setFilterType(e.target.value as ContentType | "all")}>
            <option value="all">All Types</option>
            <option value="reel">Reel</option>
            <option value="short">Short</option>
            <option value="video">Video</option>
            <option value="photo">Photo</option>
            <option value="carousel">Carousel</option>
          </select>
          <select className="input input-sm" style={{ width: 140 }} value={filterPlatform} onChange={e => setFilterPlatform(e.target.value as Platform | "all")}>
            <option value="all">All Platforms</option>
            {(Object.keys(PLATFORM_META) as Platform[]).map(p => (
              <option key={p} value={p}>{PLATFORM_META[p].label}</option>
            ))}
          </select>
          <select className="input input-sm" style={{ width: 140 }} value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}>
            <option value="date">Sort: Date</option>
            <option value="viral">Sort: Viral Score</option>
            <option value="engagement">Sort: Engagement</option>
            <option value="views">Sort: Views</option>
            <option value="title">Sort: Title</option>
          </select>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {selected.size > 0 && (
              <>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{selected.size} selected</span>
                <button className="btn btn-outline btn-sm">📅 Schedule</button>
                <button className="btn btn-outline btn-sm">✎ Edit Captions</button>
                <button className="btn btn-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                  🗑 Delete
                </button>
              </>
            )}
            <button className="btn btn-ghost btn-sm" onClick={selectAll}>Select All</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>Clear</button>
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ border: "1px solid var(--border)" }}
            >
              {(["grid", "list"] as ViewMode[]).map(v => (
                <button
                  key={v}
                  className="btn btn-ghost btn-sm"
                  style={{
                    borderRadius: 0,
                    background: view === v ? "var(--surface-2)" : "transparent",
                    color: view === v ? "var(--accent-light)" : "var(--text-muted)",
                  }}
                  onClick={() => setView(v)}
                >
                  {v === "grid" ? "⊞" : "≡"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          Showing {filtered.length} of {SAMPLE_CONTENT.length} items
        </p>

        {/* Grid / List */}
        {view === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))",
              gap: 14,
            }}
          >
            {filtered.map(item => (
              <ContentCard
                key={item.id}
                item={item}
                view="grid"
                selected={selected.has(item.id)}
                onSelect={toggleSelect}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* List header */}
            <div
              className="flex items-center gap-4 px-4 py-2 rounded-lg text-xs font-semibold"
              style={{ color: "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div style={{ width: 18 }} />
              <div style={{ width: 56 }}>Preview</div>
              <div style={{ flex: 1 }}>Title</div>
              <div className="hide-mobile" style={{ width: 110 }}>Platforms</div>
              <div className="hide-mobile" style={{ width: 80, textAlign: "center" }}>Scores</div>
              <div className="hide-mobile" style={{ width: 80, textAlign: "right" }}>Views</div>
              <div className="hide-mobile" style={{ width: 70, textAlign: "right" }}>Date</div>
            </div>
            {filtered.map(item => (
              <ContentCard
                key={item.id}
                item={item}
                view="list"
                selected={selected.has(item.id)}
                onSelect={toggleSelect}
              />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48 }}>📭</div>
            <p className="mt-3 text-sm">No content matches your filters</p>
            <button className="btn btn-outline btn-sm mt-4" onClick={() => { setSearch(""); setFilterStatus("all"); setFilterType("all"); setFilterPlatform("all"); }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}
