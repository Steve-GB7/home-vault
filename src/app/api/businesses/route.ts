import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/mockData";
import { isSupabaseConfigured, createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
          .from("businesses")
          .select("id, name, btype, city, service_categories, contact_phone, contact_email")
          .order("name", { ascending: true });

        if (!error && data && data.length > 0) {
          return NextResponse.json({ ok: true, data });
        }
      } catch {
        // Fall back to mock store
      }
    }

    const store = getStore();
    return NextResponse.json({
      ok: true,
      data: store.businesses.map((b) => ({
        id: b.id,
        name: b.name,
        btype: b.btype,
        city: b.city,
        service_categories: b.service_categories,
        contact_phone: b.contact_phone,
        contact_email: b.contact_email,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}
