import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/supabase-admin";

async function getValidYouTubeToken(token: Record<string, string>, userId: string): Promise<string> {
  const expiry = token.token_expires_at ? new Date(token.token_expires_at) : null;
  const expiresSoon = expiry && expiry < new Date(Date.now() + 5 * 60 * 1000);

  if (!expiresSoon || !token.refresh_token) return token.access_token;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: token.refresh_token,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (data.access_token) {
    await supabaseAdmin.from("oauth_tokens").update({
      access_token: data.access_token,
      token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId).eq("platform", "youtube");
    return data.access_token;
  }
  return token.access_token;
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const { data: tokens } = await supabaseAdmin
    .from("oauth_tokens")
    .select("*")
    .eq("user_id", userId);

  const result: Record<string, unknown> = {};

  await Promise.allSettled(
    (tokens ?? []).map(async (token) => {
      try {
        if (token.platform === "instagram") {
          const igRes = await fetch(
            `https://graph.facebook.com/${token.platform_user_id}?fields=id,name,username,followers_count,media_count&access_token=${token.access_token}`
          );
          const ig = await igRes.json();
          if (ig.error) return;

          const mediaRes = await fetch(
            `https://graph.facebook.com/${token.platform_user_id}/media?fields=id,caption,media_type,timestamp,like_count,comments_count,thumbnail_url,media_url&limit=6&access_token=${token.access_token}`
          );
          const media = await mediaRes.json();

          result.instagram = {
            connected: true,
            username: ig.username || token.platform_username,
            displayName: ig.name,
            followers: ig.followers_count ?? 0,
            posts: ig.media_count ?? 0,
            recentMedia: media.data ?? [],
          };
        }

        if (token.platform === "facebook") {
          const pagesRes = await fetch(
            `https://graph.facebook.com/me/accounts?fields=name,fan_count&access_token=${token.access_token}`
          );
          const pages = await pagesRes.json();
          const page = pages.data?.[0];
          if (page) {
            result.facebook = {
              connected: true,
              username: page.name || token.platform_username,
              followers: page.fan_count ?? 0,
            };
          }
        }

        if (token.platform === "youtube") {
          const accessToken = await getValidYouTubeToken(token, userId);
          const channelRes = await fetch(
            "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const channelData = await channelRes.json();
          const channel = channelData.items?.[0];
          if (channel) {
            result.youtube = {
              connected: true,
              username: channel.snippet.customUrl || token.platform_username,
              displayName: channel.snippet.title,
              subscribers: parseInt(channel.statistics.subscriberCount || "0"),
              totalViews: parseInt(channel.statistics.viewCount || "0"),
              videoCount: parseInt(channel.statistics.videoCount || "0"),
            };
          }
        }

        if (token.platform === "tiktok") {
          const userRes = await fetch(
            "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username,follower_count,following_count,likes_count,video_count",
            { headers: { Authorization: `Bearer ${token.access_token}` } }
          );
          const userData = await userRes.json();
          const user = userData.data?.user;
          if (user) {
            result.tiktok = {
              connected: true,
              username: user.username || token.platform_username,
              displayName: user.display_name,
              followers: user.follower_count ?? 0,
              likes: user.likes_count ?? 0,
              videos: user.video_count ?? 0,
            };
          }
        }
      } catch {
        // Silently skip failed platform — don't break other platforms
      }
    })
  );

  return NextResponse.json(result);
}
