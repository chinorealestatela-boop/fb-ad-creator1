"use client";

import { useState } from "react";
import Header from "../../components/Header";
import { SAMPLE_CONTENT } from "../../lib/data";
import type { CaptionStyle, Platform } from "../../lib/types";
import { PLATFORM_META } from "../../lib/utils";

const STYLE_OPTIONS: { id: CaptionStyle; label: string; icon: string; desc: string }[] = [
  { id: "viral",        label: "Viral Hook",     icon: "🚀", desc: "Pattern interrupts and scroll-stoppers" },
  { id: "storytelling", label: "Storytelling",   icon: "📖", desc: "Narrative-driven emotional captions" },
  { id: "educational",  label: "Educational",    icon: "🎓", desc: "Teach, inform, and add value" },
  { id: "motivational", label: "Motivational",   icon: "💪", desc: "Inspire and energize your audience" },
  { id: "sales",        label: "Sales",          icon: "💰", desc: "Drive leads and conversions" },
  { id: "humorous",     label: "Humorous",       icon: "😂", desc: "Funny, relatable, shareable" },
  { id: "personal",     label: "Personal Brand", icon: "✨", desc: "Authentic and personality-driven" },
];

const GENERATED_CAPTIONS: Record<CaptionStyle, string> = {
  viral: `🚨 This is NOT what they tell you about buying a home in LA.

Most buyers lose $50K+ because of this one mistake…

And 9 out of 10 agents won't tell you about it.

Here's everything you need to know before you sign anything 👇

(Save this. You'll thank yourself later.)

#realestate #losangeles #homebuying #firsttimehomebuyer #realtor`,

  storytelling: `In 2018, I had $3,000 to my name and zero credit.

Today I helped my 500th client close on their dream home.

Here's the turning point nobody talks about…

My first client was a single mom who told me she could never afford a home in LA.

12 months later, she sent me a photo of her daughter's first birthday party — in their new backyard.

That's why I do this.

Your story isn't over. Let's write the next chapter. 🏡

#realestate #losangeles #homebuying #realtor #dreamhome`,

  educational: `📚 5 things every first-time homebuyer in LA needs to know:

1️⃣ Pre-approval ≠ final approval. Get pre-underwritten instead.

2️⃣ The down payment isn't your only cost. Budget 3–5% for closing costs.

3️⃣ Your agent's commission is usually paid by the SELLER.

4️⃣ A home inspection is non-negotiable. Always.

5️⃣ Rate locks exist. Use them.

Save this post. Share it with someone buying a home.

Which one surprised you most? Comment below 👇

#realestate #homebuying #losangeles #firsttimehomebuyer #realtor`,

  motivational: `The market won't wait. Your dreams won't either. 🏡

Every month you wait is another month someone else moves into YOUR home.

You're closer than you think.

One conversation can change everything.

Comment "READY" and let's make it happen. 💪

#realestate #losangeles #homeownership #motivation #realtor`,

  sales: `🏡 Are you still renting?

Every month you pay rent, you're building your landlord's wealth — not yours.

The average LA renter pays $2,400/month = $28,800/year.

That's $288,000 over 10 years… with ZERO equity.

My clients are buying homes with as little as 3.5% down.

DM me "HOME" right now and I'll show you exactly how.

Spots are limited — I work with 5 new buyers per month.

#realestate #losangeles #homebuying #realestateinvesting #realtor`,

  humorous: `POV: Your landlord just raised your rent for the 4th time in 3 years 😂

Meanwhile, me: "Oh that's cute. Let me show you how to buy the building."

Real talk though — if your rent has gone up more than your salary, it's time to have a different conversation.

Drop a 🏠 if you're ready to stop being a professional rent-payer.

#realestate #losangeles #rentlife #homebuying #realtor`,

  personal: `I almost quit in my second year.

Zero clients. Maxed credit card. Seriously questioning everything.

Then a mentor told me: "Stop trying to be a salesperson. Just be the most helpful person in the room."

Changed everything.

Today I share everything I know — the good, bad, and ugly of LA real estate — because that mentor was right.

What's something you wish someone had told you earlier in your career?

#realestate #personalbranding #realtor #losangeles #entrepreneurlife`,
};

const PLATFORM_LIST: Platform[] = ["instagram", "facebook", "youtube", "tiktok", "linkedin"];

export default function CaptionsPage() {
  const [selectedStyle, setSelectedStyle] = useState<CaptionStyle>("viral");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("instagram");
  const [selectedContent, setSelectedContent] = useState(SAMPLE_CONTENT[0] ?? null);
  const [generating, setGenerating] = useState(false);
  const [caption, setCaption] = useState(GENERATED_CAPTIONS["viral"]);
  const [copied, setCopied] = useState(false);

  function generate() {
    setGenerating(true);
    setTimeout(() => {
      setCaption(GENERATED_CAPTIONS[selectedStyle]);
      setGenerating(false);
    }, 1200);
  }

  function copy() {
    navigator.clipboard?.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Header title="Caption Studio" subtitle="AI-powered caption generator for every platform and style" />
      <div className="page-body fade-in">
        <div className="grid gap-6" style={{ gridTemplateColumns: "320px 1fr" }}>

          {/* Left: Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Content selector */}
            <div className="card p-4">
              <h3 className="font-semibold text-xs mb-3" style={{ color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Select Content
              </h3>
              {SAMPLE_CONTENT.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>No content yet — upload content to your library first.</p>
              ) : (
                <select
                  className="input input-sm"
                  onChange={e => {
                    const c = SAMPLE_CONTENT.find(x => x.id === e.target.value);
                    if (c) setSelectedContent(c);
                  }}
                >
                  {SAMPLE_CONTENT.slice(0, 12).map(c => (
                    <option key={c.id} value={c.id}>{c.title.slice(0, 40)}…</option>
                  ))}
                </select>
              )}
            </div>

            {/* Platform */}
            <div className="card p-4">
              <h3 className="font-semibold text-xs mb-3" style={{ color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Platform
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {PLATFORM_LIST.map(p => {
                  const meta = PLATFORM_META[p];
                  const active = selectedPlatform === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setSelectedPlatform(p)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                      style={{
                        background: active ? "rgba(108,99,255,0.12)" : "transparent",
                        border: `1px solid ${active ? "rgba(108,99,255,0.3)" : "transparent"}`,
                        color: active ? "var(--accent-light)" : "var(--text-secondary)",
                        transition: "all 0.13s", fontWeight: active ? 600 : 400,
                      }}
                    >
                      <span className={`platform-icon ${meta.cssClass}`} style={{ width: 20, height: 20, fontSize: 10 }}>{meta.abbr}</span>
                      {meta.label}
                      {active && <span style={{ marginLeft: "auto" }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Style */}
            <div className="card p-4">
              <h3 className="font-semibold text-xs mb-3" style={{ color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Caption Style
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {STYLE_OPTIONS.map(s => {
                  const active = selectedStyle === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStyle(s.id)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left"
                      style={{
                        background: active ? "rgba(108,99,255,0.12)" : "transparent",
                        border: `1px solid ${active ? "rgba(108,99,255,0.3)" : "transparent"}`,
                        color: active ? "var(--accent-light)" : "var(--text-secondary)",
                        transition: "all 0.13s",
                      }}
                    >
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
                      <div>
                        <div className="text-xs font-semibold">{s.label}</div>
                        <div style={{ fontSize: 10, color: active ? "var(--accent-light)" : "var(--text-muted)", opacity: 0.8 }}>{s.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Generated caption */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Content preview + generate */}
            <div className="card p-4 flex items-center gap-4">
              {selectedContent ? (
                <>
                  <div
                    className={`bg-gradient-to-br ${selectedContent.thumbnailGradient} rounded-xl flex-shrink-0`}
                    style={{ width: 70, height: 54, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <span style={{ fontSize: 24, color: "white" }}>▶</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{selectedContent.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge badge-purple">{selectedContent.category}</span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>Viral score: {selectedContent.viralScore}/100</span>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1 }}>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Upload content to generate captions from your library.</p>
                </div>
              )}
              <button
                className="btn btn-gradient"
                onClick={generate}
                disabled={generating}
                style={{ flexShrink: 0 }}
              >
                {generating ? <><span className="spin">◌</span> Generating…</> : "✦ Generate Caption"}
              </button>
            </div>

            {/* Generated caption */}
            <div className="card p-5" style={{ flex: 1 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`platform-icon ${PLATFORM_META[selectedPlatform].cssClass}`}>
                    {PLATFORM_META[selectedPlatform].abbr}
                  </span>
                  <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {PLATFORM_META[selectedPlatform].label} Caption
                  </span>
                  <span className="badge badge-purple">{STYLE_OPTIONS.find(s => s.id === selectedStyle)?.label}</span>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-outline btn-sm" onClick={copy}>
                    {copied ? "✓ Copied!" : "⎘ Copy"}
                  </button>
                  <button className="btn btn-primary btn-sm">📅 Schedule</button>
                </div>
              </div>

              {generating ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[120, 80, 100, 60, 90, 70, 110, 50].map((w, i) => (
                    <div key={i} className="shimmer rounded" style={{ height: 14, width: `${w}%` }} />
                  ))}
                </div>
              ) : (
                <textarea
                  className="input"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  style={{ minHeight: 340, lineHeight: 1.7, fontSize: 13.5 }}
                />
              )}

              {!generating && (
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>{caption.length} chars</span>
                    <span>{caption.split("\n").filter(Boolean).length} lines</span>
                    <span>{(caption.match(/#\w+/g) || []).length} hashtags</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-xs" onClick={generate}>↻ Regenerate</button>
                    <button className="btn btn-ghost btn-xs">+ Variation</button>
                  </div>
                </div>
              )}
            </div>

            {/* Hashtag suggestions */}
            <div className="card p-4">
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>AI Hashtag Suggestions</h3>
              <div className="flex flex-wrap gap-2">
                {(selectedContent?.aiAnalysis?.suggestedHashtags ?? ["#realestate", "#losangeles", "#homebuying", "#realtor", "#investment", "#property", "#luxuryhomes", "#firsttimehomebuyer"]).map(tag => (
                  <button
                    key={tag}
                    className="badge badge-gray"
                    style={{ cursor: "pointer", fontSize: 12, padding: "4px 10px" }}
                    onClick={() => setCaption(prev => prev + "\n" + tag)}
                  >
                    {tag} +
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
