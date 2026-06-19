import type {
  ContentItem, ScheduledPost, DailyAnalytics,
  AIRecommendation, PlatformConnection, TeamMember, UserProfile
} from "./types";

export const SAMPLE_CONTENT: ContentItem[] = [];

export const SAMPLE_ANALYTICS: DailyAnalytics[] = [];

export const SAMPLE_SCHEDULED_POSTS: ScheduledPost[] = [];

export const AI_RECOMMENDATIONS: AIRecommendation[] = [];

export const PLATFORM_CONNECTIONS: PlatformConnection[] = [
  { platform: "instagram", connected: false },
  { platform: "facebook",  connected: false },
  { platform: "youtube",   connected: false },
  { platform: "tiktok",    connected: false },
  { platform: "linkedin",  connected: false },
  { platform: "twitter",   connected: false },
  { platform: "pinterest", connected: false },
  { platform: "threads",   connected: false },
];

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "u1", name: "Chino R.", email: "chino.realestatela@gmail.com", role: "admin", joinedAt: "2026-01-01" },
];

export const USER_PROFILE: UserProfile = {
  id: "u1",
  name: "",
  email: "",
  plan: "pro",
  niche: "",
  targetAudience: "",
  goals: [],
  postingFrequency: 1,
  connectedPlatforms: [],
  onboardingCompleted: false,
};

export const DASHBOARD_STATS = {
  totalContent: 0,
  scheduledPosts: 0,
  publishedPosts: 0,
  draftPosts: 0,
  totalViews: 0,
  totalFollowers: 0,
  followersGainedThisMonth: 0,
  estimatedMonthlyRevenue: 0,
  contentDaysRemaining: 0,
  avgEngagementRate: 0,
  weeklyGrowthPct: 0,
  topPerformingPlatform: "—",
  postsThisWeek: 0,
  avgViralScore: 0,
};
