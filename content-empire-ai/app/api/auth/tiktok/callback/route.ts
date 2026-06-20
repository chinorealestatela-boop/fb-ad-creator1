import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(`${APP_URL}/platforms?error=tiktok_denied`);
  }

  const { data: stateRow } = await supabaseAdmin
    .from("oauth_states")
    .select("user_id")
    .eq("state", state)
    .eq("platform", "tiktok")
    .single();

  if (!stateRow) {
    return NextResponse.redirect(`${APP_URL}/platforms?error=invalid_state`);
  }

  const userId = stateRow.user_id;
  await supabaseAdmin.from("oauth_states").delete().eq("state", state);

  // Exchange code for access token
  const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${APP_URL}/api/auth/tiktok/callback`,
    }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return NextResponse.redirect(`${APP_URL}/platforms?error=tiktok_token_failed`);
  }

  // Get user profile
  const userRes = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username",
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  );
  const userData = await userRes.json();
  const user = userData.data?.user;

  await supabaseAdmin.from("oauth_tokens").upsert({
    user_id: userId,
    platform: "tiktok",
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || null,
    token_expires_at: tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null,
    platform_user_id: user?.open_id || null,
    platform_username: user?.username || user?.display_name || null,
    platform_display_name: user?.display_name || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,platform" });

  return NextResponse.redirect(`${APP_URL}/platforms?connected=TikTok`);
}
