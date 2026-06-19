import type {
  ContentItem, ScheduledPost, DailyAnalytics,
  AIRecommendation, PlatformConnection, TeamMember, UserProfile
} from "./types";

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const GRADIENTS = [
  "from-violet-600 to-pink-500",
  "from-blue-600 to-cyan-400",
  "from-orange-500 to-red-500",
  "from-emerald-500 to-teal-400",
  "from-indigo-600 to-purple-500",
  "from-pink-500 to-rose-400",
  "from-amber-500 to-orange-400",
  "from-cyan-500 to-blue-500",
  "from-fuchsia-600 to-purple-400",
  "from-lime-500 to-green-500",
];

const TITLES = [
  "How I Closed a $2M Deal Using These 3 Strategies",
  "Morning Routine That Changed My Life",
  "The Secret to Going Viral on Instagram",
  "5 Real Estate Tips Every Buyer Needs to Know",
  "Behind the Scenes: My Content Creation Process",
  "Day in the Life of a Top Real Estate Agent",
  "Why 90% of Reels Fail (And How to Fix Yours)",
  "The Best Neighborhoods in LA Right Now",
  "How to Build a Personal Brand from Scratch",
  "Market Update: What You Need to Know This Month",
  "Luxury Home Tour — $5M Beverly Hills Property",
  "My Biggest Mistakes as a Content Creator",
  "How I Got 100K Followers in 6 Months",
  "The 60-Second Hook Formula That Works Every Time",
  "Client Testimonial: From Renter to Homeowner",
  "Breaking Down the Latest Housing Market Data",
  "Why Short-Form Video Outperforms Everything Else",
  "Open House Highlight Reel — 3 Offers in 24 Hours",
  "Investment Property vs Primary Home — Which to Buy?",
  "Top 10 Questions First-Time Buyers Always Ask",
  "The Power of Consistency in Content Creation",
  "Social Media Strategy for Real Estate Agents 2026",
  "Just Sold in 48 Hours — Here's How",
  "How AI Is Changing Real Estate Forever",
  "The Perfect Caption Formula for Maximum Reach",
  "Interest Rates Are Dropping — What You Should Do Now",
  "3 Listings, 3 Days, 3 Full-Price Offers",
  "This Simple Trick Doubled My Instagram Engagement",
  "New Construction vs Resale — The Real Truth",
  "How to Pick a Real Estate Agent (What They Won't Tell You)",
];

const CATEGORIES = ["Real Estate", "Lifestyle", "Education", "Business", "Entertainment", "Finance"];
const TYPES = ["reel", "short", "photo", "carousel", "video"] as const;
const STATUSES = ["draft", "scheduled", "scheduled", "published", "published", "published"] as const;
const PLATFORM_COMBOS = [
  ["instagram", "facebook"],
  ["instagram", "youtube"],
  ["facebook"],
  ["instagram"],
  ["youtube", "instagram", "facebook"],
  ["tiktok"],
  ["linkedin"],
  ["instagram", "tiktok"],
] as const;

export const SAMPLE_CONTENT: ContentItem[] = Array.from({ length: 52 }, (_, i) => {
  const status = pick([...STATUSES]);
  const type = pick([...TYPES]);
  const platforms = [...pick([...PLATFORM_COMBOS])] as ContentItem["platforms"];

  const past = new Date("2026-06-19");
  past.setDate(past.getDate() - rnd(0, 90));
  const future = new Date("2026-06-19");
  future.setDate(future.getDate() + rnd(1, 100));

  const viral = rnd(42, 99);
  const engagement = rnd(48, 97);
  const monetization = rnd(38, 95);

  return {
    id: `c${i + 1}`,
    title: TITLES[i % TITLES.length],
    type,
    thumbnailGradient: GRADIENTS[i % GRADIENTS.length],
    status,
    platforms,
    scheduledAt: status === "scheduled" ? future.toISOString() : undefined,
    publishedAt: status === "published" ? past.toISOString() : undefined,
    category: pick(CATEGORIES),
    caption: `This is an AI-optimized caption for "${TITLES[i % TITLES.length]}". Hook → Value → CTA. #realestate #losangeles`,
    hashtags: ["#realestate", "#losangeles", "#contentcreator", "#viral", "#growth"],
    viralScore: viral,
    engagementScore: engagement,
    monetizationScore: monetization,
    durationSec: type !== "photo" && type !== "carousel" ? rnd(15, 180) : undefined,
    views: status === "published" ? rnd(800, 280000) : undefined,
    likes: status === "published" ? rnd(60, 14000) : undefined,
    comments: status === "published" ? rnd(5, 900) : undefined,
    shares: status === "published" ? rnd(10, 2200) : undefined,
    reach: status === "published" ? rnd(1000, 400000) : undefined,
    followersGained: status === "published" ? rnd(2, 320) : undefined,
    createdAt: past.toISOString(),
    aiAnalyzed: status !== "draft" || Math.random() > 0.4,
    aiAnalysis: {
      summary: "Educational real estate content showcasing agent expertise and local market knowledge.",
      detectedPeople: Math.random() > 0.3,
      detectedProducts: Math.random() > 0.55,
      detectedLocation: Math.random() > 0.5 ? "Los Angeles, CA" : undefined,
      emotions: pick([["excitement", "inspiration"], ["trust", "confidence"], ["joy", "enthusiasm"], ["urgency", "curiosity"]]),
      topics: ["real estate", "investment", "lifestyle", "local market"],
      niche: "Real Estate",
      targetAudience: "Home buyers & sellers, 28–50, urban professionals",
      hookType: pick(["Question Hook", "Shock Stat Hook", "Story Hook", "Pain Point Hook", "Bold Claim Hook"]),
      suggestedTitle: TITLES[i % TITLES.length],
      suggestedCaption: `🏡 ${TITLES[i % TITLES.length]}\n\nMost people don't know this, but the market is shifting RIGHT NOW. Here's exactly what to do...\n\nComment "INFO" to get my free market guide! 👇\n\n#realestate #losangeles #homebuying #realtor #investment`,
      suggestedHashtags: ["#realestate", "#losangeles", "#homebuying", "#realtor", "#investment", "#property", "#luxuryhomes", "#firsttimehomebuyer"],
      platformOptimizations: {
        instagram: {
          caption: `🔥 ${TITLES[i % TITLES.length]}\n\nSwipe to see the full breakdown → 👉\n\n#realestate #losangeles #realtor #homebuying #luxuryhomes`,
          hashtags: ["#realestate", "#losangeles", "#realtor", "#homebuying", "#luxuryhomes", "#realestateinvesting"],
          bestTime: "7:00 PM PST",
        },
        facebook: {
          caption: `${TITLES[i % TITLES.length]}\n\nHere's everything you need to know about the current market. Share this with someone who needs to see it!\n\nComment below with your questions — I answer every one.`,
          hashtags: ["#realestate", "#losangeles"],
          bestTime: "12:00 PM PST",
        },
        youtube: {
          title: `${TITLES[i % TITLES.length]} | LA Real Estate 2026`,
          description: `In this video, I break down ${TITLES[i % TITLES.length].toLowerCase()}. Whether you're buying, selling, or investing in LA real estate, this is exactly what you need to know.\n\n📞 Contact me: hello@example.com\n🏡 Search homes: example.com\n\n#realestate #losangeles #homebuying`,
          caption: `${TITLES[i % TITLES.length]}`,
          hashtags: ["#realestate", "#losangeles", "#homebuying"],
          tags: ["real estate", "los angeles", "home buying", "real estate investing", "realtor"],
          bestTime: "2:00 PM PST",
        },
        tiktok: {
          caption: `${TITLES[i % TITLES.length]} 🏡 #realestate #losangeles #fyp #viral`,
          hashtags: ["#realestate", "#losangeles", "#fyp", "#viral", "#realestatetiktok"],
          bestTime: "6:00 PM PST",
        },
        linkedin: {
          caption: `Insight from 10+ years in the LA real estate market:\n\n${TITLES[i % TITLES.length]}\n\nHere's the full breakdown (save this post):\n\n1. ...\n2. ...\n3. ...\n\nWhat's your experience? Comment below.`,
          hashtags: ["#realestate", "#losangeles", "#realestateinvesting", "#propertymarket"],
          bestTime: "9:00 AM PST",
        },
        twitter: {
          caption: `${TITLES[i % TITLES.length]}\n\nThread 🧵`,
          hashtags: ["#realestate", "#losangeles"],
          bestTime: "10:00 AM PST",
        },
        pinterest: {
          caption: `${TITLES[i % TITLES.length]} — Save this for later!`,
          hashtags: ["#realestate", "#homebuying", "#losangeles"],
          bestTime: "8:00 PM PST",
        },
        threads: {
          caption: `${TITLES[i % TITLES.length]}\n\nThoughts? 👇`,
          hashtags: ["#realestate", "#losangeles"],
          bestTime: "7:00 PM PST",
        },
      },
    },
  };
});

const DAYS_BACK = 30;
export const SAMPLE_ANALYTICS: DailyAnalytics[] = Array.from({ length: DAYS_BACK }, (_, i) => {
  const d = new Date("2026-06-19");
  d.setDate(d.getDate() - (DAYS_BACK - 1 - i));
  const isWeekend = [0, 6].includes(d.getDay());
  const boost = isWeekend ? 1.4 : 1;
  return {
    date: d.toISOString().split("T")[0],
    views: Math.round(rnd(3000, 38000) * boost),
    reach: Math.round(rnd(4000, 55000) * boost),
    likes: Math.round(rnd(120, 3800) * boost),
    comments: Math.round(rnd(15, 450) * boost),
    shares: Math.round(rnd(25, 900) * boost),
    followersGained: Math.round(rnd(8, 240) * boost),
    revenue: parseFloat((rnd(20, 200) * boost).toFixed(2)),
    impressions: Math.round(rnd(8000, 90000) * boost),
    watchTimeMinutes: Math.round(rnd(500, 12000) * boost),
  };
});

export const SAMPLE_SCHEDULED_POSTS: ScheduledPost[] = Array.from({ length: 18 }, (_, i) => {
  const d = new Date("2026-06-19");
  d.setDate(d.getDate() + rnd(0, 14));
  const hours = pick([7, 9, 12, 17, 19, 20]);
  d.setHours(hours, 0, 0, 0);
  const content = SAMPLE_CONTENT[i % SAMPLE_CONTENT.length];
  return {
    id: `sp${i + 1}`,
    contentId: content.id,
    contentTitle: content.title,
    platform: pick(["instagram", "facebook", "youtube", "instagram", "instagram"]),
    scheduledAt: d.toISOString(),
    caption: content.caption || "",
    hashtags: content.hashtags,
    status: i < 3 ? "published" : "pending",
    thumbnailGradient: content.thumbnailGradient,
  };
});

export const AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: "r1",
    type: "viral",
    title: "High Viral Potential Detected",
    message: "Your 'Luxury Home Tour' video scored 94/100 on the viral index. Post today at 7 PM PST for maximum reach — your audience is most active then.",
    action: "Schedule Now",
    priority: "high",
    icon: "🚀",
    contentId: "c11",
  },
  {
    id: "r2",
    type: "repost",
    title: "Repost Opportunity Ready",
    message: "Your '5 Real Estate Tips' post from 63 days ago generated 24K views. AI has written a fresh caption and new hooks — ready to reshare.",
    action: "Create Repost",
    priority: "medium",
    icon: "♻️",
    contentId: "c4",
  },
  {
    id: "r3",
    type: "warning",
    title: "Content Gap on Facebook",
    message: "You haven't posted on Facebook in 4 days. Engagement drops 40% after 48 hours of silence. You have 12 ready-to-publish pieces in your library.",
    action: "Fill Gap",
    priority: "high",
    icon: "⚠️",
  },
  {
    id: "r4",
    type: "trend",
    title: "Trending Topic in Your Niche",
    message: "'First-time homebuyer tips' is surging in search volume this week. You have 3 relevant videos ready to post — capitalize now while it's trending.",
    action: "Post Now",
    priority: "medium",
    icon: "📈",
  },
  {
    id: "r5",
    type: "monetization",
    title: "Revenue Opportunity Identified",
    message: "Educational content generates 3× more affiliate clicks for your audience. Prioritizing these over lifestyle posts could add ~$420/month in estimated revenue.",
    action: "Optimize Mix",
    priority: "low",
    icon: "💰",
  },
  {
    id: "r6",
    type: "content",
    title: "Viral Blueprint Ready",
    message: "AI analyzed your top 12 performing videos. Short-form under 45s + story hooks outperform everything else by 2.8× for your audience. Blueprint is ready.",
    action: "View Blueprint",
    priority: "low",
    icon: "🧠",
  },
];

export const PLATFORM_CONNECTIONS: PlatformConnection[] = [
  { platform: "instagram", connected: true, accountName: "@chinorealestatela", followers: 12400, lastSync: "2026-06-19T10:00:00Z" },
  { platform: "facebook", connected: true, accountName: "Chino Real Estate LA", followers: 6800, lastSync: "2026-06-19T10:00:00Z" },
  { platform: "youtube", connected: true, accountName: "Chino Real Estate LA", followers: 3200, lastSync: "2026-06-18T22:00:00Z" },
  { platform: "tiktok", connected: false },
  { platform: "linkedin", connected: false },
  { platform: "twitter", connected: false },
  { platform: "pinterest", connected: false },
  { platform: "threads", connected: false },
];

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "u1", name: "Chino R.", email: "chino.realestatela@gmail.com", role: "admin", joinedAt: "2026-01-01" },
  { id: "u2", name: "Maria S.", email: "maria@example.com", role: "editor", joinedAt: "2026-03-15" },
  { id: "u3", name: "Jake T.", email: "jake@example.com", role: "viewer", joinedAt: "2026-05-02" },
];

export const USER_PROFILE: UserProfile = {
  id: "u1",
  name: "Chino Real Estate LA",
  email: "chino.realestatela@gmail.com",
  plan: "pro",
  niche: "Real Estate",
  targetAudience: "Home buyers & sellers, 28–50, Los Angeles metro",
  goals: ["Grow Instagram to 50K", "Generate $5K/month from content", "Post daily across 3 platforms"],
  postingFrequency: 3,
  connectedPlatforms: ["instagram", "facebook", "youtube"],
  onboardingCompleted: true,
};

export const DASHBOARD_STATS = {
  totalContent: 312,
  scheduledPosts: 247,
  publishedPosts: 48,
  draftPosts: 17,
  totalViews: 1_247_890,
  totalFollowers: 22_400,
  followersGainedThisMonth: 1_240,
  estimatedMonthlyRevenue: 3_420,
  contentDaysRemaining: 82,
  avgEngagementRate: 4.7,
  weeklyGrowthPct: 12.4,
  topPerformingPlatform: "Instagram",
  postsThisWeek: 21,
  avgViralScore: 74,
};
