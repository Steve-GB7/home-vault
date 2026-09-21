import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/mockData";
import { DEMO_HOUSEHOLD_ID, DEMO_BUSINESS_ID, DEMO_USERS } from "@/lib/constants";
import type { ComplaintWithAsset } from "@/types/domain";

export async function GET(req: NextRequest) {
  try {
    const store = getStore();
    const queryBizId = req.nextUrl.searchParams.get("business_id");
    const queryHhId = req.nextUrl.searchParams.get("household_id");
    const cookieBizId = req.cookies.get("homevault_business_id")?.value;
    const cookieHhId = req.cookies.get("homevault_household_id")?.value;
    const activeRole = req.cookies.get("homevault_role")?.value;

    let filtered = store.complaints;

    if (queryBizId) {
      filtered = filtered.filter((c) => c.assigned_business_id === queryBizId);
    } else if (queryHhId) {
      filtered = filtered.filter((c) => c.household_id === queryHhId);
    } else if (activeRole === "business" && cookieBizId) {
      filtered = filtered.filter((c) => c.assigned_business_id === cookieBizId);
    } else if (activeRole === "household" && cookieHhId) {
      filtered = filtered.filter((c) => c.household_id === cookieHhId);
    }

    const complaintsWithBusiness = filtered.map((c) => {
      const biz = store.businesses.find((b) => b.id === c.assigned_business_id);
      return {
        ...c,
        businesses: c.businesses || (biz ? { name: biz.name } : undefined),
      };
    });

    return NextResponse.json({ ok: true, data: complaintsWithBusiness });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = getStore();

    const cookieHhId = req.cookies.get("homevault_household_id")?.value;
    const cookieUserId = req.cookies.get("homevault_user_id")?.value;

    const householdId = body.household_id || cookieHhId || DEMO_HOUSEHOLD_ID;
    const household = store.households.find((h) => h.id === householdId);
    const asset = store.assets.find((a) => a.id === body.asset_id);
    const assignedBusinessId = body.assigned_business_id || DEMO_BUSINESS_ID;
    const business = store.businesses.find((b) => b.id === assignedBusinessId);
    const newId = `complaint-${Date.now()}`;

    const newComplaint: ComplaintWithAsset = {
      id: newId,
      ticket_no: `TCK-${Date.now().toString().slice(-6)}`,
      asset_id: body.asset_id,
      household_id: householdId,
      raised_by: cookieUserId || DEMO_USERS.priya,
      assigned_business_id: assignedBusinessId,
      assigned_technician_id: null,
      title: body.title || "Appliance Issue",
      description: body.description || "",
      status: "new",
      priority: body.priority || "high",
      under_warranty: false,
      resolution_notes: null,
      resolved_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assets: asset
        ? {
            brand: asset.brand,
            model: asset.model,
            category: asset.category,
            nickname: asset.nickname,
            serial_number: asset.serial_number,
          }
        : undefined,
      households: {
        name: household?.name || "Household Residence",
      },
      businesses: {
        name: business?.name || "Assigned Service Center",
      },
    };

    store.complaints.unshift(newComplaint);

    return NextResponse.json({ ok: true, data: newComplaint });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to raise complaint" },
      { status: 500 }
    );
  }
}
