import * as onboarding from "@/actions/onboarding";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/complaints/[id]/media/route";

async function run() {
  console.log("=== UNIT TEST FOR /api/complaints/[id]/media MULTI-TENANT ISOLATION ===");

  let currentSession: any = null;

  try {
    Object.defineProperty(onboarding, "getCurrentUserSession", {
      value: async () => currentSession,
      configurable: true,
      writable: true,
    });
  } catch (e) {
    console.log("Could not redefine property directly:", e.message);
    return;
  }

  const complaintId = "ffffffff-0000-0000-0000-000000000001"; // Assigned to CoolCare (DEMO_BUSINESS_ID)

  // 1. Unauthenticated
  console.log("\n1. Unauthenticated test:");
  currentSession = null;
  const req1 = new NextRequest(`http://localhost:3000/api/complaints/${complaintId}/media`);
  const res1 = await GET(req1, { params: Promise.resolve({ id: complaintId }) });
  const json1 = await res1.json();
  console.log(`Status: ${res1.status}, error:`, json1.error);
  if (res1.status === 401) {
    console.log("-> PASS: Unauthenticated rejected with 401");
  } else {
    throw new Error(`Expected 401, got ${res1.status}`);
  }

  // 2. Assigned Business Admin
  console.log("\n2. Assigned Business Admin test:");
  currentSession = {
    userId: "33333333-3333-3333-3333-333333333333",
    email: "desk@coolcare.demo",
    fullName: "Rahul Menon",
    role: "business",
    householdId: null,
    businessId: "bbbbbbbb-0000-0000-0000-000000000001", // CoolCare
    isHouseholdOwner: false,
    isBusinessAdmin: true,
    hasHouseholdMembership: false,
    hasBusinessMembership: true,
  };
  const req2 = new NextRequest(`http://localhost:3000/api/complaints/${complaintId}/media`);
  const res2 = await GET(req2, { params: Promise.resolve({ id: complaintId }) });
  const json2 = await res2.json();
  console.log(`Status: ${res2.status}, ok:`, json2.ok);
  console.log(`Video media url present:`, !!json2.data?.[0]?.signed_url);
  if (res2.status === 200 && json2.ok && json2.data?.[0]?.signed_url) {
    console.log("-> PASS: Assigned business admin receives 200 OK and signed URL!");
  } else {
    throw new Error(`Expected 200, got ${res2.status}`);
  }

  // 3. Unrelated Business Admin
  console.log("\n3. Unrelated Business Admin test:");
  currentSession = {
    userId: "55555555-5555-5555-5555-555555555555",
    email: "admin@unrelatedrepair.demo",
    fullName: "Other Biz Admin",
    role: "business",
    householdId: null,
    businessId: "bbbbbbbb-9999-9999-9999-999999999999", // Unrelated business!
    isHouseholdOwner: false,
    isBusinessAdmin: true,
    hasHouseholdMembership: false,
    hasBusinessMembership: true,
  };
  const req3 = new NextRequest(`http://localhost:3000/api/complaints/${complaintId}/media`);
  const res3 = await GET(req3, { params: Promise.resolve({ id: complaintId }) });
  const json3 = await res3.json();
  console.log(`Status: ${res3.status}, error:`, json3.error);
  if (res3.status === 403 && json3.error?.includes("not assigned to your business")) {
    console.log("-> PASS: Unrelated business access blocked with 403 Forbidden!");
  } else {
    throw new Error(`Expected 403, got ${res3.status}`);
  }

  // 4. Unrelated Household User
  console.log("\n4. Unrelated Household test:");
  currentSession = {
    userId: "77777777-7777-7777-7777-777777777777",
    email: "stranger@otherfamily.demo",
    fullName: "Stranger User",
    role: "household",
    householdId: "hhhhhhhh-9999-9999-9999-999999999999", // Other household
    businessId: null,
    isHouseholdOwner: true,
    isBusinessAdmin: false,
    hasHouseholdMembership: true,
    hasBusinessMembership: false,
  };
  const req4 = new NextRequest(`http://localhost:3000/api/complaints/${complaintId}/media`);
  const res4 = await GET(req4, { params: Promise.resolve({ id: complaintId }) });
  const json4 = await res4.json();
  console.log(`Status: ${res4.status}, error:`, json4.error);
  if (res4.status === 403 && json4.error?.includes("do not own this complaint")) {
    console.log("-> PASS: Unrelated household access blocked with 403 Forbidden!");
  } else {
    throw new Error(`Expected 403, got ${res4.status}`);
  }

  console.log("\n=== ALL ISOLATION GUARDS VERIFIED SUCCESSFULLY! ===");
}

run().catch((e) => {
  console.error("Verification failed:", e);
  process.exit(1);
});
