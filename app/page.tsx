import Dashboard from "./components/Dashboard";
import { loadScoredDeals } from "./lib/db/deals-repo";
import { listBuyers } from "./lib/db/buyers-repo";
import { buildMarketSummary } from "./lib/deals";
import { isSupabaseConfigured, isRentcastConfigured } from "./lib/env";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Reads from Supabase when configured; otherwise computes scored deals from
  // sample data and serves the in-memory buyer store. Buyer matches and alerts
  // are computed on the client so they stay reactive to CRM edits.
  const [scored, buyers] = await Promise.all([loadScoredDeals(), listBuyers()]);
  const summary = buildMarketSummary(scored);

  return (
    <Dashboard
      initialDeals={scored}
      summary={summary}
      initialBuyers={buyers}
      persisted={isSupabaseConfigured()}
      liveData={isRentcastConfigured()}
    />
  );
}
