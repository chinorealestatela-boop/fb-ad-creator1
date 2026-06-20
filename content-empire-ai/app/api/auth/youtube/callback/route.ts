import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(`${APP_URL}/platforms?error=youtube_denied`);
  }

  const { data: stateRow } = await supabaseAdmin
    .from("oauth_states")
    .select("user_id")
    .eq("state", state)
    .eq("platform", "youtube")
    .single();

  if (!stateRow) {
    return NextResponse.redirect(`${APP_URL}/platforms?error=invalid_state`);
  }

  const userId = stateRow.user_id;
  await supabaseAdmin.from("oauth_states").delete().eq("state", state);

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${APP_URL}/api/auth/youtube/callback`,
      grant_type: "authorization_code",
    }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return NextResponse.redirect(`${APP_URL}/platforms?error=youtube_token_failed`);
  }

  // Get channel info
  const channelRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  );
  const channelData = await channelRes.json();
  const channel = channelData.items?.[0];

  await supabaseAdmin.from("oauth_tokens").upsert({
    user_id: userId,
    platform: "youtube",
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || null,
    token_expires_at: tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null,
    platform_user_id: channel?.id || null,
    platform_username: channel?.snippet?.customUrl || channel?.snippet?.title || null,
    platform_display_name: channel?.snippet?.title || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,platform" });

  return NextResponse.redirect(`${APP_URL}/platforms?connected=YouTube`);
}
