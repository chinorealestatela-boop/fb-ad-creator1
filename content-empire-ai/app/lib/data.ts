import type {
  ContentItem, ScheduledPost, DailyAnalytics,
  AIRecommendation, PlatformConnection, TeamMember, UserProfile
} from "./types";

// ── Demo content feed ────────────────────────────────────────────────────────

export const SAMPLE_CONTENT: ContentItem[] = [
  {
    id: "c1", title: "Inside a $4.2M Beverly Hills Mansion (Full Tour)", type: "reel",
    thumbnailGradient: "from-purple-600 to-pink-500", status: "published",
    platforms: ["instagram", "tiktok", "youtube"],
    publishedAt: "2026-06-20T10:00:00Z", category: "Home Tour",
    caption: "POV: walking through a $4.2M Beverly Hills mansion 🏡✨ Drop a 🔥 if you'd live here!",
    hashtags: ["#BeverlyHills","#LuxuryRealEstate","#HomeTouur","#LA","#RealEstate"],
    viralScore: 97, engagementScore: 94, monetizationScore: 91, durationSec: 58,
    views: 1240000, likes: 89400, comments: 3200, shares: 14700, reach: 1820000, followersGained: 4200,
    createdAt: "2026-06-19T08:00:00Z", aiAnalyzed: true,
  },
  {
    id: "c2", title: "LA Real Estate Market Update — June 2026", type: "video",
    thumbnailGradient: "from-blue-600 to-cyan-400", status: "published",
    platforms: ["youtube", "facebook", "instagram"],
    publishedAt: "2026-06-18T14:00:00Z", category: "Market Update",
    caption: "The LA market just shifted. Here's what buyers & sellers need to know RIGHT NOW 👇",
    hashtags: ["#LAHousing","#RealEstateMarket","#HomeBuying","#LosAngeles","#2026Housing"],
    viralScore: 88, engagementScore: 86, monetizationScore: 92, durationSec: 487,
    views: 342000, likes: 18200, comments: 2870, shares: 5400, reach: 490000, followersGained: 1800,
    createdAt: "2026-06-17T10:00:00Z", aiAnalyzed: true,
  },
  {
    id: "c3", title: "3 Mistakes First-Time Buyers Make in LA", type: "reel",
    thumbnailGradient: "from-orange-500 to-red-500", status: "published",
    platforms: ["instagram", "tiktok", "facebook"],
    publishedAt: "2026-06-15T09:00:00Z", category: "Buyer Tips",
    caption: "Don't make these mistakes! 🚫 First-time buyers in LA — watch this before you make an offer.",
    hashtags: ["#FirstTimeBuyer","#LAHomes","#HomebuYingTips","#RealEstateLA","#BuyerTips"],
    viralScore: 93, engagementScore: 90, monetizationScore: 85, durationSec: 44,
    views: 876000, likes: 62100, comments: 4100, shares: 11200, reach: 1200000, followersGained: 3100,
    createdAt: "2026-06-14T08:00:00Z", aiAnalyzed: true,
  },
  {
    id: "c4", title: "Venice Beach Condo Walk-Through — $1.8M", type: "reel",
    thumbnailGradient: "from-teal-500 to-emerald-400", status: "published",
    platforms: ["instagram", "tiktok"],
    publishedAt: "2026-06-12T11:00:00Z", category: "Home Tour",
    caption: "Ocean views + rooftop 🌊 Would you pay $1.8M for this Venice Beach condo?",
    hashtags: ["#Venice","#VeniceBeach","#CondoLife","#LuxuryLiving","#LAView"],
    viralScore: 91, engagementScore: 88, monetizationScore: 82, durationSec: 51,
    views: 621000, likes: 48300, comments: 2900, shares: 8700, reach: 890000, followersGained: 2400,
    createdAt: "2026-06-11T09:00:00Z", aiAnalyzed: true,
  },
  {
    id: "c5", title: "How I Closed 3 Deals in One Week", type: "video",
    thumbnailGradient: "from-violet-600 to-purple-400", status: "published",
    platforms: ["youtube", "facebook"],
    publishedAt: "2026-06-10T13:00:00Z", category: "Agent Life",
    caption: "The exact strategy I used to close 3 deals in 7 days. Real numbers, no fluff.",
    hashtags: ["#RealEstateAgent","#ClosingDeals","#RealtorLife","#LAAgent","#Success"],
    viralScore: 85, engagementScore: 82, monetizationScore: 96, durationSec: 720,
    views: 198000, likes: 14200, comments: 3800, shares: 4200, reach: 290000, followersGained: 1200,
    createdAt: "2026-06-09T08:00:00Z", aiAnalyzed: true,
  },
  {
    id: "c6", title: "Silver Lake Craftsman — $2.1M (Off Market)", type: "reel",
    thumbnailGradient: "from-pink-500 to-rose-400", status: "published",
    platforms: ["instagram", "tiktok", "facebook"],
    publishedAt: "2026-06-08T10:00:00Z", category: "Home Tour",
    caption: "This Silver Lake gem just hit my off-market list 🏡 DM me for access!",
    hashtags: ["#SilverLake","#OffMarket","#LosAngelesHomes","#DreamHome","#LARealestate"],
    viralScore: 89, engagementScore: 87, monetizationScore: 94, durationSec: 62,
    views: 412000, likes: 31800, comments: 5200, shares: 7800, reach: 620000, followersGained: 2100,
    createdAt: "2026-06-07T08:00:00Z", aiAnalyzed: true,
  },
  {
    id: "c7", title: "What $1M Gets You in LA vs Texas vs Florida", type: "reel",
    thumbnailGradient: "from-amber-500 to-yellow-400", status: "published",
    platforms: ["instagram", "tiktok", "youtube", "facebook"],
    publishedAt: "2026-06-05T09:00:00Z", category: "Market Comparison",
    caption: "You won't believe what $1M gets you in these 3 states 😳 Part 2 coming soon!",
    hashtags: ["#RealEstateComparison","#MillionDollarHome","#LAvsTexas","#RealEstate2026"],
    viralScore: 96, engagementScore: 93, monetizationScore: 88, durationSec: 39,
    views: 2100000, likes: 187000, comments: 12400, shares: 38000, reach: 3100000, followersGained: 8900,
    createdAt: "2026-06-04T07:00:00Z", aiAnalyzed: true,
  },
  {
    id: "c8", title: "Hollywood Hills Home — Stunning City Views", type: "reel",
    thumbnailGradient: "from-indigo-600 to-blue-400", status: "published",
    platforms: ["instagram", "tiktok"],
    publishedAt: "2026-06-03T11:00:00Z", category: "Home Tour",
    caption: "City lights every night from your living room 🌆 This Hollywood Hills home is everything.",
    hashtags: ["#HollywoodHills","#CityView","#LuxuryHome","#LALiving","#DreamHouse"],
    viralScore: 90, engagementScore: 88, monetizationScore: 84, durationSec: 55,
    views: 530000, likes: 41200, comments: 3100, shares: 9200, reach: 780000, followersGained: 2700,
    createdAt: "2026-06-02T09:00:00Z", aiAnalyzed: true,
  },
  {
    id: "c9", title: "5 Negotiation Tricks That Save Buyers $50K+", type: "video",
    thumbnailGradient: "from-green-600 to-teal-400", status: "published",
    platforms: ["youtube", "facebook", "instagram"],
    publishedAt: "2026-06-01T14:00:00Z", category: "Buyer Tips",
    caption: "These 5 negotiation moves have saved my clients over $2M combined. Watch before your next offer.",
    hashtags: ["#Negotiation","#HomebuYing","#RealEstateTips","#SaveMoney","#LAHomes"],
    viralScore: 87, engagementScore: 89, monetizationScore: 95, durationSec: 614,
    views: 267000, likes: 22400, comments: 4700, shares: 6800, reach: 410000, followersGained: 1600,
    createdAt: "2026-05-31T08:00:00Z", aiAnalyzed: true,
  },
  {
    id: "c10", title: "Malibu Beachfront — $8.9M Dream Home", type: "reel",
    thumbnailGradient: "from-cyan-500 to-sky-400", status: "published",
    platforms: ["instagram", "tiktok", "youtube"],
    publishedAt: "2026-05-28T10:00:00Z", category: "Home Tour",
    caption: "Waking up to THIS every morning 🌊☀️ The Malibu beachfront life is real. $8.9M. Worth it?",
    hashtags: ["#Malibu","#BeachfrontProperty","#LuxuryRealEstate","#MalibuHome","#CoastalLiving"],
    viralScore: 99, engagementScore: 97, monetizationScore: 93, durationSec: 71,
    views: 3800000, likes: 312000, comments: 21000, shares: 67000, reach: 5200000, followersGained: 14200,
    createdAt: "2026-05-27T07:00:00Z", aiAnalyzed: true,
  },
  {
    id: "c11", title: "Weekly Open House Recap — 4 Properties", type: "video",
    thumbnailGradient: "from-rose-500 to-pink-400", status: "scheduled",
    platforms: ["youtube", "facebook"],
    scheduledAt: "2026-06-27T14:00:00Z", category: "Open House",
    caption: "Recapping this week's 4 open houses — one of them is a STEAL at that price.",
    hashtags: ["#OpenHouse","#LAHomes","#WeeklyRecap","#RealEstate","#HomeShopping"],
    viralScore: 78, engagementScore: 75, monetizationScore: 88, durationSec: 540,
    createdAt: "2026-06-24T09:00:00Z", aiAnalyzed: true,
  },
  {
    id: "c12", title: "Is Now a Good Time to Buy in LA?", type: "reel",
    thumbnailGradient: "from-purple-500 to-indigo-400", status: "scheduled",
    platforms: ["instagram", "tiktok", "facebook"],
    scheduledAt: "2026-06-26T09:00:00Z", category: "Market Update",
    caption: "Everyone's asking me this. Here's my honest answer 👇 #realestate",
    hashtags: ["#LAMarket","#BuyOrRent","#RealEstate2026","#LAHousing","#HomeBuying"],
    viralScore: 88, engagementScore: 84, monetizationScore: 86, durationSec: 47,
    createdAt: "2026-06-23T11:00:00Z", aiAnalyzed: true,
  },
  {
    id: "c13", title: "$500K Budget in LA — What Can You Actually Get?", type: "reel",
    thumbnailGradient: "from-orange-400 to-amber-300", status: "scheduled",
    platforms: ["instagram", "tiktok"],
    scheduledAt: "2026-06-25T10:00:00Z", category: "Market Update",
    caption: "Half a million in LA — your options might surprise you 😮",
    hashtags: ["#LAHomes","#AffordableHomes","#FirstTimeBuyer","#LArealestate"],
    viralScore: 91, engagementScore: 87, monetizationScore: 80, durationSec: 52,
    createdAt: "2026-06-22T09:00:00Z", aiAnalyzed: false,
  },
  {
    id: "c14", title: "Day in the Life: LA Real Estate Agent", type: "video",
    thumbnailGradient: "from-violet-500 to-fuchsia-400", status: "draft",
    platforms: ["youtube", "instagram"],
    category: "Agent Life",
    caption: "Follow me through a full day — showings, negotiations, closing. This is the real life.",
    hashtags: ["#DayInTheLife","#RealtorLife","#LAAgent","#BehindTheScenes"],
    viralScore: 82, engagementScore: 79, monetizationScore: 88, durationSec: 892,
    createdAt: "2026-06-24T15:00:00Z", aiAnalyzed: false,
  },
  {
    id: "c15", title: "Brentwood Gem — $3.4M Just Listed", type: "reel",
    thumbnailGradient: "from-emerald-500 to-green-400", status: "draft",
    platforms: ["instagram", "tiktok", "facebook"],
    category: "Home Tour",
    caption: "Just listed in Brentwood — $3.4M and it won't last. Swipe up for details.",
    hashtags: ["#Brentwood","#JustListed","#LuxuryHomes","#LArealestate","#BrentwoodLA"],
    viralScore: 86, engagementScore: 83, monetizationScore: 91, durationSec: 58,
    createdAt: "2026-06-24T12:00:00Z", aiAnalyzed: false,
  },
];

// ── Daily analytics (90 days of data) ────────────────────────────────────────

function makeDayAnalytics(date: string, base: number): DailyAnalytics {
  const v = (n: number, jitter = 0.25) => Math.round(n * (1 + (Math.random() - 0.5) * jitter));
  return {
    date,
    views:           v(base * 28000),
    reach:           v(base * 38000),
    likes:           v(base * 2100),
    comments:        v(base * 180),
    shares:          v(base * 420),
    followersGained: v(base * 95),
    revenue:         v(base * 1480),
    impressions:     v(base * 52000),
    watchTimeMinutes:v(base * 6800),
  };
}

export const SAMPLE_ANALYTICS: DailyAnalytics[] = Array.from({ length: 90 }, (_, i) => {
  const d = new Date("2026-06-25");
  d.setDate(d.getDate() - (89 - i));
  const dateStr = d.toISOString().slice(0, 10);
  // Trend: gradual growth over 90 days
  const trend = 0.6 + (i / 89) * 0.7;
  // Spike days (viral posts)
  const spike = [6, 14, 21, 28, 42, 55, 70, 83].includes(i) ? 3.2 : 1;
  return makeDayAnalytics(dateStr, trend * spike);
});

// ── Scheduled posts ───────────────────────────────────────────────────────────

export const SAMPLE_SCHEDULED_POSTS: ScheduledPost[] = [
  {
    id: "s1", contentId: "c13", contentTitle: "$500K Budget in LA — What Can You Actually Get?",
    platform: "instagram", scheduledAt: "2026-06-25T10:00:00Z",
    caption: "Half a million in LA — your options might surprise you 😮",
    hashtags: ["#LAHomes","#FirstTimeBuyer"], status: "pending",
    thumbnailGradient: "from-orange-400 to-amber-300",
  },
  {
    id: "s2", contentId: "c13", contentTitle: "$500K Budget in LA — What Can You Actually Get?",
    platform: "tiktok", scheduledAt: "2026-06-25T10:05:00Z",
    caption: "Half a million in LA — your options might surprise you 😮",
    hashtags: ["#LAHomes","#FirstTimeBuyer"], status: "pending",
    thumbnailGradient: "from-orange-400 to-amber-300",
  },
  {
    id: "s3", contentId: "c12", contentTitle: "Is Now a Good Time to Buy in LA?",
    platform: "instagram", scheduledAt: "2026-06-26T09:00:00Z",
    caption: "Everyone's asking me this. Here's my honest answer 👇",
    hashtags: ["#LAMarket","#BuyOrRent"], status: "pending",
    thumbnailGradient: "from-purple-500 to-indigo-400",
  },
  {
    id: "s4", contentId: "c12", contentTitle: "Is Now a Good Time to Buy in LA?",
    platform: "tiktok", scheduledAt: "2026-06-26T09:05:00Z",
    caption: "Everyone's asking me this. Here's my honest answer 👇",
    hashtags: ["#LAMarket","#BuyOrRent"], status: "pending",
    thumbnailGradient: "from-purple-500 to-indigo-400",
  },
  {
    id: "s5", contentId: "c12", contentTitle: "Is Now a Good Time to Buy in LA?",
    platform: "facebook", scheduledAt: "2026-06-26T09:10:00Z",
    caption: "Everyone's asking me this. Here's my honest answer 👇",
    hashtags: ["#LAMarket","#BuyOrRent"], status: "pending",
    thumbnailGradient: "from-purple-500 to-indigo-400",
  },
  {
    id: "s6", contentId: "c11", contentTitle: "Weekly Open House Recap — 4 Properties",
    platform: "youtube", scheduledAt: "2026-06-27T14:00:00Z",
    caption: "Recapping this week's 4 open houses — one is a STEAL.",
    hashtags: ["#OpenHouse","#LAHomes"], status: "pending",
    thumbnailGradient: "from-rose-500 to-pink-400",
  },
];

// ── AI Recommendations ────────────────────────────────────────────────────────

export const AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: "r1", type: "viral", priority: "high", icon: "🔥",
    title: "Repost your $1M comparison reel NOW",
    message: "Your '$1M in LA vs TX vs FL' reel (2.1M views) hit its 3-week mark — reposting typically gets 40–60% of original reach. Strike while the algorithm still remembers it.",
    action: "Repost to TikTok & Instagram",
  },
  {
    id: "r2", type: "trend", priority: "high", icon: "📈",
    title: "Trending: 'Luxury Home Tours' up 340% this week",
    message: "Home tour reels are exploding right now on TikTok. Your Malibu content performed 3x better than average — create 2 more tour reels this week.",
    action: "Schedule Home Tour Content",
  },
  {
    id: "r3", type: "monetization", priority: "high", icon: "💰",
    title: "YouTube Partner threshold crossed",
    message: "You've exceeded 1,000 subscribers and 4,000 watch hours. Apply for YouTube Partner Program today to start earning ad revenue on your 342K-view market update.",
    action: "Apply for YouTube Partner",
  },
  {
    id: "r4", type: "strategy", priority: "medium", icon: "🎯",
    title: "Best time to post: Tuesdays & Thursdays 9–11am",
    message: "Your last 30 days of data shows 47% higher engagement on Tuesday/Thursday mornings. Your next 3 posts are scheduled for these windows — good job!",
    action: "View Posting Schedule",
  },
  {
    id: "r5", type: "content", priority: "medium", icon: "✦",
    title: "Create a 'Buyer vs Seller Market' explainer",
    message: "Comments on your market update ask 'is it a buyer or seller market?' 847 times. Turn that question into its own video — guaranteed engagement.",
    action: "Generate Content Brief",
  },
  {
    id: "r6", type: "repost", priority: "low", icon: "↻",
    title: "Recycle your negotiation tips video",
    message: "Your '5 Negotiation Tricks' video (267K views) is 25 days old. Clip the top 3 tips into a short reel and repost — clips of long-form get 2x the saves.",
    action: "Create Clip",
  },
];

// ── Platform connections ───────────────────────────────────────────────────────

export const PLATFORM_CONNECTIONS: PlatformConnection[] = [
  { platform: "instagram", connected: true,  accountName: "@chinorealestatela", followers: 42800 },
  { platform: "facebook",  connected: true,  accountName: "Chino Real Estate LA", followers: 8200  },
  { platform: "youtube",   connected: true,  accountName: "Chino Real Estate LA", followers: 28500 },
  { platform: "tiktok",    connected: true,  accountName: "@chinorealestatela",   followers: 6300  },
  { platform: "linkedin",  connected: false },
  { platform: "twitter",   connected: false },
  { platform: "pinterest", connected: false },
  { platform: "threads",   connected: false },
];

// ── Team ──────────────────────────────────────────────────────────────────────

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "u1", name: "Chino R.", email: "chino.realestatela@gmail.com", role: "admin", joinedAt: "2026-01-01" },
];

// ── User profile ──────────────────────────────────────────────────────────────

export const USER_PROFILE: UserProfile = {
  id: "u1",
  name: "Chino Reyes",
  email: "chino.realestatela@gmail.com",
  plan: "pro",
  niche: "Real Estate",
  targetAudience: "Home buyers & sellers, ages 28–55, Los Angeles",
  goals: ["Grow my followers to 50K+", "Generate $5K+/month from content", "Build a recognizable personal brand"],
  postingFrequency: 7,
  connectedPlatforms: ["instagram", "facebook", "youtube", "tiktok"],
  onboardingCompleted: true,
};

// ── Dashboard KPIs ─────────────────────────────────────────────────────────────

export const DASHBOARD_STATS = {
  totalContent:              312,
  scheduledPosts:             6,
  publishedPosts:           289,
  draftPosts:                17,
  totalViews:          9480000,
  totalFollowers:         85800,
  followersGainedThisMonth:  4200,
  estimatedMonthlyRevenue: 127840,
  contentDaysRemaining:       6,
  avgEngagementRate:         4.7,
  weeklyGrowthPct:           12.4,
  topPerformingPlatform:  "Instagram",
  postsThisWeek:              7,
  avgViralScore:             89,
};
