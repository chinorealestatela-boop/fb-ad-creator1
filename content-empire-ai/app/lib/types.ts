export type Platform = "instagram" | "facebook" | "youtube" | "tiktok" | "linkedin" | "twitter" | "pinterest" | "threads";

export type ContentStatus = "draft" | "analyzing" | "scheduled" | "published" | "failed";

export type ContentType = "reel" | "short" | "photo" | "carousel" | "video" | "story";

export type CaptionStyle = "viral" | "storytelling" | "educational" | "motivational" | "sales" | "humorous" | "personal";

export type RecommendationType = "viral" | "repost" | "strategy" | "trend" | "monetization" | "content" | "warning";

export type Priority = "high" | "medium" | "low";

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  thumbnailGradient: string;
  status: ContentStatus;
  platforms: Platform[];
  scheduledAt?: string;
  publishedAt?: string;
  category: string;
  caption?: string;
  hashtags: string[];
  viralScore: number;
  engagementScore: number;
  monetizationScore: number;
  durationSec?: number;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  reach?: number;
  followersGained?: number;
  createdAt: string;
  aiAnalyzed: boolean;
  aiAnalysis?: AIAnalysis;
}

export interface AIAnalysis {
  transcription?: string;
  summary: string;
  detectedPeople: boolean;
  detectedProducts: boolean;
  detectedLocation?: string;
  emotions: string[];
  topics: string[];
  niche: string;
  targetAudience: string;
  hookType: string;
  suggestedTitle: string;
  suggestedCaption: string;
  suggestedHashtags: string[];
  platformOptimizations: Record<Platform, PlatformOptimization>;
}

export interface PlatformOptimization {
  caption: string;
  hashtags: string[];
  bestTime: string;
  title?: string;
  description?: string;
  tags?: string[];
}

export interface ScheduledPost {
  id: string;
  contentId: string;
  contentTitle: string;
  platform: Platform;
  scheduledAt: string;
  caption: string;
  hashtags: string[];
  status: "pending" | "published" | "failed";
  thumbnailGradient: string;
}

export interface DailyAnalytics {
  date: string;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  followersGained: number;
  revenue: number;
  impressions: number;
  watchTimeMinutes: number;
}

export interface PlatformConnection {
  platform: Platform;
  connected: boolean;
  accountName?: string;
  followers?: number;
  lastSync?: string;
}

export interface AIRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  message: string;
  action: string;
  priority: Priority;
  icon: string;
  contentId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: "starter" | "pro" | "enterprise";
  niche: string;
  targetAudience: string;
  goals: string[];
  postingFrequency: number;
  connectedPlatforms: Platform[];
  onboardingCompleted: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  avatar?: string;
  joinedAt: string;
}
