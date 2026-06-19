"use client";

import { useState, useRef } from "react";
import Header from "../../components/Header";

type UploadState = "idle" | "uploading" | "analyzing" | "done";

interface FakeFile {
  id: string;
  name: string;
  size: string;
  type: string;
  progress: number;
  state: "uploading" | "analyzing" | "done" | "error";
  viralScore?: number;
  category?: string;
  platform?: string;
}

const DEMO_FILES: Omit<FakeFile, "id">[] = [
  { name: "luxury_home_tour_beverly_hills.mp4", size: "248 MB", type: "reel", progress: 100, state: "done", viralScore: 94, category: "Real Estate", platform: "Instagram, YouTube" },
  { name: "market_update_june_2026.mp4", size: "184 MB", type: "short", progress: 100, state: "done", viralScore: 78, category: "Education", platform: "Instagram, Facebook" },
  { name: "client_testimonial_sarah.mp4", size: "312 MB", type: "video", progress: 100, state: "done", viralScore: 86, category: "Real Estate", platform: "All Platforms" },
  { name: "morning_routine_walkthrough.mp4", size: "97 MB", type: "reel", progress: 100, state: "done", viralScore: 71, category: "Lifestyle", platform: "Instagram, TikTok" },
  { name: "open_house_3bed_westwood.mp4", size: "201 MB", type: "video", progress: 100, state: "done", viralScore: 89, category: "Real Estate", platform: "Instagram, YouTube" },
];

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [files, setFiles] = useState<FakeFile[]>([]);
  const [postsPerDay, setPostsPerDay] = useState(3);
  const [selectedPlatforms, setSelectedPlatforms] = useState(["instagram", "facebook", "youtube"]);
  const fileRef = useRef<HTMLInputElement>(null);

  const platforms = [
    { id: "instagram", label: "Instagram", class: "p-ig", abbr: "IG" },
    { id: "facebook",  label: "Facebook",  class: "p-fb", abbr: "FB" },
    { id: "youtube",   label: "YouTube",   class: "p-yt", abbr: "YT" },
    { id: "tiktok",    label: "TikTok",    class: "p-tt", abbr: "TT" },
    { id: "linkedin",  label: "LinkedIn",  class: "p-li", abbr: "LI" },
  ];

  function togglePlatform(id: string) {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  function startDemo() {
    setUploadState("uploading");
    const initial = DEMO_FILES.map((f, i) => ({ ...f, id: `f${i}`, progress: 0, state: "uploading" as const }));
    setFiles(initial);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 8;
      setFiles(prev => prev.map(f => ({
        ...f,
        progress: Math.min(progress + Math.random() * 10, 100),
        state: progress >= 90 ? "analyzing" : "uploading",
      })));
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setFiles(DEMO_FILES.map((f, i) => ({ ...f, id: `f${i}` })));
          setUploadState("done");
        }, 1500);
      }
    }, 200);
  }

  const totalDays = files.length > 0 ? Math.ceil(files.length / postsPerDay) : 0;

  return (
    <>
      <Header
        title="Bulk Upload"
        subtitle="Upload hundreds or thousands of content pieces at once"
      />
      <div className="page-body fade-in">

        {uploadState === "idle" && (
          <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 300px" }}>
            <div>
              {/* Upload zone */}
              <div
                className={`upload-zone p-16 mb-6 ${dragActive ? "drag-active" : ""}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={e => { e.preventDefault(); setDragActive(false); startDemo(); }}
              >
                <input ref={fileRef} type="file" multiple accept="video/*,image/*" style={{ display: "none" }} onChange={startDemo} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 72, height: 72, borderRadius: 20,
                      background: "linear-gradient(135deg, rgba(108,99,255,0.2), rgba(168,85,247,0.2))",
                      border: "2px solid rgba(108,99,255,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 32,
                    }}
                  >
                    ⬆
                  </div>
                  <div>
                    <p className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                      Drop files here or click to browse
                    </p>
                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                      Upload videos, photos, carousels, reels — any format
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {["MP4", "MOV", "AVI", "JPG", "PNG", "HEIC"].map(ext => (
                      <span key={ext} className="badge badge-gray">{ext}</span>
                    ))}
                  </div>
                  <button className="btn btn-gradient" onClick={startDemo}>
                    ⬆ Select Files to Upload
                  </button>
                </div>
              </div>

              {/* Import from cloud */}
              <div>
                <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                  Or import from cloud storage
                </p>
                <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                  {[
                    { label: "Google Drive", icon: "▲", color: "#4285f4" },
                    { label: "Dropbox",      icon: "◆", color: "#0061ff" },
                    { label: "OneDrive",     icon: "☁", color: "#0078d4" },
                  ].map(s => (
                    <button
                      key={s.label}
                      className="card card-hover btn p-4 flex-col gap-2"
                      style={{ height: "auto", color: "var(--text-secondary)" }}
                      onClick={startDemo}
                    >
                      <span style={{ fontSize: 24, color: s.color }}>{s.icon}</span>
                      <span className="text-xs font-semibold">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Settings panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card p-5">
                <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Upload Settings</h3>

                <div className="mb-4">
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>
                    Target Platforms
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {platforms.map(p => (
                      <label key={p.id} className="toggle-wrap">
                        <div
                          className={`toggle-track ${selectedPlatforms.includes(p.id) ? "on" : ""}`}
                          onClick={() => togglePlatform(p.id)}
                        >
                          <div className="toggle-thumb" />
                        </div>
                        <span className={`platform-icon ${p.class}`}>{p.abbr}</span>
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>
                    Posts Per Day: <span style={{ color: "var(--accent-light)" }}>{postsPerDay}</span>
                  </label>
                  <input
                    type="range" min={1} max={10} value={postsPerDay}
                    onChange={e => setPostsPerDay(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--accent)" }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    <span>1/day</span><span>10/day</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-secondary)" }}>
                    AI Caption Style
                  </label>
                  <select className="input input-sm">
                    <option>Auto (AI decides)</option>
                    <option>Viral Hook</option>
                    <option>Storytelling</option>
                    <option>Educational</option>
                    <option>Sales Focused</option>
                    <option>Motivational</option>
                  </select>
                </div>

                <div
                  className="rounded-lg p-3"
                  style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)" }}
                >
                  <div className="text-xs font-semibold mb-1" style={{ color: "var(--accent-light)" }}>
                    ✦ AI will automatically:
                  </div>
                  <ul style={{ color: "var(--text-secondary)", fontSize: 11, lineHeight: 1.7, listStyle: "none", padding: 0 }}>
                    <li>• Transcribe & analyze every video</li>
                    <li>• Generate captions for each platform</li>
                    <li>• Create hashtag sets</li>
                    <li>• Score viral & engagement potential</li>
                    <li>• Build a {postsPerDay}x/day posting schedule</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {(uploadState === "uploading" || uploadState === "analyzing" || uploadState === "done") && (
          <div>
            {/* Progress header */}
            {uploadState !== "done" && (
              <div className="card p-5 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="spin text-xl">◌</div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                      {uploadState === "uploading" ? "Uploading content to secure storage…" : "AI analyzing your content…"}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {uploadState === "analyzing" ? "Transcribing, scoring, generating captions — this takes a moment" : "Uploading files to AWS S3"}
                    </div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${files.reduce((a, f) => a + f.progress, 0) / Math.max(files.length, 1)}%` }}
                  />
                </div>
              </div>
            )}

            {uploadState === "done" && (
              <div
                className="rounded-xl p-5 mb-6 flex items-center justify-between gap-4"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}
              >
                <div>
                  <div className="font-bold" style={{ color: "#10b981" }}>
                    ✅ {files.length} files uploaded and analyzed!
                  </div>
                  <div className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                    AI created captions, scored content, and scheduled {files.length * postsPerDay} posts across {totalDays} days.
                    Your content will auto-publish on {selectedPlatforms.length} platforms.
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="btn btn-outline btn-sm" onClick={() => setUploadState("idle")}>Upload More</button>
                  <a href="/library" className="btn btn-gradient btn-sm" style={{ textDecoration: "none" }}>View Library →</a>
                </div>
              </div>
            )}

            {/* File list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {files.map(f => (
                <div key={f.id} className="card p-4 flex items-center gap-4">
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: f.state === "done" ? "rgba(16,185,129,0.15)" : f.state === "analyzing" ? "rgba(108,99,255,0.15)" : "var(--surface-2)",
                      border: `1px solid ${f.state === "done" ? "rgba(16,185,129,0.3)" : f.state === "analyzing" ? "rgba(108,99,255,0.3)" : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, flexShrink: 0,
                    }}
                  >
                    {f.state === "done" ? "✅" : f.state === "analyzing" ? "🔍" : "⬆"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{f.name}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{f.size}</span>
                      <span className="badge badge-gray" style={{ fontSize: 10 }}>{f.type}</span>
                      {f.state === "done" && f.category && (
                        <span className="badge badge-purple" style={{ fontSize: 10 }}>{f.category}</span>
                      )}
                    </div>
                    {f.state !== "done" && (
                      <div className="progress-bar mt-2">
                        <div className="progress-fill" style={{ width: `${f.progress}%` }} />
                      </div>
                    )}
                  </div>
                  {f.state === "done" && f.viralScore != null && (
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div>
                        <div className="text-xs text-center" style={{ color: "var(--text-muted)" }}>Viral</div>
                        <div
                          className={`score-ring ${f.viralScore >= 75 ? "score-high" : "score-med"}`}
                          style={{ width: 34, height: 34, fontSize: 11 }}
                        >
                          {f.viralScore}
                        </div>
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        → {f.platform}
                      </div>
                    </div>
                  )}
                  {f.state !== "done" && (
                    <div className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                      {f.state === "analyzing" ? "Analyzing…" : `${Math.round(f.progress)}%`}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {uploadState === "done" && (
              <div className="grid gap-4 mt-6" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                <div className="card p-5 text-center">
                  <div className="font-black" style={{ fontSize: 32, color: "var(--accent-light)" }}>{files.length * postsPerDay}</div>
                  <div className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>posts scheduled</div>
                </div>
                <div className="card p-5 text-center">
                  <div className="font-black" style={{ fontSize: 32, color: "#10b981" }}>{totalDays}</div>
                  <div className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>days of content</div>
                </div>
                <div className="card p-5 text-center">
                  <div className="font-black" style={{ fontSize: 32, color: "#f59e0b" }}>{selectedPlatforms.length}</div>
                  <div className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>platforms targeted</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
