import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUserSession } from "@/actions/onboarding";
import { getStore } from "@/lib/mockData";
import { LEGAL_TRANSITIONS } from "@/lib/constants";
import type { ComplaintStatus } from "@/types/domain";

export async function PATCH(
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
    const { status } = await req.json();
    const store = getStore();

    const complaint = store.complaints.find((c) => c.id === id);
    if (!complaint) {
      return NextResponse.json(
        { ok: false, error: "Complaint ticket not found" },
        { status: 404 }
      );
    }

    // Verify the user's business is assigned to this complaint
    if (session.businessId && complaint.assigned_business_id !== session.businessId) {
      return NextResponse.json(
        { ok: false, error: "You are not authorized to update this complaint" },
        { status: 403 }
      );
    }

    // Check legal transition
    const allowed = LEGAL_TRANSITIONS[complaint.status] || [];
    if (!allowed.includes(status) && complaint.status !== status) {
      return NextResponse.json(
        {
          ok: false,
          error: `Illegal state transition from ${complaint.status} to ${status}. Allowed: ${allowed.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    complaint.status = status as ComplaintStatus;
    complaint.updated_at = new Date().toISOString();
    if (status === "resolved" || status === "closed") {
      complaint.resolved_at = new Date().toISOString();
    }

    revalidatePath("/complaints");
    revalidatePath("/service-desk");

    return NextResponse.json({ ok: true, data: complaint });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to update complaint status" },
      { status: 500 }
    );
  }
}
