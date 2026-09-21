import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUserSession } from "@/actions/onboarding";
import { getStore } from "@/lib/mockData";
import { isSupabaseConfigured, createServerSupabaseClient } from "@/lib/supabase/server";
import type { ComplaintWithAsset } from "@/types/domain";

// Helper for title similarity check (case-insensitive substring match and word overlap)
function isSimilarTitle(t1: string, t2: string): boolean {
  const s1 = t1.toLowerCase().trim();
  const s2 = t2.toLowerCase().trim();
  if (!s1 || !s2) return false;
  if (s1 === s2) return true;
  if (s1.includes(s2) || s2.includes(s1)) return true;

  // Word token overlap for non-trivial words (length >= 3)
  const words1 = new Set(s1.split(/\s+/).filter((w) => w.length >= 3));
  const words2 = new Set(s2.split(/\s+/).filter((w) => w.length >= 3));
  let common = 0;
  for (const w of words1) {
    if (words2.has(w)) common++;
  }
  const minLen = Math.min(words1.size, words2.size);
  if (minLen > 0 && common / minLen >= 0.5) return true;

  return false;
}

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
    let filtered = store.complaints;

    // Scope queries using the authenticated session — never trust cookies or query params
    if (session.role === "business" && session.businessId) {
      filtered = filtered.filter((c) => c.assigned_business_id === session.businessId);
    } else if (session.role === "household" && session.householdId) {
      filtered = filtered.filter((c) => c.household_id === session.householdId);
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
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const store = getStore();

    const householdId = session.householdId || "";
    const assetId = body.asset_id;
    const title = (body.title || "").trim();

    if (!assetId) {
      return NextResponse.json(
        { ok: false, error: "Appliance asset ID is required" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { ok: false, error: "Complaint title is required" },
        { status: 400 }
      );
    }

    // ==========================================
    // 1. MANDATORY VIDEO EVIDENCE VALIDATION
    // ==========================================
    const mediaList = Array.isArray(body.media) ? body.media : [];
    const hasValidVideo = mediaList.some((m: any) => {
      const isVideoType = m.mtype === "video";
      const hasVideoMime = typeof m.mime_type === "string" && m.mime_type.startsWith("video/");
      return (isVideoType || hasVideoMime) && (!m.mime_type || m.mime_type.startsWith("video/"));
    });

    if (!hasValidVideo) {
      return NextResponse.json(
        {
          ok: false,
          error: "Video evidence is mandatory. Please attach at least one valid video file showing the appliance issue.",
        },
        { status: 400 }
      );
    }

    // Validate any declared video media has a valid video MIME type
    for (const m of mediaList) {
      if (m.mtype === "video" && m.mime_type && !m.mime_type.startsWith("video/")) {
        return NextResponse.json(
          {
            ok: false,
            error: "Invalid media format. Video evidence must have a valid video MIME type (e.g. video/mp4).",
          },
          { status: 400 }
        );
      }
    }

    // ==========================================
    // 2. ANTI-FRAUD DUPLICATE COMPLAINT GUARD
    // ==========================================
    const sixtyMinutesAgoMs = Date.now() - 60 * 60 * 1000;

    // Check store complaints for duplicates on same asset raised within last 60 mins
    const existingInStore = store.complaints.find((c) => {
      if (c.asset_id !== assetId) return false;
      if (c.household_id !== householdId) return false;
      const createdAtMs = new Date(c.created_at).getTime();
      if (isNaN(createdAtMs) || createdAtMs < sixtyMinutesAgoMs) return false;
      return isSimilarTitle(c.title, title);
    });

    if (existingInStore) {
      return NextResponse.json(
        {
          ok: false,
          error: "You already raised a similar complaint recently on this asset. View existing ticket instead?",
          is_duplicate: true,
          existing_ticket_id: existingInStore.id,
          existing_ticket_no: existingInStore.ticket_no,
        },
        { status: 409 }
      );
    }

    // If Supabase is configured, check database complaints as well
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        const sixtyMinutesAgoIso = new Date(sixtyMinutesAgoMs).toISOString();

        const { data: dbComplaints } = await supabase
          .from("complaints")
          .select("id, ticket_no, title, created_at")
          .eq("asset_id", assetId)
          .eq("household_id", householdId)
          .gte("created_at", sixtyMinutesAgoIso);

        if (dbComplaints && dbComplaints.length > 0) {
          const matchingDb = dbComplaints.find((c) => isSimilarTitle(c.title, title));
          if (matchingDb) {
            return NextResponse.json(
              {
                ok: false,
                error: "You already raised a similar complaint recently on this asset. View existing ticket instead?",
                is_duplicate: true,
                existing_ticket_id: matchingDb.id,
                existing_ticket_no: matchingDb.ticket_no,
              },
              { status: 409 }
            );
          }
        }
      } catch (err) {
        console.warn("Supabase duplicate check fallback:", err);
      }
    }

    // ==========================================
    // 3. CREATE COMPLAINT
    // ==========================================
    const household = store.households.find((h) => h.id === householdId);
    const asset = store.assets.find((a) => a.id === assetId);
    const assignedBusinessId = body.assigned_business_id || "";
    const business = store.businesses.find((b) => b.id === assignedBusinessId);
    const newId = `complaint-${Date.now()}`;
    const newTicketNo = `TCK-${Date.now().toString().slice(-6)}`;

    const newComplaint: ComplaintWithAsset = {
      id: newId,
      ticket_no: newTicketNo,
      asset_id: assetId,
      household_id: householdId,
      raised_by: session.userId,
      assigned_business_id: assignedBusinessId,
      assigned_technician_id: null,
      title,
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
      // Attach verified media items
      media: mediaList,
    } as any;

    store.complaints.unshift(newComplaint);

    // If Supabase is configured, also persist to complaints and complaint_media
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        const { data: insertedComplaint } = await supabase
          .from("complaints")
          .insert({
            asset_id: assetId,
            household_id: householdId,
            raised_by: session.userId,
            assigned_business_id: assignedBusinessId || null,
            title,
            description: body.description || "",
            priority: body.priority || "high",
            status: "new",
          })
          .select()
          .single();

        if (insertedComplaint && mediaList.length > 0) {
          const mediaInserts = mediaList.map((m: any) => ({
            complaint_id: insertedComplaint.id,
            file_path: m.file_path || `complaints/${insertedComplaint.id}/${m.file_name || "evidence.mp4"}`,
            mtype: m.mtype === "video" ? ("video" as const) : ("image" as const),
            caption: m.caption || (m.mtype === "video" ? "Video Evidence" : "Photo Evidence"),
            uploaded_by: session.userId,
          }));

          await supabase.from("complaint_media").insert(mediaInserts);
        }
      } catch (err) {
        console.warn("Supabase complaint insert fallback to store:", err);
      }
    }

    revalidatePath("/complaints");
    revalidatePath("/service-desk");
    revalidatePath("/dashboard");

    return NextResponse.json({ ok: true, data: newComplaint });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to raise complaint" },
      { status: 500 }
    );
  }
}
