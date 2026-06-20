import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const { data } = await supabaseAdmin
    .from("oauth_tokens")
    .select("platform, platform_username, platform_display_name, updated_at")
    .eq("user_id", userId);

  return NextResponse.json(data ?? []);
}

export async function DELETE(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const platform = request.nextUrl.searchParams.get("platform");
  if (!userId || !platform) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  await supabaseAdmin
    .from("oauth_tokens")
    .delete()
    .eq("user_id", userId)
    .eq("platform", platform);

  return NextResponse.json({ ok: true });
}
