// ============================================================================
// RentCast data source
// ============================================================================
// Fetches active for-sale listings and comparable sales from the RentCast API
// and maps them into our Property model so the analysis/scoring engines can
// run unchanged. Docs: https://developers.rentcast.io
//
// Neighborhood-intelligence fields (crime/school/flood) are set to neutral
// defaults here and enriched by dedicated sources (FBI crime, GreatSchools,
// FEMA) in a later step.

import type { Property, PropertyType, Comp, PriceHistoryEntry } from "../types";
import { env, isRentcastConfigured } from "../env";

const BASE = "https://api.rentcast.io/v1";

function headers() {
  return { "X-Api-Key": env.rentcastApiKey, Accept: "application/json" };
}

// RentCast property-type strings -> our enum.
function mapType(t: string | undefined): PropertyType {
  switch ((t ?? "").toLowerCase()) {
    case "condo":
    case "apartment":
      return "condo";
    case "townhouse":
      return "townhome";
    case "duplex":
    case "triplex":
    case "quadplex":
      return "duplex";
    case "multi-family":
    case "multifamily":
      return "multi_family";
    default:
      return "single_family";
  }
}

interface RentcastListing {
  id?: string;
  formattedAddress?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  price?: number;
  status?: string;
  daysOnMarket?: number;
  listedDate?: string;
  history?: Record<string, { event?: string; price?: number; date?: string }>;
}

interface RentcastComparable {
  formattedAddress?: string;
  price?: number;
  removedDate?: string;
  lastSeenDate?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  distance?: number;
}

function mapHistory(
  listing: RentcastListing
): PriceHistoryEntry[] {
  const out: PriceHistoryEntry[] = [];
  const hist = listing.history ?? {};
  for (const key of Object.keys(hist).sort()) {
    const h = hist[key];
    if (h?.price && h?.date) {
      out.push({
        date: h.date.slice(0, 10),
        price: h.price,
        event:
          h.event === "Price Change"
            ? "price_change"
            : h.event === "Sold"
            ? "sold"
            : "listed",
      });
    }
  }
  if (out.length === 0 && listing.price && listing.listedDate) {
    out.push({
      date: listing.listedDate.slice(0, 10),
      price: listing.price,
      event: "listed",
    });
  }
  return out;
}

async function fetchComps(
  address: string
): Promise<{ comps: Comp[]; marketValue: number | null }> {
  try {
    const url = `${BASE}/avm/value?address=${encodeURIComponent(address)}&compCount=5`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) return { comps: [], marketValue: null };
    const data = (await res.json()) as {
      price?: number;
      comparables?: RentcastComparable[];
    };
    const comps: Comp[] = (data.comparables ?? [])
      .filter((c) => c.price && c.squareFootage)
      .map((c) => ({
        address: c.formattedAddress ?? "",
        soldPrice: c.price!,
        soldDate: (c.removedDate ?? c.lastSeenDate ?? "").slice(0, 10),
        beds: c.bedrooms ?? 0,
        baths: c.bathrooms ?? 0,
        sqft: c.squareFootage!,
        distanceMiles: Math.round((c.distance ?? 0) * 10) / 10,
      }));
    return { comps, marketValue: data.price ?? null };
  } catch {
    return { comps: [], marketValue: null };
  }
}

async function fetchRent(address: string): Promise<number> {
  try {
    const url = `${BASE}/avm/rent/long-term?address=${encodeURIComponent(address)}`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) return 0;
    const data = (await res.json()) as { rent?: number };
    return data.rent ?? 0;
  } catch {
    return 0;
  }
}

async function mapListing(listing: RentcastListing): Promise<Property> {
  const address =
    listing.formattedAddress ??
    `${listing.addressLine1}, ${listing.city}, ${listing.state} ${listing.zipCode}`;
  const [{ comps, marketValue }, rent] = await Promise.all([
    fetchComps(address),
    fetchRent(address),
  ]);

  return {
    id: listing.id ?? address,
    address: listing.addressLine1 ?? listing.formattedAddress ?? address,
    city: listing.city ?? "",
    state: listing.state ?? "NV",
    zip: listing.zipCode ?? "",
    lat: listing.latitude ?? 0,
    lng: listing.longitude ?? 0,
    propertyType: mapType(listing.propertyType),
    beds: listing.bedrooms ?? 0,
    baths: listing.bathrooms ?? 0,
    sqft: listing.squareFootage ?? 0,
    lotSqft: listing.lotSize ?? 0,
    yearBuilt: listing.yearBuilt ?? 1990,
    listPrice: listing.price ?? marketValue ?? 0,
    daysOnMarket: listing.daysOnMarket ?? 0,
    status: "active",
    // RentCast does not provide agent remarks; MLS will. Left blank so the
    // remark-based deal-killer NLP simply has nothing to flag (age-based
    // rehab inference still applies).
    listingRemarks: "",
    photos: [],
    priceHistory: mapHistory(listing),
    comps,
    distressSignals: deriveDistress(listing),
    dealKillers: [],
    crimeScore: 50,
    schoolScore: 50,
    floodZone: false,
    neighborhoodGrowth: 0,
    rentalDemand: 60,
    investorCompetition: 50,
    estimatedRentMonthly: rent,
    firstSeen: new Date().toISOString(),
    lastScanned: new Date().toISOString(),
  };
}

// Lightweight distress inference from listing metadata available pre-MLS.
function deriveDistress(listing: RentcastListing): Property["distressSignals"] {
  const signals: Property["distressSignals"] = [];
  if ((listing.daysOnMarket ?? 0) >= 60) signals.push("long_dom");
  const hist = listing.history ?? {};
  const drops = Object.values(hist).filter(
    (h) => h?.event === "Price Change"
  ).length;
  if (drops >= 1) signals.push("major_price_reduction");
  return signals;
}

export interface ScanParams {
  city?: string;
  state?: string;
  zipCode?: string;
  maxPrice?: number;
  limit?: number;
}

// Pull active sale listings and enrich each with comps + rent. Returns mapped
// Property[] ready for the analysis engine. Throws if RentCast isn't configured.
export async function scanRentcast(params: ScanParams): Promise<Property[]> {
  if (!isRentcastConfigured()) {
    throw new Error("RentCast is not configured (set RENTCAST_API_KEY).");
  }
  const q = new URLSearchParams({
    status: "Active",
    limit: String(params.limit ?? 20),
  });
  if (params.city) q.set("city", params.city);
  if (params.state) q.set("state", params.state);
  if (params.zipCode) q.set("zipCode", params.zipCode);
  if (params.maxPrice) q.set("maxPrice", String(params.maxPrice));

  const res = await fetch(`${BASE}/listings/sale?${q.toString()}`, {
    headers: headers(),
  });
  if (!res.ok) {
    throw new Error(`RentCast listings error: ${res.status} ${res.statusText}`);
  }
  const listings = (await res.json()) as RentcastListing[];
  // Enrich sequentially-ish but bounded to avoid rate limits.
  const out: Property[] = [];
  for (const listing of listings) {
    out.push(await mapListing(listing));
  }
  return out;
}
