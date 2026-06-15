// Buyer repository. Uses Supabase when configured; otherwise falls back to a
// process-level in-memory store seeded with the sample buyers so the CRM UI is
// fully functional in development before a database is connected.
//
// NOTE: the in-memory store resets when the server restarts. Connect Supabase
// (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) for durable storage.

import type { Buyer, BuyerBuyBox } from "../types";
import { getSupabase } from "./supabase";
import { SAMPLE_BUYERS } from "../sample-data";

const TABLE = "buyers";

// ---- In-memory fallback ----------------------------------------------------
// Kept on globalThis so it survives Next.js hot-reload in dev.
const g = globalThis as unknown as { __buyerStore?: Buyer[] };
function memStore(): Buyer[] {
  if (!g.__buyerStore) g.__buyerStore = SAMPLE_BUYERS.map((b) => ({ ...b }));
  return g.__buyerStore;
}

// ---- Row <-> domain mapping ------------------------------------------------
type BuyerRow = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  notes: string | null;
  active: boolean;
  min_price: number;
  max_price: number;
  zips: string[];
  cities: string[];
  property_types: BuyerBuyBox["propertyTypes"];
  strategies: BuyerBuyBox["strategies"];
  min_beds: number;
  min_baths: number;
  max_rehab_level: BuyerBuyBox["maxRehabLevel"];
  min_profit: number;
  min_roi_pct: number;
  avoid_high_crime: boolean;
  created_at: string;
};

function rowToBuyer(r: BuyerRow): Buyer {
  return {
    id: r.id,
    name: r.name,
    company: r.company ?? undefined,
    email: r.email,
    phone: r.phone ?? undefined,
    notes: r.notes ?? undefined,
    active: r.active,
    createdAt: r.created_at,
    buyBox: {
      minPrice: Number(r.min_price ?? 0),
      maxPrice: Number(r.max_price ?? 0),
      zips: r.zips ?? [],
      cities: r.cities ?? [],
      propertyTypes: r.property_types ?? [],
      strategies: r.strategies ?? [],
      minBeds: r.min_beds ?? 0,
      minBaths: Number(r.min_baths ?? 0),
      maxRehabLevel: r.max_rehab_level ?? "moderate",
      minProfit: Number(r.min_profit ?? 0),
      minRoiPct: Number(r.min_roi_pct ?? 0),
      avoidHighCrime: r.avoid_high_crime ?? true,
    },
  };
}

function buyerToRow(b: Buyer): BuyerRow {
  return {
    id: b.id,
    name: b.name,
    company: b.company ?? null,
    email: b.email,
    phone: b.phone ?? null,
    notes: b.notes ?? null,
    active: b.active,
    min_price: b.buyBox.minPrice,
    max_price: b.buyBox.maxPrice,
    zips: b.buyBox.zips,
    cities: b.buyBox.cities,
    property_types: b.buyBox.propertyTypes,
    strategies: b.buyBox.strategies,
    min_beds: b.buyBox.minBeds,
    min_baths: b.buyBox.minBaths,
    max_rehab_level: b.buyBox.maxRehabLevel,
    min_profit: b.buyBox.minProfit,
    min_roi_pct: b.buyBox.minRoiPct,
    avoid_high_crime: b.buyBox.avoidHighCrime,
    created_at: b.createdAt,
  };
}

// ---- Public API ------------------------------------------------------------

export async function listBuyers(): Promise<Buyer[]> {
  const sb = getSupabase();
  if (!sb) return memStore().slice();
  try {
    const { data, error } = await sb
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as BuyerRow[]).map(rowToBuyer);
  } catch {
    return memStore().slice();
  }
}

export async function createBuyer(buyer: Buyer): Promise<Buyer> {
  const sb = getSupabase();
  if (!sb) {
    memStore().unshift(buyer);
    return buyer;
  }
  const { data, error } = await sb
    .from(TABLE)
    .insert(buyerToRow(buyer))
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return rowToBuyer(data as BuyerRow);
}

export async function updateBuyer(id: string, buyer: Buyer): Promise<Buyer> {
  const sb = getSupabase();
  if (!sb) {
    const store = memStore();
    const i = store.findIndex((b) => b.id === id);
    if (i >= 0) store[i] = buyer;
    return buyer;
  }
  const row = buyerToRow(buyer);
  const { data, error } = await sb
    .from(TABLE)
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return rowToBuyer(data as BuyerRow);
}

export async function deleteBuyer(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    const store = memStore();
    const i = store.findIndex((b) => b.id === id);
    if (i >= 0) store.splice(i, 1);
    return;
  }
  const { error } = await sb.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
