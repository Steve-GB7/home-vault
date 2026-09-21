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
    const doc = store.documents.find((d) => d.id === id);

    if (!doc) {
      return NextResponse.json(
        { ok: false, error: "Document not found" },
        { status: 404 }
      );
    }

    // Return a dummy verified receipt or placeholder content
    const sampleText = `HomeVault Verified Document
Document ID: ${doc.id}
File Name: ${doc.file_name}
Type: ${doc.doc_type}
Status: Verified by HomeVault
Asset ID: ${doc.asset_id}
OCR Parsed: ${doc.ocr_json ? "Yes" : "No"}`;

    return new NextResponse(sampleText, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${doc.file_name}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to fetch document" },
      { status: 500 }
    );
  }
}
