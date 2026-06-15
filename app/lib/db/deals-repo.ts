// Deal-snapshot repository. Stores fully scored deals as JSONB snapshots for
// fast dashboard reads, and falls back to computing from sample data when
// Supabase isn't configured. The normalized properties/deals tables in the
// schema remain the long-term analytics store; this snapshot table is the
// operational read/write path for the dashboard.

import type { ScoredDeal } from "../types";
import { getSupabase } from "./supabase";
import { SAMPLE_PROPERTIES } from "../sample-data";
import { buildScoredDeals } from "../deals";

const TABLE = "deal_snapshots";

export async function loadScoredDeals(): Promise<ScoredDeal[]> {
  const sb = getSupabase();
  if (!sb) return buildScoredDeals(SAMPLE_PROPERTIES);

  try {
    const { data, error } = await sb
      .from(TABLE)
      .select("data")
      .order("score", { ascending: false });
    if (error) throw new Error(error.message);

    const deals = (data ?? []).map((r) => (r as { data: ScoredDeal }).data);
    // Empty DB (never scanned yet) -> show sample data so the UI isn't blank.
    return deals.length > 0 ? deals : buildScoredDeals(SAMPLE_PROPERTIES);
  } catch {
    // Network unreachable (e.g. egress restrictions in dev) — use sample data.
    return buildScoredDeals(SAMPLE_PROPERTIES);
  }
}

export async function saveScoredDeals(deals: ScoredDeal[]): Promise<void> {
  const sb = getSupabase();
  if (!sb) return; // nothing to persist in fallback mode
  const rows = deals.map((d) => ({
    property_id: d.property.id,
    score: d.score.total,
    data: d,
    scanned_at: new Date().toISOString(),
  }));
  const { error } = await sb.from(TABLE).upsert(rows, {
    onConflict: "property_id",
  });
  if (error) throw new Error(error.message);
}
