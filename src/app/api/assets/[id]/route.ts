import { NextRequest, NextResponse } from "next/server";
import { getStore, calculateAssetSpend } from "@/lib/mockData";
import type { TimelineEvent } from "@/types/domain";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const store = getStore();
    const asset = store.assets.find((a) => a.id === id);

    if (!asset) {
      return NextResponse.json(
        { ok: false, error: "Asset not found" },
        { status: 404 }
      );
    }

    const spend = calculateAssetSpend(id);
    const docs = store.documents.filter((d) => d.asset_id === id);
    const services = store.serviceLogs.filter((s) => s.asset_id === id);
    const complaints = store.complaints.filter((c) => c.asset_id === id);

    // Build chronological timeline events
    const timeline: TimelineEvent[] = [];

    // 1. Purchase
    if (asset.purchase_date) {
      timeline.push({
        id: `tl-purchase-${asset.id}`,
        type: "purchase",
        date: asset.purchase_date,
        title: "Purchased & Registered",
        subtitle: asset.seller_name ? `Purchased from ${asset.seller_name}` : undefined,
        description: `Registered with ${asset.capacity_spec || "standard specifications"}.`,
        cost: asset.purchase_price ?? undefined,
      });
    }

    // 2. Services
    services.forEach((s) => {
      const partsSummary =
        Array.isArray(s.parts_replaced) && s.parts_replaced.length > 0
          ? s.parts_replaced.map((p: any) => `${p.part} (${p.qty}x)`).join(", ")
          : "None";

      timeline.push({
        id: `tl-service-${s.id}`,
        type: "service",
        date: s.service_date,
        title: `${s.stype?.replace("_", " ").toUpperCase() || "SERVICE"}`,
        subtitle: `Technician: ${s.technician_name || "Authorized Tech"}`,
        description: s.work_performed,
        cost: (s.labour_cost || 0) + (s.parts_cost || 0),
        metadata: {
          technician: s.technician_name,
          labourCost: s.labour_cost,
          partsCost: s.parts_cost,
          partsSummary,
        },
      });
    });

    // 3. Complaints
    complaints.forEach((c) => {
      timeline.push({
        id: `tl-complaint-${c.id}`,
        type: "complaint",
        date: c.created_at.split("T")[0],
        title: `Complaint Raised: ${c.title}`,
        subtitle: `Status: ${c.status} • Priority: ${c.priority}`,
        description: c.description,
      });
    });

    // Sort timeline descending by date
    timeline.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({
      ok: true,
      data: {
        asset: {
          ...asset,
          spend: spend || asset.spend,
        },
        documents: docs,
        timeline,
        services,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to load asset details" },
      { status: 500 }
    );
  }
}
