import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserSession } from "@/actions/onboarding";
import { getStore } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUserSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    let orgName = "HomeVault";
    let btype = "service_center";

    try {
      const store = getStore();
      if (session.role === "household" && session.householdId) {
        const hh = store.households?.find((h) => h.id === session.householdId);
        if (hh) orgName = hh.name;
      } else if (session.role === "business" && session.businessId) {
        const biz = store.businesses?.find((b) => b.id === session.businessId);
        if (biz) {
          orgName = biz.name;
          btype = biz.btype;
        }
      }
    } catch {
      // Store might not be initialized in some edge cases — use defaults
    }

    return NextResponse.json({
      ok: true,
      data: {
        ...session,
        orgName,
        btype,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
