"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStore } from "@/lib/mockData";
import type {
  Household,
  HouseholdMember,
  Business,
  BusinessMember,
  HouseholdInvite,
  BusinessInvite,
} from "@/types/domain";

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(
    url &&
    key &&
    !url.includes("your-project") &&
    !key.includes("your-anon-key")
  );
};

// ==========================================
// ZOD SCHEMAS
// ==========================================

const SignUpHouseholdSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  householdName: z.string().min(2, "Household name is required"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().min(3, "Pincode is required"),
});

const SignUpBusinessSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  businessName: z.string().min(2, "Business name is required"),
  btype: z.enum(["brand", "service_center", "amc_provider", "retailer"]),
  serviceCategories: z.array(z.string()).min(1, "Select at least one service category"),
  city: z.string().min(2, "City is required"),
  contactPhone: z.string().min(6, "Valid contact phone is required"),
});

const InviteHouseholdMemberSchema = z.object({
  householdId: z.string().uuid("Invalid household ID"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["adult", "viewer"]),
});

const InviteBusinessMemberSchema = z.object({
  businessId: z.string().uuid("Invalid business ID"),
  email: z.string().email("Invalid email address"),
  isAdmin: z.boolean().default(false),
});

const AcceptInviteSchema = z.object({
  token: z.string().min(10, "Invalid invite token"),
  kind: z.enum(["household", "business"]),
});

const RevokeInviteSchema = z.object({
  inviteId: z.string().uuid("Invalid invite ID"),
  kind: z.enum(["household", "business"]),
});

// ==========================================
// SESSION HELPERS
// ==========================================

export async function getCurrentUserSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("homevault_session")?.value;
  if (sessionCookie) {
    try {
      return JSON.parse(sessionCookie);
    } catch {
      // ignore
    }
  }

  // Check individual cookies
  const userId = cookieStore.get("homevault_user_id")?.value;
  const email = cookieStore.get("homevault_email")?.value;
  const role = cookieStore.get("homevault_role")?.value;
  const householdId = cookieStore.get("homevault_household_id")?.value;
  const businessId = cookieStore.get("homevault_business_id")?.value;

  if (userId) {
    const store = getStore();
    const user = store.users.find((u) => u.id === userId);
    const hm = store.householdMembers.find((m) => m.user_id === userId);
    const bm = store.businessMembers.find((m) => m.user_id === userId);

    return {
      userId,
      email: user?.email || email || "user@homevault.demo",
      fullName: user?.full_name || "HomeVault User",
      role: (role as "household" | "business") || (bm ? "business" : "household"),
      householdId: hm?.household_id || householdId || null,
      businessId: bm?.business_id || businessId || null,
      isHouseholdOwner: hm?.member_role === "owner",
      isBusinessAdmin: bm?.is_admin === true,
      hasHouseholdMembership: !!hm,
      hasBusinessMembership: !!bm,
    };
  }

  // Check Supabase Auth if connected
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: hm } = await supabase
          .from("household_members")
          .select("household_id, member_role")
          .eq("user_id", user.id)
          .maybeSingle();

        const { data: bm } = await supabase
          .from("business_members")
          .select("business_id, is_admin")
          .eq("user_id", user.id)
          .maybeSingle();

        return {
          userId: user.id,
          email: user.email!,
          fullName: (user.user_metadata?.full_name as string) || "HomeVault User",
          role: (bm && !hm ? "business" : "household") as "household" | "business",
          householdId: hm?.household_id || null,
          businessId: bm?.business_id || null,
          isHouseholdOwner: hm?.member_role === "owner",
          isBusinessAdmin: bm?.is_admin === true,
          hasHouseholdMembership: !!hm,
          hasBusinessMembership: !!bm,
        };
      }
    } catch {
      // ignore
    }
  }

  // Fallback to active demo user from store
  const store = getStore();
  const defaultUserId = store.activeUserId || "11111111-1111-1111-1111-111111111111";
  const user = store.users.find((u) => u.id === defaultUserId) || store.users[0];
  const hm = store.householdMembers.find((m) => m.user_id === user.id);
  const bm = store.businessMembers.find((m) => m.user_id === user.id);

  return {
    userId: user.id,
    email: user.email,
    fullName: user.full_name,
    role: (bm && !hm ? "business" : "household") as "household" | "business",
    householdId: hm?.household_id || null,
    businessId: bm?.business_id || null,
    isHouseholdOwner: hm?.member_role === "owner",
    isBusinessAdmin: bm?.is_admin === true,
    hasHouseholdMembership: !!hm,
    hasBusinessMembership: !!bm,
  };
}

async function setSessionCookies(session: {
  userId: string;
  email: string;
  fullName: string;
  role: "household" | "business";
  householdId: string | null;
  businessId: string | null;
  isHouseholdOwner: boolean;
  isBusinessAdmin: boolean;
  hasHouseholdMembership: boolean;
  hasBusinessMembership: boolean;
}) {
  const cookieStore = await cookies();
  const cookieOptions = {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };

  cookieStore.set("homevault_session", JSON.stringify(session), cookieOptions);
  cookieStore.set("homevault_user_id", session.userId, cookieOptions);
  cookieStore.set("homevault_email", session.email, cookieOptions);
  cookieStore.set("homevault_role", session.role, cookieOptions);
  cookieStore.set("homevault_active_role", session.role, cookieOptions);
  if (session.householdId) {
    cookieStore.set("homevault_household_id", session.householdId, cookieOptions);
  } else {
    cookieStore.delete("homevault_household_id");
  }
  if (session.businessId) {
    cookieStore.set("homevault_business_id", session.businessId, cookieOptions);
  } else {
    cookieStore.delete("homevault_business_id");
  }
}

function generateInviteToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ==========================================
// 1. SIGN UP HOUSEHOLD
// ==========================================

export async function signUpHousehold(formData: {
  fullName: string;
  email: string;
  password: string;
  householdName: string;
  city: string;
  pincode: string;
}) {
  const validated = SignUpHouseholdSchema.safeParse(formData);
  if (!validated.success) {
    return { ok: false, error: (validated.error as any).issues?.[0]?.message || (validated.error as any).errors?.[0]?.message || "Validation failed" };
  }

  const { fullName, email, password, householdName, city, pincode } = validated.data;

  // Supabase Auth flow if connected
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (authError || !authData.user) {
        return { ok: false, error: authError?.message || "Failed to create user account" };
      }

      const userId = authData.user.id;

      // Insert household row
      const { data: hhData, error: hhError } = await supabase
        .from("households")
        .insert({
          name: householdName,
          owner_id: userId,
          city,
          pincode,
        })
        .select()
        .single();

      if (hhError || !hhData) {
        return { ok: false, error: hhError?.message || "Failed to create household" };
      }

      // Insert household_members row with member_role = 'owner'
      const { error: hmError } = await supabase.from("household_members").insert({
        household_id: hhData.id,
        user_id: userId,
        member_role: "owner",
      });

      if (hmError) {
        return { ok: false, error: hmError.message };
      }

      await setSessionCookies({
        userId,
        email,
        fullName,
        role: "household",
        householdId: hhData.id,
        businessId: null,
        isHouseholdOwner: true,
        isBusinessAdmin: false,
        hasHouseholdMembership: true,
        hasBusinessMembership: false,
      });

      return { ok: true, redirect: "/dashboard" };
    } catch (err: any) {
      console.error("Supabase signUpHousehold error:", err);
    }
  }

  // In-memory / local fallback store flow
  const store = getStore();
  const userId = crypto.randomUUID();
  const householdId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Check if email already registered in store
  const existingUser = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return { ok: false, error: "An account with this email already exists" };
  }

  // Register user
  store.users.push({
    id: userId,
    email,
    full_name: fullName,
    password,
  });

  // Create household
  const newHousehold: Household = {
    id: householdId,
    name: householdName,
    owner_id: userId,
    address_line: null,
    city,
    state: "Kerala",
    pincode,
    created_at: now,
    updated_at: now,
  };
  store.households.push(newHousehold);

  // Create owner membership
  const newMember: HouseholdMember = {
    id: crypto.randomUUID(),
    household_id: householdId,
    user_id: userId,
    member_role: "owner",
    joined_at: now,
  };
  store.householdMembers.push(newMember);
  store.activeUserId = userId;

  await setSessionCookies({
    userId,
    email,
    fullName,
    role: "household",
    householdId,
    businessId: null,
    isHouseholdOwner: true,
    isBusinessAdmin: false,
    hasHouseholdMembership: true,
    hasBusinessMembership: false,
  });

  return { ok: true, redirect: "/dashboard" };
}

// ==========================================
// 2. SIGN UP BUSINESS
// ==========================================

export async function signUpBusiness(formData: {
  fullName: string;
  email: string;
  password: string;
  businessName: string;
  btype: "brand" | "service_center" | "amc_provider" | "retailer";
  serviceCategories: string[];
  city: string;
  contactPhone: string;
}) {
  const validated = SignUpBusinessSchema.safeParse(formData);
  if (!validated.success) {
    return { ok: false, error: (validated.error as any).issues?.[0]?.message || (validated.error as any).errors?.[0]?.message || "Validation failed" };
  }

  const {
    fullName,
    email,
    password,
    businessName,
    btype,
    serviceCategories,
    city,
    contactPhone,
  } = validated.data;

  // Supabase Auth flow if connected
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (authError || !authData.user) {
        return { ok: false, error: authError?.message || "Failed to create user account" };
      }

      const userId = authData.user.id;

      // Insert businesses row
      const { data: bizData, error: bizError } = await supabase
        .from("businesses")
        .insert({
          name: businessName,
          btype,
          contact_email: email,
          contact_phone: contactPhone,
          city,
          service_categories: serviceCategories,
          is_approved: true,
        })
        .select()
        .single();

      if (bizError || !bizData) {
        return { ok: false, error: bizError?.message || "Failed to create business" };
      }

      // Insert business_members row with is_admin = true
      const { error: bmError } = await supabase.from("business_members").insert({
        business_id: bizData.id,
        user_id: userId,
        is_admin: true,
        display_name: fullName,
      });

      if (bmError) {
        return { ok: false, error: bmError.message };
      }

      await setSessionCookies({
        userId,
        email,
        fullName,
        role: "business",
        householdId: null,
        businessId: bizData.id,
        isHouseholdOwner: false,
        isBusinessAdmin: true,
        hasHouseholdMembership: false,
        hasBusinessMembership: true,
      });

      return { ok: true, redirect: "/service-desk" };
    } catch (err: any) {
      console.error("Supabase signUpBusiness error:", err);
    }
  }

  // Local store fallback flow
  const store = getStore();
  const userId = crypto.randomUUID();
  const businessId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Check if email already registered in store
  const existingUser = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return { ok: false, error: "An account with this email already exists" };
  }

  // Register user
  store.users.push({
    id: userId,
    email,
    full_name: fullName,
    password,
  });

  // Create business
  const newBiz: Business = {
    id: businessId,
    name: businessName,
    btype,
    contact_email: email,
    contact_phone: contactPhone,
    city,
    service_categories: serviceCategories,
    tier: "pro",
    is_approved: true,
    created_at: now,
    updated_at: now,
  };
  store.businesses.push(newBiz);

  // Create admin member
  const newMember: BusinessMember = {
    id: crypto.randomUUID(),
    business_id: businessId,
    user_id: userId,
    is_admin: true,
    display_name: fullName,
    created_at: now,
  };
  store.businessMembers.push(newMember);
  store.activeUserId = userId;

  await setSessionCookies({
    userId,
    email,
    fullName,
    role: "business",
    householdId: null,
    businessId,
    isHouseholdOwner: false,
    isBusinessAdmin: true,
    hasHouseholdMembership: false,
    hasBusinessMembership: true,
  });

  return { ok: true, redirect: "/service-desk" };
}

// ==========================================
// 3. INVITE HOUSEHOLD MEMBER
// ==========================================

export async function inviteHouseholdMember(formData: {
  householdId: string;
  email: string;
  role: "adult" | "viewer";
}) {
  const validated = InviteHouseholdMemberSchema.safeParse(formData);
  if (!validated.success) {
    return { ok: false, error: (validated.error as any).issues?.[0]?.message || (validated.error as any).errors?.[0]?.message || "Validation failed" };
  }

  const { householdId, email, role } = validated.data;
  const session = await getCurrentUserSession();

  if (!session || !session.userId) {
    return { ok: false, error: "Authentication required" };
  }

  // Supabase flow if connected
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();

      // Server-side check: Is user an owner of this household?
      const { data: ownerCheck, error: ownerError } = await supabase
        .from("household_members")
        .select("member_role")
        .eq("household_id", householdId)
        .eq("user_id", session.userId)
        .eq("member_role", "owner")
        .maybeSingle();

      if (ownerError || !ownerCheck) {
        return {
          ok: false,
          error: "Permission denied: Only household owners can invite members",
        };
      }

      const token = generateInviteToken();
      const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

      const { data: invite, error: inviteError } = await supabase
        .from("household_invites")
        .insert({
          household_id: householdId,
          email: email.toLowerCase(),
          invited_role: role,
          token,
          status: "pending",
          invited_by: session.userId,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (inviteError || !invite) {
        return { ok: false, error: inviteError?.message || "Failed to create invite" };
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const inviteUrl = `${appUrl}/join/${token}`;

      return {
        ok: true,
        data: {
          inviteId: invite.id,
          token,
          inviteUrl,
          email: invite.email,
          role: invite.invited_role,
        },
      };
    } catch (err: any) {
      console.error("Supabase inviteHouseholdMember error:", err);
    }
  }

  // Local store fallback
  const store = getStore();

  // Server-side check: owner-only
  const isOwner = store.householdMembers.some(
    (m) =>
      m.household_id === householdId &&
      m.user_id === session.userId &&
      m.member_role === "owner"
  );

  if (!isOwner) {
    return {
      ok: false,
      error: "Permission denied: Only household owners can invite members",
    };
  }

  // Check if member is already in household
  const existingMemberUser = store.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (
    existingMemberUser &&
    store.householdMembers.some(
      (m) =>
        m.household_id === householdId && m.user_id === existingMemberUser.id
    )
  ) {
    return { ok: false, error: "User is already a member of this household" };
  }

  const token = generateInviteToken();
  const inviteId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

  const newInvite: HouseholdInvite = {
    id: inviteId,
    household_id: householdId,
    email: email.toLowerCase(),
    invited_role: role,
    token,
    status: "pending",
    invited_by: session.userId,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  };

  store.householdInvites.push(newInvite);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${appUrl}/join/${token}`;

  return {
    ok: true,
    data: {
      inviteId,
      token,
      inviteUrl,
      email: email.toLowerCase(),
      role,
    },
  };
}

// ==========================================
// 4. INVITE BUSINESS MEMBER
// ==========================================

export async function inviteBusinessMember(formData: {
  businessId: string;
  email: string;
  isAdmin: boolean;
}) {
  const validated = InviteBusinessMemberSchema.safeParse(formData);
  if (!validated.success) {
    return { ok: false, error: (validated.error as any).issues?.[0]?.message || (validated.error as any).errors?.[0]?.message || "Validation failed" };
  }

  const { businessId, email, isAdmin } = validated.data;
  const session = await getCurrentUserSession();

  if (!session || !session.userId) {
    return { ok: false, error: "Authentication required" };
  }

  // Supabase flow if connected
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();

      // Server-side check: Is user an admin of this business?
      const { data: adminCheck, error: adminError } = await supabase
        .from("business_members")
        .select("is_admin")
        .eq("business_id", businessId)
        .eq("user_id", session.userId)
        .eq("is_admin", true)
        .maybeSingle();

      if (adminError || !adminCheck) {
        return {
          ok: false,
          error: "Permission denied: Only business admins can invite team members",
        };
      }

      const token = generateInviteToken();
      const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

      const { data: invite, error: inviteError } = await supabase
        .from("business_invites")
        .insert({
          business_id: businessId,
          email: email.toLowerCase(),
          is_admin: isAdmin,
          token,
          status: "pending",
          invited_by: session.userId,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (inviteError || !invite) {
        return { ok: false, error: inviteError?.message || "Failed to create invite" };
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const inviteUrl = `${appUrl}/join/${token}`;

      return {
        ok: true,
        data: {
          inviteId: invite.id,
          token,
          inviteUrl,
          email: invite.email,
          isAdmin: invite.is_admin,
        },
      };
    } catch (err: any) {
      console.error("Supabase inviteBusinessMember error:", err);
    }
  }

  // Local store fallback
  const store = getStore();

  // Server-side check: admin-only
  const isAdminMember = store.businessMembers.some(
    (m) =>
      m.business_id === businessId &&
      m.user_id === session.userId &&
      m.is_admin === true
  );

  if (!isAdminMember) {
    return {
      ok: false,
      error: "Permission denied: Only business admins can invite team members",
    };
  }

  const token = generateInviteToken();
  const inviteId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

  const newInvite: BusinessInvite = {
    id: inviteId,
    business_id: businessId,
    email: email.toLowerCase(),
    is_admin: isAdmin,
    token,
    status: "pending",
    invited_by: session.userId,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  };

  store.businessInvites.push(newInvite);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${appUrl}/join/${token}`;

  return {
    ok: true,
    data: {
      inviteId,
      token,
      inviteUrl,
      email: email.toLowerCase(),
      isAdmin,
    },
  };
}

// ==========================================
// 5. ACCEPT INVITE
// ==========================================

export async function acceptInvite(params: {
  token: string;
  kind: "household" | "business";
  userOverrideEmail?: string;
  userOverrideId?: string;
  userOverrideName?: string;
}) {
  const validated = AcceptInviteSchema.safeParse(params);
  if (!validated.success) {
    return { ok: false, error: (validated.error as any).issues?.[0]?.message || (validated.error as any).errors?.[0]?.message || "Validation failed" };
  }

  const { token, kind } = validated.data;
  const session = await getCurrentUserSession();

  const activeEmail = params.userOverrideEmail || session?.email;
  const activeUserId = params.userOverrideId || session?.userId;
  const activeName = params.userOverrideName || session?.fullName || "Invited Member";

  if (!activeUserId || !activeEmail) {
    return {
      ok: false,
      error: "You must be signed in with an authenticated account to accept an invite",
    };
  }

  // Supabase flow if connected
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();

      if (kind === "household") {
        const { data: invite, error } = await supabase
          .from("household_invites")
          .select("*")
          .eq("token", token)
          .maybeSingle();

        if (error || !invite) {
          return { ok: false, error: "Invite not found or invalid token" };
        }

        if (invite.status === "accepted") {
          return { ok: false, error: "This invite has already been accepted" };
        }
        if (invite.status === "revoked") {
          return { ok: false, error: "This invite has been revoked by the household owner" };
        }
        if (new Date(invite.expires_at) < new Date()) {
          return { ok: false, error: "This invite has expired" };
        }

        // Check email match (case-insensitive)
        if (invite.email.toLowerCase() !== activeEmail.toLowerCase()) {
          return {
            ok: false,
            error: `Email mismatch: This invite was sent to ${invite.email}, but you are logged in as ${activeEmail}`,
          };
        }

        // Insert household membership
        const { error: memberError } = await supabase
          .from("household_members")
          .insert({
            household_id: invite.household_id,
            user_id: activeUserId,
            member_role: invite.invited_role,
          });

        if (memberError && !memberError.message.includes("unique")) {
          return { ok: false, error: memberError.message };
        }

        // Flip invite status to accepted
        await supabase
          .from("household_invites")
          .update({ status: "accepted" })
          .eq("id", invite.id);

        return {
          ok: true,
          redirect: "/dashboard",
          message: "Welcome! You joined the household.",
        };
      } else {
        const { data: invite, error } = await supabase
          .from("business_invites")
          .select("*")
          .eq("token", token)
          .maybeSingle();

        if (error || !invite) {
          return { ok: false, error: "Invite not found or invalid token" };
        }

        if (invite.status === "accepted") {
          return { ok: false, error: "This invite has already been accepted" };
        }
        if (invite.status === "revoked") {
          return { ok: false, error: "This invite has been revoked by the business admin" };
        }
        if (new Date(invite.expires_at) < new Date()) {
          return { ok: false, error: "This invite has expired" };
        }

        // Check email match (case-insensitive)
        if (invite.email.toLowerCase() !== activeEmail.toLowerCase()) {
          return {
            ok: false,
            error: `Email mismatch: This invite was sent to ${invite.email}, but you are logged in as ${activeEmail}`,
          };
        }

        // Insert business membership
        const { error: memberError } = await supabase
          .from("business_members")
          .insert({
            business_id: invite.business_id,
            user_id: activeUserId,
            is_admin: invite.is_admin,
            display_name: activeName,
          });

        if (memberError && !memberError.message.includes("unique")) {
          return { ok: false, error: memberError.message };
        }

        // Flip invite status to accepted
        await supabase
          .from("business_invites")
          .update({ status: "accepted" })
          .eq("id", invite.id);

        return {
          ok: true,
          redirect: "/service-desk",
          message: "Welcome! You joined the service team.",
        };
      }
    } catch (err: any) {
      console.error("Supabase acceptInvite error:", err);
    }
  }

  // Local store fallback
  const store = getStore();

  if (kind === "household") {
    const invite = store.householdInvites.find((i) => i.token === token);
    if (!invite) {
      return { ok: false, error: "Invite not found or invalid token" };
    }

    if (invite.status === "accepted") {
      return { ok: false, error: "This invite has already been accepted" };
    }
    if (invite.status === "revoked") {
      return { ok: false, error: "This invite has been revoked by the household owner" };
    }
    if (new Date(invite.expires_at) < new Date()) {
      return { ok: false, error: "This invite has expired" };
    }

    // Email match check
    if (invite.email.toLowerCase() !== activeEmail.toLowerCase()) {
      return {
        ok: false,
        error: `Email mismatch: This invite was sent to ${invite.email}, but you are logged in as ${activeEmail}`,
      };
    }

    // Add membership
    const existingMembership = store.householdMembers.find(
      (m) => m.household_id === invite.household_id && m.user_id === activeUserId
    );

    if (!existingMembership) {
      store.householdMembers.push({
        id: crypto.randomUUID(),
        household_id: invite.household_id,
        user_id: activeUserId,
        member_role: invite.invited_role,
        joined_at: new Date().toISOString(),
      });
    }

    invite.status = "accepted";

    await setSessionCookies({
      userId: activeUserId,
      email: activeEmail,
      fullName: activeName,
      role: "household",
      householdId: invite.household_id,
      businessId: session?.businessId || null,
      isHouseholdOwner: invite.invited_role === "owner",
      isBusinessAdmin: session?.isBusinessAdmin || false,
      hasHouseholdMembership: true,
      hasBusinessMembership: session?.hasBusinessMembership || false,
    });

    return {
      ok: true,
      redirect: "/dashboard",
      message: "Welcome! You joined the household.",
    };
  } else {
    const invite = store.businessInvites.find((i) => i.token === token);
    if (!invite) {
      return { ok: false, error: "Invite not found or invalid token" };
    }

    if (invite.status === "accepted") {
      return { ok: false, error: "This invite has already been accepted" };
    }
    if (invite.status === "revoked") {
      return { ok: false, error: "This invite has been revoked by the business admin" };
    }
    if (new Date(invite.expires_at) < new Date()) {
      return { ok: false, error: "This invite has expired" };
    }

    // Email match check
    if (invite.email.toLowerCase() !== activeEmail.toLowerCase()) {
      return {
        ok: false,
        error: `Email mismatch: This invite was sent to ${invite.email}, but you are logged in as ${activeEmail}`,
      };
    }

    // Add membership
    const existingMembership = store.businessMembers.find(
      (m) => m.business_id === invite.business_id && m.user_id === activeUserId
    );

    if (!existingMembership) {
      store.businessMembers.push({
        id: crypto.randomUUID(),
        business_id: invite.business_id,
        user_id: activeUserId,
        is_admin: invite.is_admin,
        display_name: activeName,
        created_at: new Date().toISOString(),
      });
    }

    invite.status = "accepted";

    await setSessionCookies({
      userId: activeUserId,
      email: activeEmail,
      fullName: activeName,
      role: "business",
      householdId: session?.householdId || null,
      businessId: invite.business_id,
      isHouseholdOwner: session?.isHouseholdOwner || false,
      isBusinessAdmin: invite.is_admin,
      hasHouseholdMembership: session?.hasHouseholdMembership || false,
      hasBusinessMembership: true,
    });

    return {
      ok: true,
      redirect: "/service-desk",
      message: "Welcome! You joined the service team.",
    };
  }
}

// ==========================================
// 6. REVOKE INVITE
// ==========================================

export async function revokeInvite(params: {
  inviteId: string;
  kind: "household" | "business";
}) {
  const validated = RevokeInviteSchema.safeParse(params);
  if (!validated.success) {
    return { ok: false, error: (validated.error as any).issues?.[0]?.message || (validated.error as any).errors?.[0]?.message || "Validation failed" };
  }

  const { inviteId, kind } = validated.data;
  const session = await getCurrentUserSession();

  if (!session || !session.userId) {
    return { ok: false, error: "Authentication required" };
  }

  // Supabase flow if connected
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (kind === "household") {
        const { error } = await supabase
          .from("household_invites")
          .update({ status: "revoked" })
          .eq("id", inviteId);

        if (error) return { ok: false, error: error.message };
      } else {
        const { error } = await supabase
          .from("business_invites")
          .update({ status: "revoked" })
          .eq("id", inviteId);

        if (error) return { ok: false, error: error.message };
      }
      return { ok: true };
    } catch (err: any) {
      console.error("Supabase revokeInvite error:", err);
    }
  }

  // Local store fallback
  const store = getStore();

  if (kind === "household") {
    const invite = store.householdInvites.find((i) => i.id === inviteId);
    if (!invite) return { ok: false, error: "Invite not found" };

    // Owner only check
    const isOwner = store.householdMembers.some(
      (m) =>
        m.household_id === invite.household_id &&
        m.user_id === session.userId &&
        m.member_role === "owner"
    );

    if (!isOwner) {
      return { ok: false, error: "Permission denied: Only owners can revoke invites" };
    }

    invite.status = "revoked";
    return { ok: true };
  } else {
    const invite = store.businessInvites.find((i) => i.id === inviteId);
    if (!invite) return { ok: false, error: "Invite not found" };

    // Admin only check
    const isAdmin = store.businessMembers.some(
      (m) =>
        m.business_id === invite.business_id &&
        m.user_id === session.userId &&
        m.is_admin === true
    );

    if (!isAdmin) {
      return { ok: false, error: "Permission denied: Only business admins can revoke invites" };
    }

    invite.status = "revoked";
    return { ok: true };
  }
}

// ==========================================
// 7. GET INVITE DETAILS (PUBLIC)
// ==========================================

export async function getInviteDetails(token: string) {
  if (!token) return { ok: false, error: "Token is required" };

  const store = getStore();

  // Check household invites
  const hhInvite = store.householdInvites.find((i) => i.token === token);
  if (hhInvite) {
    const household = store.households.find((h) => h.id === hhInvite.household_id);
    const inviter = store.users.find((u) => u.id === hhInvite.invited_by);
    return {
      ok: true,
      data: {
        kind: "household" as const,
        invite: hhInvite,
        orgName: household?.name || "Household",
        inviterName: inviter?.full_name || "Household Owner",
        email: hhInvite.email,
        status: hhInvite.status,
        isExpired: new Date(hhInvite.expires_at) < new Date(),
      },
    };
  }

  // Check business invites
  const bizInvite = store.businessInvites.find((i) => i.token === token);
  if (bizInvite) {
    const business = store.businesses.find((b) => b.id === bizInvite.business_id);
    const inviter = store.users.find((u) => u.id === bizInvite.invited_by);
    return {
      ok: true,
      data: {
        kind: "business" as const,
        invite: bizInvite,
        orgName: business?.name || "Service Company",
        btype: business?.btype || "service_center",
        inviterName: inviter?.full_name || "Company Admin",
        email: bizInvite.email,
        isAdmin: bizInvite.is_admin,
        status: bizInvite.status,
        isExpired: new Date(bizInvite.expires_at) < new Date(),
      },
    };
  }

  // Check Supabase if connected
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: hh } = await supabase
        .from("household_invites")
        .select("*, households(name), profiles!household_invites_invited_by_fkey(full_name)")
        .eq("token", token)
        .maybeSingle();

      if (hh) {
        return {
          ok: true,
          data: {
            kind: "household" as const,
            invite: hh,
            orgName: (hh as any).households?.name || "Household",
            inviterName: (hh as any).profiles?.full_name || "Household Owner",
            email: hh.email,
            status: hh.status,
            isExpired: new Date(hh.expires_at) < new Date(),
          },
        };
      }

      const { data: biz } = await supabase
        .from("business_invites")
        .select("*, businesses(name, btype), profiles!business_invites_invited_by_fkey(full_name)")
        .eq("token", token)
        .maybeSingle();

      if (biz) {
        return {
          ok: true,
          data: {
            kind: "business" as const,
            invite: biz,
            orgName: (biz as any).businesses?.name || "Service Company",
            btype: (biz as any).businesses?.btype || "service_center",
            inviterName: (biz as any).profiles?.full_name || "Company Admin",
            email: biz.email,
            isAdmin: biz.is_admin,
            status: biz.status,
            isExpired: new Date(biz.expires_at) < new Date(),
          },
        };
      }
    } catch {
      // ignore
    }
  }

  return { ok: false, error: "Invite link not found or invalid" };
}

// ==========================================
// 8. QUERY MEMBERS & INVITES FOR SETTINGS
// ==========================================

export async function getHouseholdSettingsData(householdId: string) {
  const session = await getCurrentUserSession();
  const store = getStore();

  const household = store.households.find((h) => h.id === householdId) || store.households[0];
  const targetHhId = household?.id || householdId;

  const members = store.householdMembers
    .filter((m) => m.household_id === targetHhId)
    .map((m) => {
      const user = store.users.find((u) => u.id === m.user_id);
      return {
        ...m,
        fullName: user?.full_name || "Member",
        email: user?.email || "member@homevault.demo",
      };
    });

  const invites = store.householdInvites.filter(
    (i) => i.household_id === targetHhId
  );

  const isOwner =
    session.isHouseholdOwner ||
    store.householdMembers.some(
      (m) =>
        m.household_id === targetHhId &&
        m.user_id === session.userId &&
        m.member_role === "owner"
    );

  return {
    household,
    members,
    invites,
    isOwner,
  };
}

export async function getBusinessSettingsData(businessId: string) {
  const session = await getCurrentUserSession();
  const store = getStore();

  const business = store.businesses.find((b) => b.id === businessId) || store.businesses[0];
  const targetBizId = business?.id || businessId;

  const members = store.businessMembers
    .filter((m) => m.business_id === targetBizId)
    .map((m) => {
      const user = store.users.find((u) => u.id === m.user_id);
      return {
        ...m,
        fullName: m.display_name || user?.full_name || "Team Member",
        email: user?.email || "technician@service.demo",
      };
    });

  const invites = store.businessInvites.filter(
    (i) => i.business_id === targetBizId
  );

  const isAdmin =
    session.isBusinessAdmin ||
    store.businessMembers.some(
      (m) =>
        m.business_id === targetBizId &&
        m.user_id === session.userId &&
        m.is_admin === true
    );

  return {
    business,
    members,
    invites,
    isAdmin,
  };
}

export async function updateBusinessProfile(
  businessId: string,
  data: {
    name: string;
    contactPhone: string;
    city: string;
    serviceCategories: string[];
  }
) {
  const session = await getCurrentUserSession();
  const store = getStore();

  const isAdmin =
    session.isBusinessAdmin ||
    store.businessMembers.some(
      (m) =>
        m.business_id === businessId &&
        m.user_id === session.userId &&
        m.is_admin === true
    );

  if (!isAdmin) {
    return { ok: false, error: "Permission denied: Only business admins can update company profile" };
  }

  const biz = store.businesses.find((b) => b.id === businessId);
  if (biz) {
    biz.name = data.name;
    biz.contact_phone = data.contactPhone;
    biz.city = data.city;
    biz.service_categories = data.serviceCategories;
    biz.updated_at = new Date().toISOString();
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      await supabase
        .from("businesses")
        .update({
          name: data.name,
          contact_phone: data.contactPhone,
          city: data.city,
          service_categories: data.serviceCategories,
          updated_at: new Date().toISOString(),
        })
        .eq("id", businessId);
    } catch {
      // ignore
    }
  }

  return { ok: true, message: "Company profile updated successfully" };
}

export async function switchSessionUser(userId: string) {
  const store = getStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) return { ok: false, error: "User not found" };

  const hm = store.householdMembers.find((m) => m.user_id === userId);
  const bm = store.businessMembers.find((m) => m.user_id === userId);

  store.activeUserId = userId;

  const role = bm && !hm ? "business" : "household";

  await setSessionCookies({
    userId,
    email: user.email,
    fullName: user.full_name,
    role,
    householdId: hm?.household_id || null,
    businessId: bm?.business_id || null,
    isHouseholdOwner: hm?.member_role === "owner",
    isBusinessAdmin: bm?.is_admin === true,
    hasHouseholdMembership: !!hm,
    hasBusinessMembership: !!bm,
  });

  return { ok: true, role };
}

export async function signInUser(formData: { email: string; password?: string }) {
  const email = formData.email.trim().toLowerCase();

  // Supabase Auth flow if connected
  if (isSupabaseConfigured() && formData.password) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });
      if (!error && data.user) {
        const { data: hm } = await supabase
          .from("household_members")
          .select("household_id, member_role")
          .eq("user_id", data.user.id)
          .maybeSingle();

        const { data: bm } = await supabase
          .from("business_members")
          .select("business_id, is_admin")
          .eq("user_id", data.user.id)
          .maybeSingle();

        const role = bm && !hm ? "business" : "household";

        await setSessionCookies({
          userId: data.user.id,
          email: data.user.email!,
          fullName: (data.user.user_metadata?.full_name as string) || "HomeVault User",
          role,
          householdId: hm?.household_id || null,
          businessId: bm?.business_id || null,
          isHouseholdOwner: hm?.member_role === "owner",
          isBusinessAdmin: bm?.is_admin === true,
          hasHouseholdMembership: !!hm,
          hasBusinessMembership: !!bm,
        });

        return {
          ok: true,
          redirect: role === "business" ? "/service-desk" : "/dashboard",
        };
      }
    } catch {
      // fallback to store
    }
  }

  // Store fallback
  const store = getStore();
  const user = store.users.find((u) => u.email.toLowerCase() === email);

  if (!user) {
    return { ok: false, error: "No account found with this email address" };
  }

  const hm = store.householdMembers.find((m) => m.user_id === user.id);
  const bm = store.businessMembers.find((m) => m.user_id === user.id);

  store.activeUserId = user.id;
  const role = bm && !hm ? "business" : "household";

  await setSessionCookies({
    userId: user.id,
    email: user.email,
    fullName: user.full_name,
    role,
    householdId: hm?.household_id || null,
    businessId: bm?.business_id || null,
    isHouseholdOwner: hm?.member_role === "owner",
    isBusinessAdmin: bm?.is_admin === true,
    hasHouseholdMembership: !!hm,
    hasBusinessMembership: !!bm,
  });

  return {
    ok: true,
    redirect: role === "business" ? "/service-desk" : "/dashboard",
    role,
  };
}

export async function signOutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("homevault_session");
  cookieStore.delete("homevault_user_id");
  cookieStore.delete("homevault_email");
  cookieStore.delete("homevault_role");
  cookieStore.delete("homevault_active_role");
  cookieStore.delete("homevault_household_id");
  cookieStore.delete("homevault_business_id");

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }

  const store = getStore();
  store.activeUserId = "";

  return { ok: true, redirect: "/login" };
}

