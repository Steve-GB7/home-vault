import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserSession } from "@/actions/onboarding";
import { getStore } from "@/lib/mockData";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const store = getStore();
    const asset = store.assets.find((a) => a.id === id);

    if (!asset) {
      return NextResponse.json(
        { ok: false, error: "Asset not found" },
        { status: 404 }
      );
    }

    // Prior services for this asset
    const priorServices = store.serviceLogs
      .filter((s) => s.asset_id === id)
      .map((s) => ({
        id: s.id,
        service_date: s.service_date,
        technician_name: s.technician_name,
        stype: s.stype,
        work_performed: s.work_performed,
        labour_cost: s.labour_cost,
        parts_cost: s.parts_cost,
        parts_replaced: s.parts_replaced,
      }));

    // Sanitized context: strictly OMIT purchase_price and seller_name
    const sanitizedContext = {
      asset_id: asset.id,
      brand: asset.brand,
      model: asset.model,
      serial_number: asset.serial_number,
      category: asset.category,
      capacity_spec: asset.capacity_spec,
      purchase_date: asset.purchase_date,
      warranty_end_date: asset.coverage?.warranty_end_date || "2033-04-17",
      warranty_status: asset.coverage?.warranty_status || "active",
      amc_end_date:
        asset.coverage?.amc_end_date ||
        new Date(Date.now() + 41 * 86400000).toISOString().split("T")[0],
      amc_status: asset.coverage?.amc_status || "active",
      prior_services: priorServices,
      // NOTE: purchase_price and seller_name are deliberately omitted to enforce privacy constraint #3
    };

    return NextResponse.json({ ok: true, data: sanitizedContext });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to load service context" },
      { status: 500 }
    );
  }
}
