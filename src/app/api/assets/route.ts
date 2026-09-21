import { NextRequest, NextResponse } from "next/server";
import { getStore, calculateAssetSpend } from "@/lib/mockData";
import { DEMO_HOUSEHOLD_ID, DEMO_USERS } from "@/lib/constants";
import type { AssetWithCoverage } from "@/types/domain";

export async function GET(req: NextRequest) {
  try {
    const store = getStore();
    const queryHhId = req.nextUrl.searchParams.get("household_id");
    const cookieHhId = req.cookies.get("homevault_household_id")?.value;
    const targetHhId = queryHhId || cookieHhId;

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
    const body = await req.json();
    const store = getStore();

    const newId = `asset-${Date.now()}`;
    const warrantyEnd = new Date(
      Date.now() + (body.warranty_months || 12) * 30 * 86400000
    )
      .toISOString()
      .split("T")[0];

    const cookieHhId = req.cookies.get("homevault_household_id")?.value;
    const cookieUserId = req.cookies.get("homevault_user_id")?.value;

    const newAsset: AssetWithCoverage = {
      id: newId,
      household_id: body.household_id || cookieHhId || DEMO_HOUSEHOLD_ID,
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
      created_by: cookieUserId || DEMO_USERS.priya,
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

    return NextResponse.json({ ok: true, data: newAsset });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to register asset" },
      { status: 500 }
    );
  }
}
