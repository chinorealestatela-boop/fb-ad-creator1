import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(`${APP_URL}/platforms?error=facebook_denied`);
  }

  const { data: stateRow } = await supabaseAdmin
    .from("oauth_states")
    .select("user_id")
    .eq("state", state)
    .eq("platform", "facebook")
    .single();

  if (!stateRow) {
    return NextResponse.redirect(`${APP_URL}/platforms?error=invalid_state`);
  }

  const userId = stateRow.user_id;
  await supabaseAdmin.from("oauth_states").delete().eq("state", state);

  const redirectUri = `${APP_URL}/api/auth/facebook/callback`;

  // Short-lived token exchange
  const tokenParams = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID!,
    client_secret: process.env.FACEBOOK_APP_SECRET!,
    redirect_uri: redirectUri,
    code,
  });
  const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${tokenParams}`);
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return NextResponse.redirect(`${APP_URL}/platforms?error=facebook_token_failed`);
  }

  // Exchange for long-lived token (valid 60 days)
  const llParams = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.FACEBOOK_APP_ID!,
    client_secret: process.env.FACEBOOK_APP_SECRET!,
    fb_exchange_token: tokenData.access_token,
  });
  const llRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${llParams}`);
  const llToken = await llRes.json();
  const accessToken = llToken.access_token || tokenData.access_token;

  // Get Facebook user info
  const meRes = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${accessToken}`);
  const me = await meRes.json();

  await supabaseAdmin.from("oauth_tokens").upsert({
    user_id: userId,
    platform: "facebook",
    access_token: accessToken,
    platform_user_id: me.id,
    platform_username: me.name,
    platform_display_name: me.name,
    token_expires_at: llToken.expires_in
      ? new Date(Date.now() + llToken.expires_in * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,platform" });

  // Auto-connect linked Instagram Business Account
  const pagesRes = await fetch(
    `https://graph.facebook.com/me/accounts?fields=name,access_token,instagram_business_account&access_token=${accessToken}`
  );
  const pagesData = await pagesRes.json();

  if (pagesData.data) {
    for (const page of pagesData.data) {
      if (page.instagram_business_account) {
        const igId = page.instagram_business_account.id;
        const igRes = await fetch(
          `https://graph.facebook.com/${igId}?fields=id,name,username,followers_count&access_token=${page.access_token}`
        );
        const ig = await igRes.json();

        await supabaseAdmin.from("oauth_tokens").upsert({
          user_id: userId,
          platform: "instagram",
          access_token: page.access_token,
          platform_user_id: igId,
          platform_username: ig.username || ig.name,
          platform_display_name: ig.name,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,platform" });
        break;
      }
    }
  }

  return NextResponse.redirect(`${APP_URL}/platforms?connected=Facebook+%26+Instagram`);
}
