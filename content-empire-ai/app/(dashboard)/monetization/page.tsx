"use client";

import Header from "../../components/Header";
import { SAMPLE_ANALYTICS, SAMPLE_CONTENT } from "../../lib/data";
import { formatCurrency, formatNumber, PLATFORM_META } from "../../lib/utils";

export default function MonetizationPage() {
  const totalRevenue = SAMPLE_ANALYTICS.reduce((a, d) => a + d.revenue, 0);
  const avgDailyRevenue = totalRevenue / SAMPLE_ANALYTICS.length;

  const topMonetizable = SAMPLE_CONTENT
    .filter(c => c.status === "published")
    .sort((a, b) => b.monetizationScore - a.monetizationScore)
    .slice(0, 6);

  const revenueStreams = [
    { name: "Instagram Partner Program", amount: 1240, pct: 36, color: "#e1306c", icon: "📸" },
    { name: "YouTube AdSense", amount: 890, pct: 26, color: "#ff0000", icon: "▶" },
    { name: "Affiliate Commissions", amount: 680, pct: 20, color: "#f59e0b", icon: "🔗" },
    { name: "Sponsored Content", amount: 420, pct: 12, color: "#6c63ff", icon: "🤝" },
    { name: "Lead Generation", amount: 190, pct: 6, color: "#10b981", icon: "🏡" },
  ];

  return (
    <>
      <Header title="Monetization Engine" subtitle="Track revenue and maximize earnings from your content" />
      <div className="page-body fade-in">

        {/* Revenue KPIs */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            { label: "Monthly Revenue", value: formatCurrency(3420), change: "+18%", color: "#f59e0b", icon: "💰" },
            { label: "Avg Revenue / Post", value: "$71.25", change: "+12%", color: "#10b981", icon: "📊" },
            { label: "Projected Annual", value: formatCurrency(41040), change: "+24%", color: "#6c63ff", icon: "📈" },
            { label: "Revenue per 1K Views", value: "$2.74", change: "+8%", color: "#ec4899", icon: "👁" },
          ].map(k => (
            <div key={k.label} className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase font-semibold mb-2" style={{ color: "var(--text-muted)", letterSpacing: "0.06em" }}>{k.label}</div>
                  <div className="font-black" style={{ fontSize: 24, color: "var(--text-primary)", lineHeight: 1 }}>{k.value}</div>
                  <div className="text-xs mt-2" style={{ color: "var(--success)", fontWeight: 700 }}>▲ {k.change} this month</div>
                </div>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: `${k.color}18`,
                  border: `1px solid ${k.color}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}>
                  {k.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: "1fr 320px" }}>

          {/* Revenue by stream */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Revenue Streams</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {revenueStreams.map(s => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 16 }}>{s.icon}</span>
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{s.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm" style={{ color: s.color }}>{formatCurrency(s.amount)}</span>
                      <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>{s.pct}%</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-3 mt-1" style={{ borderTop: "1px solid var(--border)" }}>
                <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Total</span>
                <span className="font-black" style={{ color: "#f59e0b", fontSize: 18 }}>{formatCurrency(3420)}</span>
              </div>
            </div>
          </div>

          {/* Monthly revenue chart */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Revenue Over Time</h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120, marginBottom: 8 }}>
              {SAMPLE_ANALYTICS.slice(-14).map((d, i) => {
                const maxRev = Math.max(...SAMPLE_ANALYTICS.map(x => x.revenue));
                const h = (d.revenue / maxRev) * 108;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1, borderRadius: "4px 4px 0 0",
                      background: "linear-gradient(180deg, #f59e0b, #d97706)",
                      height: Math.max(h, 4), minHeight: 4, opacity: 0.8 + (i / 14 * 0.2),
                    }}
                    title={`$${d.revenue.toFixed(0)}`}
                  />
                );
              })}
            </div>
            <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                <span>14 days ago</span><span>Today</span>
              </div>
              <div className="flex justify-between mt-3">
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Avg daily</div>
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>{formatCurrency(avgDailyRevenue)}</div>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>30-day total</div>
                  <div className="font-bold" style={{ color: "#f59e0b" }}>{formatCurrency(totalRevenue)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top monetizable content */}
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Top Monetizable Content</h3>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Ranked by monetization score</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topMonetizable.map((item, i) => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
                <span className="font-black text-sm" style={{ width: 20, color: i < 3 ? "#f59e0b" : "var(--text-muted)" }}>{i + 1}</span>
                <div className={`bg-gradient-to-br ${item.thumbnailGradient} rounded-lg flex-shrink-0`}
                  style={{ width: 48, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18, color: "white" }}>▶</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.platforms.slice(0, 2).map(p => (
                      <span key={p} className={`platform-icon ${PLATFORM_META[p].cssClass}`} style={{ width: 16, height: 16, fontSize: 8 }}>
                        {PLATFORM_META[p].abbr}
                      </span>
                    ))}
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.category}</span>
                  </div>
                </div>
                <div className="text-right hide-mobile">
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{formatNumber(item.views ?? 0)} views</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>est. {formatCurrency(((item.views ?? 0) / 1000) * 2.74)}</div>
                </div>
                <div
                  className="score-ring score-high flex-shrink-0"
                  style={{ width: 36, height: 36, fontSize: 11 }}
                >
                  {item.monetizationScore}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue recommendations */}
        <div className="card p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--text-primary)" }}>💡 AI Revenue Recommendations</h3>
          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {[
              {
                icon: "📈",
                title: "Boost educational content by 40%",
                desc: "Your audience converts 3× higher on educational posts. Increasing this mix could add $820/month.",
                action: "Adjust Mix",
              },
              {
                icon: "🔗",
                title: "Add affiliate links to top 10 posts",
                desc: "Estimated $340–$580/month in commission from real estate tools your audience already uses.",
                action: "Set Up Links",
              },
              {
                icon: "🤝",
                title: "3 brand deals available in your niche",
                desc: "AI found 3 relevant brands reaching out to LA real estate creators at your follower tier.",
                action: "View Deals",
              },
              {
                icon: "📊",
                title: "Enable YouTube Monetization",
                desc: "You qualify for the YouTube Partner Program. Estimated $450–$900/month based on watch time.",
                action: "Apply Now",
              },
            ].map(r => (
              <div key={r.title} className="p-4 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div className="flex items-start gap-3">
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{r.icon}</span>
                  <div>
                    <div className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{r.title}</div>
                    <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{r.desc}</p>
                    <button className="btn btn-primary btn-xs">{r.action}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
