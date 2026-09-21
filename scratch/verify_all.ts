import { signUpBusiness } from "@/actions/onboarding";

async function verify() {
  console.log("=== COMPREHENSIVE VERIFICATION FOR VIDEO ACCESS BUGFIX ===");
  const BASE_URL = "http://localhost:3000";
  const COMPLAINT_ID = "ffffffff-0000-0000-0000-000000000001";
  const ASSIGNED_BIZ_USER_ID = "33333333-3333-3333-3333-333333333333"; // CoolCare (assigned)

  // 1. Check Unauthenticated Access
  console.log("\n1. Testing unauthenticated user access to complaint media endpoint:");
  const res1 = await fetch(`${BASE_URL}/api/complaints/${COMPLAINT_ID}/media`);
  const json1 = await res1.json();
  console.log(`Status: ${res1.status}, response:`, json1);
  if (res1.status !== 401) {
    throw new Error(`Expected 401 but got ${res1.status}`);
  }
  console.log("✓ PASS: Unauthenticated access rejected with 401");

  // 2. Check Assigned Business Admin Access
  console.log("\n2. Testing assigned business admin access:");
  const res2 = await fetch(`${BASE_URL}/api/complaints/${COMPLAINT_ID}/media`, {
    headers: {
      Cookie: `homevault_user_id=${ASSIGNED_BIZ_USER_ID}`,
    },
  });
  const json2 = await res2.json();
  console.log(`Status: ${res2.status}, ok:`, json2.ok);
  console.log(`Media items count:`, json2.data?.length);
  const videoItem = json2.data?.find((m: any) => m.mtype === "video");
  console.log(`Video evidence:`, {
    id: videoItem?.id,
    mtype: videoItem?.mtype,
    signed_url: videoItem?.signed_url ? `${videoItem.signed_url.slice(0, 50)}...` : null,
    duration: videoItem?.duration_seconds,
  });
  if (res2.status !== 200 || !videoItem?.signed_url) {
    throw new Error("Assigned business admin could not retrieve video evidence!");
  }
  console.log("✓ PASS: Assigned business admin retrieved authenticated signed video URL");

  // 3. Create & Test an Unrelated Business Admin
  console.log("\n3. Testing unrelated business admin access (Multi-Tenant Isolation):");
  const rand = Math.floor(Math.random() * 10000);
  const unrelatedEmail = `unrelated.biz.${rand}@test.demo`;
  const signUpRes = await signUpBusiness({
    fullName: "Apex Service Admin",
    email: unrelatedEmail,
    password: "Password@123",
    businessName: `Apex Care Services ${rand}`,
    btype: "service_center",
    serviceCategories: ["air_conditioner"],
    city: "Ernakulam",
    contactPhone: "+91-9876-543210",
  });
  console.log("Unrelated business signup result:", {
    ok: signUpRes.ok,
    userId: signUpRes.data?.userId,
    businessId: signUpRes.data?.businessId,
  });

  const unrelatedUserId = signUpRes.data?.userId;
  if (!unrelatedUserId) {
    throw new Error("Failed to create unrelated business for testing");
  }

  // Now the unrelated business admin tries to access the complaint assigned to CoolCare:
  const res3 = await fetch(`${BASE_URL}/api/complaints/${COMPLAINT_ID}/media`, {
    headers: {
      Cookie: `homevault_user_id=${unrelatedUserId}`,
    },
  });
  const json3 = await res3.json();
  console.log(`Status: ${res3.status}, body:`, json3);
  if (res3.status === 403 && json3.error?.includes("not assigned to your business")) {
    console.log("✓ PASS: Unrelated business is strictly BLOCKED with 403 Forbidden!");
  } else {
    throw new Error(`Expected 403 Forbidden for unrelated business but got ${res3.status}`);
  }

  console.log("\n========================================================");
  console.log("   ALL VERIFICATIONS CONFIRMED & WORKING AS EXPECTED!   ");
  console.log("========================================================");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
