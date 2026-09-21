import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/mockData";
import { LEGAL_TRANSITIONS } from "@/lib/constants";
import type { ComplaintStatus } from "@/types/domain";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    return NextResponse.json({ ok: true, data: complaint });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to update complaint status" },
      { status: 500 }
    );
  }
}
