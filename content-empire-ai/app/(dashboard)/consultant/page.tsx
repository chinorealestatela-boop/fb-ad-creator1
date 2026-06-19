"use client";

import { useState, useRef, useEffect } from "react";
import Header from "../../components/Header";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
}

const STARTER_MESSAGES: Message[] = [
  {
    id: "0",
    role: "ai",
    text: `👋 Welcome back! I'm your AI Growth Consultant.

I've analyzed your content library (52 pieces), your audience data, and your posting history across Instagram, Facebook, and YouTube.

Here's what I see right now:
• You have **82 days** of content scheduled — excellent runway.
• Your **viral score average is 74/100** — above industry benchmark.
• Your best-performing content type is **educational reels under 45 seconds**.
• You haven't posted on **Facebook in 4 days** — engagement is starting to drop.

What would you like to focus on today? I can help with:
• Growth strategy & forecasting
• Content mix optimization
• Revenue maximization
• Competitor benchmarking
• Platform-specific tactics`,
    time: "just now",
  },
];

const AI_RESPONSES: Record<string, string> = {
  default: `Great question. Based on your content data and audience insights, here's what I recommend:

Your audience engages best with **educational content in the 30–45 second range**, followed by storytelling content. Your current ratio is about 40% educational, 35% lifestyle, 25% sales — I'd suggest shifting to 55% educational to maximize your growth trajectory.

Also worth noting: your Tuesday and Thursday posts consistently outperform Monday and Friday posts by 28%. That's a pattern worth exploiting in your schedule.

Anything specific you want to dive deeper on?`,
  growth: `Here's your growth forecast based on current trajectory:

📈 **30-Day Projection:**
• Followers: 22.4K → 26.8K (+4.4K)
• Views: +18% month-over-month
• Engagement rate: holding at 4.7% (industry avg: 1.8%)

📈 **90-Day Projection (if you maintain 3 posts/day):**
• Followers: ~38K
• Monthly views: ~1.8M
• Est. monthly revenue: $8,400–$11,200

The single biggest lever: **consistency**. Accounts that post 3× daily for 90 days straight see 3.2× more algorithmic reach than accounts that post 1× daily.

Want me to build out a specific 90-day growth plan?`,
  revenue: `Your current revenue breakdown (est. $3,420/month):

💰 Instagram Partner Program: $1,240 (36%)
💰 YouTube AdSense: $890 (26%)
💰 Affiliate Commissions: $680 (20%)
💰 Sponsored Content: $420 (12%)
💰 Lead Generation: $190 (6%)

**Top 3 revenue opportunities I see:**

1. **YouTube monetization is underperforming.** Your watch time is high enough to qualify for mid-roll ads. Enabling these could add $300–$500/month.

2. **You're leaving affiliate money on the table.** Your audience buys tools — mortgage calculators, home search apps, renovation platforms. 3–5 affiliate links in your top content = est. $400–$700/month.

3. **Sponsored content rate is below market.** At 22K followers with 4.7% engagement, you should be charging $1,200–$2,500 per sponsored post. Current rate appears to be lower.

Want me to create a revenue optimization plan?`,
  competitor: `I analyzed 5 top real estate creators in the LA market for you:

**Creator benchmarks (similar follower tier):**
• Avg posting frequency: 2.1 posts/day (you: 3/day — advantage)
• Avg viral score: 68/100 (you: 74/100 — advantage)
• Avg engagement rate: 2.9% (you: 4.7% — strong advantage)
• Avg caption length: 112 words (you: 89 words — try slightly longer)

**Content gaps your competitors aren't covering:**
1. New construction vs. resale breakdowns
2. Interest rate impact calculators (visual content)
3. Behind-the-scenes listing preparation

These gaps are high-search, low-competition. Covering them could capture significant organic reach.`,
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("grow") || lower.includes("follower") || lower.includes("reach")) return AI_RESPONSES.growth;
  if (lower.includes("revenue") || lower.includes("money") || lower.includes("earn") || lower.includes("monetiz")) return AI_RESPONSES.revenue;
  if (lower.includes("competitor") || lower.includes("competition") || lower.includes("benchmark")) return AI_RESPONSES.competitor;
  return AI_RESPONSES.default;
}

export default function ConsultantPage() {
  const [messages, setMessages] = useState<Message[]>(STARTER_MESSAGES);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function send() {
    const text = input.trim();
    if (!text || thinking) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text, time: "just now" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: getAIResponse(text),
        time: "just now",
      };
      setMessages(prev => [...prev, aiMsg]);
      setThinking(false);
    }, 1800);
  }

  const QUICK_PROMPTS = [
    "What should I post this week?",
    "How can I grow faster?",
    "Maximize my revenue",
    "Competitor analysis",
    "Optimize my content mix",
    "Best posting times for me",
  ];

  return (
    <>
      <Header title="Growth AI" subtitle="Your always-on AI growth consultant and strategist" />
      <div className="page-body fade-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", padding: 0 }}>
        <div style={{ display: "flex", flex: 1, overflow: "hidden", gap: 0 }}>

          {/* Chat area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: 24 }}>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, paddingBottom: 8 }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  {msg.role === "ai" && (
                    <div
                      className="ai-pulse flex-shrink-0"
                      style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: "linear-gradient(135deg, #6c63ff, #a855f7)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16,
                      }}
                    >
                      🤖
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: "72%",
                      padding: "12px 16px",
                      borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: msg.role === "user"
                        ? "linear-gradient(135deg, #6c63ff, #a855f7)"
                        : "var(--surface-2)",
                      border: msg.role === "ai" ? "1px solid var(--border)" : "none",
                      color: "var(--text-primary)",
                      fontSize: 13.5,
                      lineHeight: 1.65,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.text.replace(/\*\*(.*?)\*\*/g, "$1")}
                  </div>
                  {msg.role === "user" && (
                    <div
                      style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: "linear-gradient(135deg, #6c63ff, #ec4899)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontWeight: 800, fontSize: 13, flexShrink: 0,
                      }}
                    >
                      C
                    </div>
                  )}
                </div>
              ))}

              {thinking && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: "linear-gradient(135deg, #6c63ff, #a855f7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, flexShrink: 0,
                  }}>
                    🤖
                  </div>
                  <div style={{ padding: "12px 16px", borderRadius: "14px 14px 14px 4px", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          style={{
                            width: 6, height: 6, borderRadius: "50%", background: "var(--accent)",
                            animation: `aiPulse 1.2s ease ${i * 0.2}s infinite`,
                            display: "inline-block",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            <div className="flex flex-wrap gap-2 my-3">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  className="badge badge-gray"
                  style={{ cursor: "pointer", padding: "5px 12px", fontSize: 12, fontWeight: 500 }}
                  onClick={() => { setInput(p); }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                className="input"
                placeholder="Ask your AI Growth Consultant anything…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                disabled={thinking}
              />
              <button
                className="btn btn-gradient"
                onClick={send}
                disabled={thinking || !input.trim()}
                style={{ flexShrink: 0 }}
              >
                Send →
              </button>
            </div>
          </div>

          {/* Right sidebar — context */}
          <div
            className="hide-mobile"
            style={{
              width: 280, flexShrink: 0,
              borderLeft: "1px solid var(--border)",
              padding: 20,
              overflowY: "auto",
              display: "flex", flexDirection: "column", gap: 16,
            }}
          >
            <div>
              <div className="ai-chip mb-3">✦ Account Context</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Niche", value: "Real Estate" },
                  { label: "Location", value: "Los Angeles, CA" },
                  { label: "Audience", value: "28–50, professionals" },
                  { label: "Goal", value: "Grow to 50K followers" },
                  { label: "Revenue Goal", value: "$5K/month" },
                  { label: "Posts/day", value: "3" },
                ].map(s => (
                  <div key={s.label} className="flex justify-between">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</span>
                    <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <hr className="divider" />
            <div>
              <div className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Current Performance</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Viral Score Avg", value: "74/100", color: "#6c63ff" },
                  { label: "Engagement Rate", value: "4.7%", color: "#10b981" },
                  { label: "Content Runway", value: "82 days", color: "#f59e0b" },
                  { label: "Monthly Revenue", value: "$3,420", color: "#ec4899" },
                ].map(s => (
                  <div key={s.label} className="flex justify-between">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</span>
                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <hr className="divider" />
            <div>
              <div className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>AI Capabilities</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  "Growth forecasting",
                  "Content strategy",
                  "Revenue optimization",
                  "Competitor analysis",
                  "Posting schedule advice",
                  "Caption feedback",
                  "Trend identification",
                  "Audience insights",
                ].map(cap => (
                  <div key={cap} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span style={{ color: "#10b981" }}>✓</span> {cap}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
