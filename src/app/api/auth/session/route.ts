import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserSession } from "@/actions/onboarding";
import { getStore } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUserSession();

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
    // Return a valid non-authenticated session instead of an error
    return NextResponse.json({
      ok: true,
      data: {
        userId: null,
        email: null,
        fullName: "Guest",
        role: "household",
        householdId: null,
        businessId: null,
        isHouseholdOwner: false,
        isBusinessAdmin: false,
        hasHouseholdMembership: false,
        hasBusinessMembership: false,
        orgName: "HomeVault",
        btype: "service_center",
      },
    });
  }
}
