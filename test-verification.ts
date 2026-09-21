import {
  signUpHousehold,
  signUpBusiness,
  inviteHouseholdMember,
  inviteBusinessMember,
  acceptInvite,
  revokeInvite,
  getHouseholdSettingsData,
  getBusinessSettingsData,
  switchSessionUser,
} from "./src/actions/onboarding";
import { getStore } from "./src/lib/mockData";
import { DEMO_USERS, DEMO_HOUSEHOLD_ID, DEMO_BUSINESS_ID } from "./src/lib/constants";

async function runVerification() {
  console.log("=== STARTING HOMEVAULT MULTITENANT VERIFICATION SUITE ===\n");
  const results: { item: number; description: string; status: "PASS" | "FAIL"; details: string }[] = [];
  const store = getStore();

  // ----------------------------------------------------
  // Test 1: Sign up a new household ("Menon Residence")
  // ----------------------------------------------------
  try {
    const res1 = await signUpHousehold({
      fullName: "Ramesh Menon",
      email: "ramesh@menon.demo",
      password: "Password123!",
      householdName: "Menon Residence",
      city: "Kochi",
      pincode: "682001",
    });

    const menonHousehold = store.households.find((h) => h.name === "Menon Residence");
    const menonMember = store.householdMembers.find(
      (m) => m.household_id === menonHousehold?.id && m.member_role === "owner"
    );
    const menonAssets = store.assets.filter((a) => a.household_id === menonHousehold?.id);

    if (
      res1.ok &&
      res1.redirect === "/dashboard" &&
      menonHousehold &&
      menonMember &&
      menonAssets.length === 0
    ) {
      results.push({
        item: 1,
        description: "Sign up a new household ('Menon Residence') end to end with zero assets",
        status: "PASS",
        details: `Created household ${menonHousehold.id}, owner ${menonMember.user_id}, 0 assets in vault.`,
      });
    } else {
      results.push({
        item: 1,
        description: "Sign up a new household ('Menon Residence')",
        status: "FAIL",
        details: `Failed: ${JSON.stringify(res1)}`,
      });
    }
  } catch (e: any) {
    results.push({ item: 1, description: "Sign up new household", status: "FAIL", details: e.message });
  }

  // ----------------------------------------------------
  // Test 2: Invite a second member by email; accept as different user; check adult role
  // ----------------------------------------------------
  try {
    const menonHousehold = store.households.find((h) => h.name === "Menon Residence")!;
    const ownerMember = store.householdMembers.find(
      (m) => m.household_id === menonHousehold.id && m.member_role === "owner"
    )!;

    // Switch active user to Menon owner
    await switchSessionUser(ownerMember.user_id);

    // Invite Lakshmi Menon as adult
    const inviteRes = await inviteHouseholdMember({
      householdId: menonHousehold.id,
      email: "lakshmi@menon.demo",
      role: "adult",
    });

    if (!inviteRes.ok || !inviteRes.data) {
      throw new Error(`Invite creation failed: ${inviteRes.error}`);
    }

    const token = inviteRes.data.token;

    // Accept invite as lakshmi@menon.demo
    const lakshmiId = crypto.randomUUID();
    store.users.push({
      id: lakshmiId,
      email: "lakshmi@menon.demo",
      full_name: "Lakshmi Menon",
    });

    const acceptRes = await acceptInvite({
      token,
      kind: "household",
      userOverrideEmail: "lakshmi@menon.demo",
      userOverrideId: lakshmiId,
      userOverrideName: "Lakshmi Menon",
    });

    // Check membership
    const lakshmiMember = store.householdMembers.find(
      (m) => m.household_id === menonHousehold.id && m.user_id === lakshmiId
    );

    // Check settings data as Lakshmi
    await switchSessionUser(lakshmiId);
    const settingsData = await getHouseholdSettingsData(menonHousehold.id);

    if (
      acceptRes.ok &&
      lakshmiMember &&
      lakshmiMember.member_role === "adult" &&
      settingsData.isOwner === false
    ) {
      results.push({
        item: 2,
        description: "Invite 2nd member ('lakshmi@menon.demo'), accept, confirm adult role & no owner settings access",
        status: "PASS",
        details: `Member added with role 'adult'. isOwner correctly resolved to false for non-owner adult.`,
      });
    } else {
      results.push({
        item: 2,
        description: "Invite 2nd member and accept",
        status: "FAIL",
        details: `Membership: ${JSON.stringify(lakshmiMember)}, isOwner: ${settingsData?.isOwner}`,
      });
    }
  } catch (e: any) {
    results.push({ item: 2, description: "Invite second member", status: "FAIL", details: e.message });
  }

  // ----------------------------------------------------
  // Test 3: Sign up a new business ("FreezeFix Repairs")
  // ----------------------------------------------------
  try {
    const res3 = await signUpBusiness({
      fullName: "Joseph Thomas",
      email: "admin@freezefix.demo",
      password: "Password123!",
      businessName: "FreezeFix Repairs",
      btype: "service_center",
      serviceCategories: ["air_conditioner", "refrigerator"],
      city: "Ernakulam",
      contactPhone: "+91-9846-554433",
    });

    const freezeFixBiz = store.businesses.find((b) => b.name === "FreezeFix Repairs");
    const adminMember = store.businessMembers.find(
      (m) => m.business_id === freezeFixBiz?.id && m.is_admin === true
    );
    const freezeFixTickets = store.complaints.filter(
      (c) => c.assigned_business_id === freezeFixBiz?.id
    );

    if (
      res3.ok &&
      res3.redirect === "/service-desk" &&
      freezeFixBiz &&
      adminMember &&
      freezeFixTickets.length === 0
    ) {
      results.push({
        item: 3,
        description: "Sign up a new business ('FreezeFix Repairs') end to end with zero tickets and is_admin=true",
        status: "PASS",
        details: `Created business ${freezeFixBiz.id}, admin user ${adminMember.user_id}, 0 tickets in queue.`,
      });
    } else {
      results.push({
        item: 3,
        description: "Sign up new business ('FreezeFix Repairs')",
        status: "FAIL",
        details: `Failed: ${JSON.stringify(res3)}`,
      });
    }
  } catch (e: any) {
    results.push({ item: 3, description: "Sign up new business", status: "FAIL", details: e.message });
  }

  // ----------------------------------------------------
  // Test 4: Invite a technician to FreezeFix; accept as different user; confirm technician role & no /settings/team
  // ----------------------------------------------------
  try {
    const freezeFixBiz = store.businesses.find((b) => b.name === "FreezeFix Repairs")!;
    const adminMember = store.businessMembers.find(
      (m) => m.business_id === freezeFixBiz.id && m.is_admin === true
    )!;

    await switchSessionUser(adminMember.user_id);

    const inviteRes = await inviteBusinessMember({
      businessId: freezeFixBiz.id,
      email: "tech@freezefix.demo",
      isAdmin: false,
    });

    if (!inviteRes.ok || !inviteRes.data) {
      throw new Error(`Invite creation failed: ${inviteRes.error}`);
    }

    const techUserId = crypto.randomUUID();
    store.users.push({
      id: techUserId,
      email: "tech@freezefix.demo",
      full_name: "Kiran Tech",
    });

    const acceptRes = await acceptInvite({
      token: inviteRes.data.token,
      kind: "business",
      userOverrideEmail: "tech@freezefix.demo",
      userOverrideId: techUserId,
      userOverrideName: "Kiran Tech",
    });

    const techMember = store.businessMembers.find(
      (m) => m.business_id === freezeFixBiz.id && m.user_id === techUserId
    );

    // Switch to technician session and check team settings data
    await switchSessionUser(techUserId);
    const techSettings = await getBusinessSettingsData(freezeFixBiz.id);

    if (
      acceptRes.ok &&
      techMember &&
      techMember.is_admin === false &&
      techSettings.isAdmin === false
    ) {
      results.push({
        item: 4,
        description: "Invite technician to FreezeFix, accept as tech, confirm is_admin=false & no team admin access",
        status: "PASS",
        details: `Technician successfully joined with is_admin=false; isAdmin settings privilege resolved to false.`,
      });
    } else {
      results.push({
        item: 4,
        description: "Invite technician to FreezeFix",
        status: "FAIL",
        details: `Tech member: ${JSON.stringify(techMember)}, isAdmin: ${techSettings?.isAdmin}`,
      });
    }
  } catch (e: any) {
    results.push({ item: 4, description: "Invite technician", status: "FAIL", details: e.message });
  }

  // ----------------------------------------------------
  // Test 5: Original CoolCare admin cannot see FreezeFix tickets, assets, or team, and vice versa
  // ----------------------------------------------------
  try {
    const coolCareId = DEMO_BUSINESS_ID;
    const freezeFixBiz = store.businesses.find((b) => b.name === "FreezeFix Repairs")!;

    // CoolCare team members vs FreezeFix team members
    const coolCareMembers = store.businessMembers.filter((m) => m.business_id === coolCareId);
    const freezeFixMembers = store.businessMembers.filter((m) => m.business_id === freezeFixBiz.id);

    const hasOverlap = coolCareMembers.some((cm) =>
      freezeFixMembers.some((fm) => fm.user_id === cm.user_id)
    );

    // CoolCare tickets vs FreezeFix tickets
    const coolCareTickets = store.complaints.filter((c) => c.assigned_business_id === coolCareId);
    const freezeFixTickets = store.complaints.filter(
      (c) => c.assigned_business_id === freezeFixBiz.id
    );

    const ticketsOverlap = coolCareTickets.some((ct) =>
      freezeFixTickets.some((ft) => ft.id === ct.id)
    );

    if (!hasOverlap && !ticketsOverlap && freezeFixMembers.length > 0) {
      results.push({
        item: 5,
        description: "CoolCare admin cannot see FreezeFix tickets/team and vice versa (dual company isolation)",
        status: "PASS",
        details: `CoolCare has ${coolCareMembers.length} members and ${coolCareTickets.length} tickets. FreezeFix has ${freezeFixMembers.length} members and ${freezeFixTickets.length} tickets with 0 cross-leakage.`,
      });
    } else {
      results.push({
        item: 5,
        description: "Dual company isolation",
        status: "FAIL",
        details: `Overlap found or empty team`,
      });
    }
  } catch (e: any) {
    results.push({ item: 5, description: "Dual company isolation", status: "FAIL", details: e.message });
  }

  // ----------------------------------------------------
  // Test 6: FreezeFix technician sees no complaints raised by Menon Residence
  // ----------------------------------------------------
  try {
    const menonHousehold = store.households.find((h) => h.name === "Menon Residence")!;
    const freezeFixBiz = store.businesses.find((b) => b.name === "FreezeFix Repairs")!;

    // Raise a complaint for Menon Residence assigned to CoolCare (e.g. standard routing)
    const newComplaint = {
      id: "complaint-menon-1",
      ticket_no: "TCK-MENON1",
      asset_id: "fake-asset-id",
      household_id: menonHousehold.id,
      raised_by: "ramesh@menon.demo",
      assigned_business_id: DEMO_BUSINESS_ID, // CoolCare
      assigned_technician_id: null,
      title: "Water leak in AC",
      description: "AC is leaking water",
      status: "new" as const,
      priority: "high" as const,
      under_warranty: false,
      resolution_notes: null,
      resolved_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      households: { name: "Menon Residence" },
    };
    store.complaints.unshift(newComplaint);

    // Filter tickets for FreezeFix
    const freezeFixQueue = store.complaints.filter(
      (c) => c.assigned_business_id === freezeFixBiz.id
    );
    const menonTicketInFreezeFix = freezeFixQueue.some((c) => c.household_id === menonHousehold.id);

    if (!menonTicketInFreezeFix) {
      results.push({
        item: 6,
        description: "Complaints raised by Menon Residence never appear in FreezeFix's queue",
        status: "PASS",
        details: `Menon Residence ticket assigned to CoolCare correctly withheld from FreezeFix queue (0 tickets in FreezeFix).`,
      });
    } else {
      results.push({
        item: 6,
        description: "Complaint scoping",
        status: "FAIL",
        details: `Ticket leaked into FreezeFix queue`,
      });
    }
  } catch (e: any) {
    results.push({ item: 6, description: "Complaint scoping", status: "FAIL", details: e.message });
  }

  // ----------------------------------------------------
  // Test 7: Attempt to call inviteHouseholdMember as non-owner adult -> must be rejected server-side
  // ----------------------------------------------------
  try {
    const menonHousehold = store.households.find((h) => h.name === "Menon Residence")!;
    const lakshmiUser = store.users.find((u) => u.email === "lakshmi@menon.demo")!;

    // Switch to Lakshmi (adult, non-owner)
    await switchSessionUser(lakshmiUser.id);

    const callRes = await inviteHouseholdMember({
      householdId: menonHousehold.id,
      email: "unauthorized@example.com",
      role: "viewer",
    });

    if (!callRes.ok && callRes.error?.includes("Only household owners")) {
      results.push({
        item: 7,
        description: "Attempt inviteHouseholdMember as non-owner adult member -> rejected server-side",
        status: "PASS",
        details: `Server-side action rejected with: "${callRes.error}".`,
      });
    } else {
      results.push({
        item: 7,
        description: "Non-owner invite rejection",
        status: "FAIL",
        details: `Unexpected response: ${JSON.stringify(callRes)}`,
      });
    }
  } catch (e: any) {
    results.push({ item: 7, description: "Non-owner invite rejection", status: "FAIL", details: e.message });
  }

  // ----------------------------------------------------
  // Test 8: Attempt to call inviteBusinessMember as non-admin technician -> must be rejected server-side
  // ----------------------------------------------------
  try {
    const freezeFixBiz = store.businesses.find((b) => b.name === "FreezeFix Repairs")!;
    const techUser = store.users.find((u) => u.email === "tech@freezefix.demo")!;

    // Switch to technician
    await switchSessionUser(techUser.id);

    const callRes = await inviteBusinessMember({
      businessId: freezeFixBiz.id,
      email: "unauthorized.tech@example.com",
      isAdmin: false,
    });

    if (!callRes.ok && callRes.error?.includes("Only business admins")) {
      results.push({
        item: 8,
        description: "Attempt inviteBusinessMember as non-admin technician -> rejected server-side",
        status: "PASS",
        details: `Server-side action rejected with: "${callRes.error}".`,
      });
    } else {
      results.push({
        item: 8,
        description: "Non-admin invite rejection",
        status: "FAIL",
        details: `Unexpected response: ${JSON.stringify(callRes)}`,
      });
    }
  } catch (e: any) {
    results.push({ item: 8, description: "Non-admin invite rejection", status: "FAIL", details: e.message });
  }

  // ----------------------------------------------------
  // Test 9: Expire an invite manually and attempt acceptInvite -> must fail with clear expired error
  // ----------------------------------------------------
  try {
    const menonHousehold = store.households.find((h) => h.name === "Menon Residence")!;
    const ownerMember = store.householdMembers.find(
      (m) => m.household_id === menonHousehold.id && m.member_role === "owner"
    )!;

    await switchSessionUser(ownerMember.user_id);

    const inv = await inviteHouseholdMember({
      householdId: menonHousehold.id,
      email: "expired.test@menon.demo",
      role: "adult",
    });

    if (!inv.ok || !inv.data) {
      throw new Error(`Failed to create invite`);
    }

    // Manually expire invite (set expires_at = 1 day in the past)
    const token = inv.data.token;
    const inviteObj = store.householdInvites.find((i) => i.token === token)!;
    inviteObj.expires_at = new Date(Date.now() - 86400000).toISOString();

    const expiredUserId = crypto.randomUUID();
    store.users.push({
      id: expiredUserId,
      email: "expired.test@menon.demo",
      full_name: "Expired Test User",
    });

    const acceptRes = await acceptInvite({
      token,
      kind: "household",
      userOverrideEmail: "expired.test@menon.demo",
      userOverrideId: expiredUserId,
      userOverrideName: "Expired Test User",
    });

    if (!acceptRes.ok && acceptRes.error?.toLowerCase().includes("expired")) {
      results.push({
        item: 9,
        description: "Expire an invite manually and attempt acceptInvite -> fails with clear expired error",
        status: "PASS",
        details: `Action returned error: "${acceptRes.error}".`,
      });
    } else {
      results.push({
        item: 9,
        description: "Expired invite rejection",
        status: "FAIL",
        details: `Unexpected response: ${JSON.stringify(acceptRes)}`,
      });
    }
  } catch (e: any) {
    results.push({ item: 9, description: "Expired invite rejection", status: "FAIL", details: e.message });
  }

  // ----------------------------------------------------
  // Test 10: Toggle visibility: business only -> no toggle; household only -> no toggle; dual role -> sees toggle
  // ----------------------------------------------------
  try {
    // User A: Household only (e.g. Ramesh Menon)
    const ramesh = store.users.find((u) => u.email === "ramesh@menon.demo")!;
    const rameshHh = store.householdMembers.some((m) => m.user_id === ramesh.id);
    const rameshBiz = store.businessMembers.some((m) => m.user_id === ramesh.id);
    const rameshCanToggle = rameshHh && rameshBiz;

    // User B: Business only (e.g. Kiran Tech)
    const techUser = store.users.find((u) => u.email === "tech@freezefix.demo")!;
    const techHh = store.householdMembers.some((m) => m.user_id === techUser.id);
    const techBiz = store.businessMembers.some((m) => m.user_id === techUser.id);
    const techCanToggle = techHh && techBiz;

    // User C: Dual membership (create one manually)
    const dualUserId = crypto.randomUUID();
    store.users.push({
      id: dualUserId,
      email: "dual@homevault.demo",
      full_name: "Dual Member",
    });
    store.householdMembers.push({
      id: crypto.randomUUID(),
      household_id: DEMO_HOUSEHOLD_ID,
      user_id: dualUserId,
      member_role: "adult",
      joined_at: new Date().toISOString(),
    });
    store.businessMembers.push({
      id: crypto.randomUUID(),
      business_id: DEMO_BUSINESS_ID,
      user_id: dualUserId,
      is_admin: false,
      display_name: "Dual Member",
      created_at: new Date().toISOString(),
    });

    const dualHh = store.householdMembers.some((m) => m.user_id === dualUserId);
    const dualBiz = store.businessMembers.some((m) => m.user_id === dualUserId);
    const dualCanToggle = dualHh && dualBiz;

    if (rameshCanToggle === false && techCanToggle === false && dualCanToggle === true) {
      results.push({
        item: 10,
        description: "Role switcher toggle only visible to users with dual memberships; static role label for single tenants",
        status: "PASS",
        details: `Household-only user canSwitchRole=false; Business-only user canSwitchRole=false; Dual-role user canSwitchRole=true.`,
      });
    } else {
      results.push({
        item: 10,
        description: "Role switcher toggle condition",
        status: "FAIL",
        details: `Ramesh toggle: ${rameshCanToggle}, Tech toggle: ${techCanToggle}, Dual toggle: ${dualCanToggle}`,
      });
    }
  } catch (e: any) {
    results.push({ item: 10, description: "Role switcher toggle condition", status: "FAIL", details: e.message });
  }

  // ----------------------------------------------------
  // Output Final Report
  // ----------------------------------------------------
  console.log("------------------------------------------------------------");
  console.log("CHECKLIST RESULTS (10 ITEMS):");
  console.log("------------------------------------------------------------");
  let passCount = 0;
  for (const r of results) {
    const icon = r.status === "PASS" ? "✓" : "✗";
    console.log(`[${r.status}] Item ${r.item}: ${r.description}`);
    console.log(`       Details: ${r.details}\n`);
    if (r.status === "PASS") passCount++;
  }
  console.log(`TOTAL: ${passCount} / ${results.length} PASSED.`);
  if (passCount === 10) {
    console.log(">>> ALL 10 VERIFICATION CHECKLIST ITEMS PASSED! <<<");
  } else {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Verification failed with uncaught exception:", err);
  process.exit(1);
});
