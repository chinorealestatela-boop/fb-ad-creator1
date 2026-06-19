import type { Platform } from "./types";

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `0:${s.toString().padStart(2, "0")}`;
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString("en-US", opts ?? { month: "short", day: "numeric", year: "numeric" });
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso, { month: "short", day: "numeric" });
}

export function scoreClass(score: number): string {
  if (score >= 75) return "score-high";
  if (score >= 50) return "score-med";
  return "score-low";
}

export function statusBadgeClass(status: string): string {
  switch (status) {
    case "published": return "badge-green";
    case "scheduled": return "badge-purple";
    case "draft": return "badge-gray";
    case "analyzing": return "badge-blue";
    case "failed": return "badge-red";
    default: return "badge-gray";
  }
}

export function priorityBadge(p: string): string {
  switch (p) {
    case "high": return "badge-red";
    case "medium": return "badge-yellow";
    default: return "badge-green";
  }
}

export const PLATFORM_META: Record<Platform, { label: string; abbr: string; cssClass: string; color: string }> = {
  instagram: { label: "Instagram", abbr: "IG", cssClass: "p-ig", color: "#e1306c" },
  facebook:  { label: "Facebook",  abbr: "FB", cssClass: "p-fb", color: "#1877f2" },
  youtube:   { label: "YouTube",   abbr: "YT", cssClass: "p-yt", color: "#ff0000" },
  tiktok:    { label: "TikTok",    abbr: "TT", cssClass: "p-tt", color: "#010101" },
  linkedin:  { label: "LinkedIn",  abbr: "LI", cssClass: "p-li", color: "#0a66c2" },
  twitter:   { label: "Twitter",   abbr: "X",  cssClass: "p-tw", color: "#1da1f2" },
  pinterest: { label: "Pinterest", abbr: "PT", cssClass: "p-pt", color: "#e60023" },
  threads:   { label: "Threads",   abbr: "TH", cssClass: "p-th", color: "#000" },
};

export function generateSchedule(totalPosts: number, postsPerDay: number, startDate = new Date()) {
  const days = Math.ceil(totalPosts / postsPerDay);
  const schedule: { date: Date; postsCount: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const count = Math.min(postsPerDay, totalPosts - i * postsPerDay);
    if (count > 0) schedule.push({ date: d, postsCount: count });
  }
  return schedule;
}
