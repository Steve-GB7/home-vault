import { NextRequest, NextResponse } from "next/server";
import { getStore, calculateAssetSpend } from "@/lib/mockData";
import { DEMO_BUSINESS_ID } from "@/lib/constants";
import type { ServiceLog } from "@/types/domain";

export async function GET(req: NextRequest) {
  try {
    const store = getStore();
    return NextResponse.json({ ok: true, data: store.serviceLogs });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to fetch service logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = getStore();

    const labour = Number(body.labour_cost) || 0;
    const parts = Number(body.parts_cost) || 0;
    const total = labour + parts;

    const newLog: ServiceLog = {
      id: `s-${Date.now()}`,
      asset_id: body.asset_id,
      business_id: body.business_id || DEMO_BUSINESS_ID,
      complaint_id: body.complaint_id || null,
      technician_name: body.technician_name || "Rahul Menon",
      stype: body.stype || "repair",
      service_date: body.service_date || new Date().toISOString().split("T")[0],
      work_performed: body.work_performed || "Appliance repair completed",
      parts_replaced: body.parts_replaced || [],
      labour_cost: labour,
      parts_cost: parts,
      total_cost: total,
      covered_by_warranty: !!body.covered_by_warranty,
      next_service_date: body.next_service_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.serviceLogs.unshift(newLog);

    // If complaintId was provided, resolve the complaint
    if (body.complaint_id) {
      const complaint = store.complaints.find((c) => c.id === body.complaint_id);
      if (complaint) {
        complaint.status = "resolved";
        complaint.resolved_at = new Date().toISOString();
        complaint.resolution_notes = body.work_performed;
      }
    }

    // Recalculate spend on the asset
    const updatedSpend = calculateAssetSpend(body.asset_id);
    const asset = store.assets.find((a) => a.id === body.asset_id);
    if (asset && updatedSpend) {
      asset.spend = updatedSpend;
    }

    return NextResponse.json({
      ok: true,
      data: newLog,
      spend: updatedSpend,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to create service log" },
      { status: 500 }
    );
  }
}
