import { getStore } from "@/lib/mockData";

async function runTests() {
  console.log("=== RUNNING MULTI-TENANT ISOLATION & VIDEO ACCESS VERIFICATION ===");

  const store = getStore();
  const complaintId = "ffffffff-0000-0000-0000-000000000001";
  const assignedBusinessId = "bbbbbbbb-0000-0000-0000-000000000001";
  const unrelatedBusinessId = "bbbbbbbb-9999-9999-9999-999999999999";
  
  // Setup an unrelated business and its admin in mock store for realistic multi-tenant testing
  const unrelatedUserId = "user-unrelated-biz-admin";
  if (!store.users.find((u) => u.id === unrelatedUserId)) {
    store.users.push({
      id: unrelatedUserId,
      email: "boss@unrelatedrepair.com",
      full_name: "Unrelated Biz Boss",
      password: "password123",
    });
    store.businesses.push({
      id: unrelatedBusinessId,
      name: "Apex Electronics & Repair",
      btype: "service_center",
      contact_email: "boss@unrelatedrepair.com",
      contact_phone: "+91-9999-000011",
      city: "Kochi",
      service_categories: ["air_conditioner"],
      tier: "pro",
      is_approved: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    store.businessMembers.push({
      id: "bm-unrelated",
      business_id: unrelatedBusinessId,
      user_id: unrelatedUserId,
      is_admin: true,
      display_name: "Unrelated Biz Boss",
      created_at: new Date().toISOString(),
    });
  }

  // Setup an unrelated household member
  const unrelatedHouseholdUserId = "user-unrelated-household";
  if (!store.users.find((u) => u.id === unrelatedHouseholdUserId)) {
    store.users.push({
      id: unrelatedHouseholdUserId,
      email: "stranger@otherfamily.com",
      full_name: "Stranger User",
      password: "password123",
    });
    store.householdMembers.push({
      id: "hm-unrelated",
      household_id: "hh-other-9999",
      user_id: unrelatedHouseholdUserId,
      member_role: "owner",
      joined_at: new Date().toISOString(),
    });
  }

  const BASE_URL = "http://localhost:3000";

  // Test 1: Unauthenticated
  console.log("\n[Test 1] Unauthenticated request to /api/complaints/[id]/media");
  const res1 = await fetch(`${BASE_URL}/api/complaints/${complaintId}/media`);
  const json1 = await res1.json();
  console.log(`Status: ${res1.status}, body:`, json1);
  if (res1.status === 401) {
    console.log("-> PASS: 401 Unauthorized for unauthenticated requests.");
  } else {
    throw new Error(`Expected 401 but got ${res1.status}`);
  }

  // Test 2: Assigned Business Admin
  const assignedUserId = "33333333-3333-3333-3333-333333333333"; // Rahul Menon (CoolCare desk@coolcare.demo)
  console.log("\n[Test 2] Assigned Business Admin access to /api/complaints/[id]/media");
  const res2 = await fetch(`${BASE_URL}/api/complaints/${complaintId}/media`, {
    headers: {
      Cookie: `homevault_user_id=${assignedUserId}`,
    },
  });
  const json2 = await res2.json();
  console.log(`Status: ${res2.status}, ok:`, json2.ok);
  console.log(`Media items count:`, json2.data?.length);
  const videoItem = json2.data?.find((m: any) => m.mtype === "video");
  console.log(`Video evidence details:`, {
    id: videoItem?.id,
    mtype: videoItem?.mtype,
    signed_url: videoItem?.signed_url?.slice(0, 50) + "...",
    duration_seconds: videoItem?.duration_seconds,
  });

  if (res2.status === 200 && json2.ok && videoItem?.signed_url) {
    console.log("-> PASS: Assigned business admin receives 200 OK and playable signed video URL!");
  } else {
    throw new Error(`Expected 200 with signed URL but got ${res2.status}`);
  }

  // Test 3: Unrelated Business Admin
  console.log("\n[Test 3] Unrelated Business Admin access to /api/complaints/[id]/media");
  const res3 = await fetch(`${BASE_URL}/api/complaints/${complaintId}/media`, {
    headers: {
      Cookie: `homevault_user_id=${unrelatedUserId}`,
    },
  });
  const json3 = await res3.json();
  console.log(`Status: ${res3.status}, body:`, json3);
  if (res3.status === 403 && json3.error?.includes("not assigned to your business")) {
    console.log("-> PASS: 403 Forbidden! Unrelated business cannot access the evidence video.");
  } else {
    throw new Error(`Expected 403 Forbidden for unrelated business but got ${res3.status}`);
  }

  // Test 4: Unrelated Household User
  console.log("\n[Test 4] Unrelated Household access to /api/complaints/[id]/media");
  const res4 = await fetch(`${BASE_URL}/api/complaints/${complaintId}/media`, {
    headers: {
      Cookie: `homevault_user_id=${unrelatedHouseholdUserId}`,
    },
  });
  const json4 = await res4.json();
  console.log(`Status: ${res4.status}, body:`, json4);
  if (res4.status === 403 && json4.error?.includes("do not own this complaint")) {
    console.log("-> PASS: 403 Forbidden! Unrelated household cannot access the complaint media.");
  } else {
    throw new Error(`Expected 403 Forbidden for unrelated household but got ${res4.status}`);
  }

  console.log("\n========================================================");
  console.log("  ALL TESTS PASSED: MULTI-TENANT ISOLATION FULLY VERIFIED!  ");
  console.log("========================================================");
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
