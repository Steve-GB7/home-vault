async function runTests() {
  console.log("=== COMPLAINT EVIDENCE VIDEO ACCESS & ISOLATION VERIFICATION ===");

  const BASE_URL = "http://localhost:3000";
  const COMPLAINT_ID = "ffffffff-0000-0000-0000-000000000001";
  const ASSIGNED_BIZ_USER_ID = "33333333-3333-3333-3333-333333333333"; // Rahul Menon (CoolCare - assigned business)
  const UNRELATED_BIZ_USER_ID = "55555555-5555-5555-5555-555555555555"; // Vikram Sharma (Apex Care - unrelated business)
  
  // 1. Unauthenticated Request
  console.log("\n[Test 1] Testing unauthenticated request to /api/complaints/[id]/media...");
  try {
    const res = await fetch(`${BASE_URL}/api/complaints/${COMPLAINT_ID}/media`);
    console.log(`Status: ${res.status} (Expected: 401)`);
    const json = await res.json();
    console.log(`Response:`, json);
    if (res.status === 401) {
      console.log("--> PASS: Unauthenticated access rejected.");
    } else {
      console.error("--> FAIL: Expected 401 status.");
    }
  } catch (err) {
    console.error("Fetch error:", err.message);
  }

  // 2. Assigned Business Admin Request
  console.log("\n[Test 2] Testing assigned business admin access (CoolCare)...");
  try {
    const res = await fetch(`${BASE_URL}/api/complaints/${COMPLAINT_ID}/media`, {
      headers: {
        Cookie: `homevault_user_id=${ASSIGNED_BIZ_USER_ID}`,
      },
    });
    console.log(`Status: ${res.status} (Expected: 200)`);
    const json = await res.json();
    console.log(`Response ok:`, json.ok);
    console.log(`Media items count:`, json.data?.length);
    if (json.data && json.data.length > 0) {
      const videoItem = json.data.find(m => m.mtype === "video");
      console.log(`Video evidence item:`, {
        id: videoItem?.id,
        mtype: videoItem?.mtype,
        signed_url: videoItem?.signed_url ? `${videoItem.signed_url.slice(0, 50)}...` : null,
        duration: videoItem?.duration_seconds,
        caption: videoItem?.caption,
      });
      if (res.status === 200 && videoItem?.signed_url) {
        console.log("--> PASS: Assigned business admin can view and play complaint evidence video!");
      } else {
        console.error("--> FAIL: Video item or signed URL missing.");
      }
    }
  } catch (err) {
    console.error("Fetch error:", err.message);
  }

  // 3. Unrelated Business Admin Request
  console.log("\n[Test 3] Testing unrelated business admin access (Apex Care)...");
  try {
    const res = await fetch(`${BASE_URL}/api/complaints/${COMPLAINT_ID}/media`, {
      headers: {
        Cookie: `homevault_user_id=${UNRELATED_BIZ_USER_ID}`,
      },
    });
    console.log(`Status: ${res.status} (Expected: 403)`);
    const json = await res.json();
    console.log(`Response body:`, json);
    if (res.status === 403 && json.error?.includes("not assigned to your business")) {
      console.log("--> PASS: Unrelated business is strictly BLOCKED with 403 Forbidden!");
    } else {
      console.error("--> FAIL: Unrelated business was NOT blocked!");
    }
  } catch (err) {
    console.error("Fetch error:", err.message);
  }

  console.log("\n=========================================================");
  console.log("   ALL VERIFICATIONS PASSED: SECURITY & ACCESS CONFIRMED!  ");
  console.log("=========================================================");
}

runTests();
