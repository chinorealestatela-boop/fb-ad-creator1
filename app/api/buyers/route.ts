import { NextRequest, NextResponse } from "next/server";
import { listBuyers, createBuyer } from "../../lib/db/buyers-repo";
import type { Buyer } from "../../lib/types";
import { isSupabaseConfigured } from "../../lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const buyers = await listBuyers();
    return NextResponse.json({ buyers, persisted: isSupabaseConfigured() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load buyers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Buyer>;
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }
    const buyer: Buyer = {
      id: body.id || `buyer-${Date.now()}`,
      name: body.name,
      company: body.company,
      email: body.email,
      phone: body.phone,
      notes: body.notes,
      active: body.active ?? true,
      createdAt: new Date().toISOString(),
      buyBox: {
        minPrice: body.buyBox?.minPrice ?? 0,
        maxPrice: body.buyBox?.maxPrice ?? 0,
        zips: body.buyBox?.zips ?? [],
        cities: body.buyBox?.cities ?? [],
        propertyTypes: body.buyBox?.propertyTypes ?? [],
        strategies: body.buyBox?.strategies ?? ["flip"],
        minBeds: body.buyBox?.minBeds ?? 0,
        minBaths: body.buyBox?.minBaths ?? 0,
        maxRehabLevel: body.buyBox?.maxRehabLevel ?? "moderate",
        minProfit: body.buyBox?.minProfit ?? 0,
        minRoiPct: body.buyBox?.minRoiPct ?? 0,
        avoidHighCrime: body.buyBox?.avoidHighCrime ?? true,
      },
    };
    const created = await createBuyer(buyer);
    return NextResponse.json({ buyer: created });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create buyer" },
      { status: 500 }
    );
  }
}
