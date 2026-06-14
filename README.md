# DealRadar

**AI-driven real estate investment acquisition platform.** Finds undervalued
residential properties in Las Vegas (and beyond) before other investors,
analyzes every deal end to end, scores it 1–100, and routes it either to you
(to flip) or to a buyer on your network (to wholesale/assign).

Built for a fix-and-flip investor with a "clean cosmetic distressed" buy box:
distressed in **price**, not in **construction**.

## Status

**Phase 0 — Foundation (current).** Runs entirely on realistic Las Vegas sample
data, no API keys required. Implemented:

- **Deal analysis engine** (`app/lib/analysis.ts`) — market value, ARV, rehab,
  holding/closing/financing costs, net profit, ROI, MAO, cap rate, strategy,
  Gold/Silver/Bronze classification, and a cost-of-capital test.
- **1–100 scoring engine** (`app/lib/scoring.ts`) — weighted score with
  deal-killer and cost-of-capital penalties, tiers, reasons, risks, opportunities.
- **Buyer matching engine** (`app/lib/matching.ts`) — routes each deal to every
  buyer's stored buy box; strong matches (≥70%) are CMA-ready.
- **Dashboard** — ranked list, card grid, and map views; deal-detail report;
  Buyer Network CRM; daily market report; priority alerts.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Live data & persistence (Phase 1 — wired)

- **Supabase** (`app/lib/db/`) — buyers and scored-deal snapshots persist to
  Postgres when configured; otherwise an in-memory fallback keeps the UI fully
  functional. Schema: `docs/DATABASE_SCHEMA.sql`.
- **RentCast** (`app/lib/sources/rentcast.ts`) — the **Run Scan** button and
  `POST /api/scan` pull live Las Vegas listings + comps and score them.
- **Buyer CRM** — add / edit / delete buyers and their buy boxes from the
  Buyer Network tab; matches recompute live across every deal.

See `docs/SETUP.md` to connect Supabase + RentCast (both have free tiers).

## What's next

CMA generation (Claude) + Gmail delivery to matched buyers; Twilio SMS + push
alerts; emailed PDF daily report; neighborhood enrichment (crime/schools/flood);
contractor/rehab module; portfolio tracking. See `docs/PRD.md`.

## Configuration

Copy `.env.example` → `.env.local`. The app runs with no keys set; add them to
enable live data, persistence, and notifications.
