# DealRadar — Setup Guide

The app runs with **no configuration** on sample data. Each integration below
turns on a capability. Add keys to `.env.local` (copy from `.env.example`).

## 1. Supabase (persistence)

Gives durable storage for buyers and scanned deals. Without it, buyers live in
the server's memory for the session and deals come from sample data.

1. Create a project at supabase.com.
2. In the SQL editor, run `docs/DATABASE_SCHEMA.sql`.
3. Copy these into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
4. Restart the dev server. The header banner stops warning about memory-only
   storage, and `GET /api/buyers` returns `"persisted": true`.

**How it's used:** `app/lib/db/supabase.ts` creates the client;
`buyers-repo.ts` and `deals-repo.ts` automatically switch from the in-memory
fallback to Supabase when the keys are present. No code changes needed.

## 2. RentCast (live property data)

Pulls live Las Vegas for-sale listings + comparable sales and runs them through
the analysis/scoring engines.

1. Get an API key at developers.rentcast.io (free tier available).
2. Add to `.env.local`:
   ```
   RENTCAST_API_KEY=...
   ```
3. Restart, then click **Run Scan** in the header (or `POST /api/scan`).

**How it's used:** `app/lib/sources/rentcast.ts` fetches `/listings/sale`,
enriches each with `/avm/value` (comps + market value) and
`/avm/rent/long-term`, and maps everything into the `Property` model. The scan
route scores the results and (if Supabase is connected) saves snapshots.

**Scan payload (optional):**
```json
{ "city": "Las Vegas", "state": "NV", "maxPrice": 500000, "limit": 20, "zipCode": "89110" }
```

## 3. Twice-daily automated scans (later)

The `POST /api/scan` route is cron-ready. On Vercel, add to `vercel.json`:
```json
{ "crons": [
  { "path": "/api/scan", "schedule": "0 14 * * *" },
  { "path": "/api/scan", "schedule": "0 23 * * *" }
] }
```
(14:00 and 23:00 UTC ≈ 7:00 AM and 4:00 PM Pacific.)

## What's still ahead

- Neighborhood enrichment (FBI crime, GreatSchools, FEMA flood) — currently
  neutral defaults on live data; sample data has full values.
- CMA generation (Claude) + Gmail delivery to matched buyers.
- SMS (Twilio) + push alerts; emailed PDF daily report.
- Contractor/rehab module, portfolio tracking, financing finder.
