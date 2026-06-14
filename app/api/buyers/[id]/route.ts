import { NextRequest, NextResponse } from "next/server";
import { updateBuyer, deleteBuyer } from "../../../lib/db/buyers-repo";
import type { Buyer } from "../../../lib/types";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Buyer;
    const updated = await updateBuyer(id, { ...body, id });
    return NextResponse.json({ buyer: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update buyer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteBuyer(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete buyer" },
      { status: 500 }
    );
  }
}
