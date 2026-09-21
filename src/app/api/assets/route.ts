import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUserSession } from "@/actions/onboarding";
import { getStore, calculateAssetSpend } from "@/lib/mockData";
import type { AssetWithCoverage } from "@/types/domain";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const store = getStore();
    // Use session's householdId to scope queries — never trust query params or cookies
    const targetHhId = session.householdId;

    let filteredAssets = store.assets;
    if (targetHhId) {
      filteredAssets = store.assets.filter((a) => a.household_id === targetHhId);
    }

    const assetsWithSpend = filteredAssets.map((asset) => {
      const spend = calculateAssetSpend(asset.id);
      return {
        ...asset,
        spend: spend || asset.spend,
      };
    });

    return NextResponse.json({ ok: true, data: assetsWithSpend });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const store = getStore();

    const newId = `asset-${Date.now()}`;
    const warrantyEnd = new Date(
      Date.now() + (body.warranty_months || 12) * 30 * 86400000
    )
      .toISOString()
      .split("T")[0];

    // Use authenticated session identity — never trust cookies or request body for identity
    const newAsset: AssetWithCoverage = {
      id: newId,
      household_id: session.householdId || "",
      category: body.category || "air_conditioner",
      brand: body.brand || "Unknown",
      model: body.model || "Unknown",
      serial_number: body.serial_number || null,
      nickname: body.nickname || null,
      purchase_date: body.purchase_date || new Date().toISOString().split("T")[0],
      purchase_price: Number(body.purchase_price) || 0,
      seller_name: body.seller_name || null,
      location_in_home: body.location_in_home || "Living Room",
      capacity_spec: null,
      created_by: session.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      image_url: null,
      qr_token: `qr_${newId}`,
      provenance_asset_id: null,
      status: "active",
      coverage: {
        asset_id: newId,
        warranty_end: warrantyEnd,
        amc_end: null,
        warranty_days_left: (body.warranty_months || 12) * 30,
        amc_days_left: null,
        warranty_end_date: warrantyEnd,
        warranty_provider: body.brand,
        warranty_status: "active",
        amc_end_date: null,
        amc_provider: null,
        amc_status: "none",
        best_status: "active",
      },
      spend: {
        asset_id: newId,
        brand: body.brand,
        model: body.model,
        purchase_price: Number(body.purchase_price) || 0,
        total_service_spend: 0,
        service_count: 0,
        last_service_date: null,
        next_service_date: null,
        total_labour_cost: 0,
        total_parts_cost: 0,
        total_service_cost: 0,
        amc_cost: 0,
        service_event_count: 0,
        lifetime_spend: Number(body.purchase_price) || 0,
      },
    };

    store.assets.unshift(newAsset);

    revalidatePath("/dashboard");
    revalidatePath("/service-desk");

    return NextResponse.json({ ok: true, data: newAsset });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to register asset" },
      { status: 500 }
    );
  }
}
