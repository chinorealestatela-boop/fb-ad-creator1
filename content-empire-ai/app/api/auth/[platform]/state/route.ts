import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import crypto from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

function buildOAuthUrl(platform: string, state: string): string | null {
  switch (platform) {
    case "facebook": {
      const params = new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID!,
        redirect_uri: `${APP_URL}/api/auth/facebook/callback`,
        scope: "pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights,read_insights",
        state,
        response_type: "code",
      });
      return `https://www.facebook.com/v18.0/dialog/oauth?${params}`;
    }
    case "youtube": {
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: `${APP_URL}/api/auth/youtube/callback`,
        scope: "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly",
        state,
        response_type: "code",
        access_type: "offline",
        prompt: "consent",
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    }
    case "tiktok": {
      const params = new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        redirect_uri: `${APP_URL}/api/auth/tiktok/callback`,
        scope: "user.info.basic,user.info.profile,user.info.stats,video.list",
        state,
        response_type: "code",
      });
      return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
    }
    default:
      return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const { userId } = await request.json();

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const state = crypto.randomBytes(32).toString("hex");
  const redirectUrl = buildOAuthUrl(platform, state);

  if (!redirectUrl) return NextResponse.json({ error: "Unknown platform" }, { status: 400 });

  await supabaseAdmin.from("oauth_states").insert({ state, user_id: userId, platform });

  // Prune stale states older than 10 minutes
  await supabaseAdmin
    .from("oauth_states")
    .delete()
    .lt("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

  return NextResponse.json({ state, redirectUrl });
}
