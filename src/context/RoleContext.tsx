"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type ActiveRole = "household" | "business";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: ActiveRole;
  orgName: string;
  householdId?: string | null;
  businessId?: string | null;
  btype?: string | null;
  isHouseholdOwner?: boolean;
  isBusinessAdmin?: boolean;
  hasHouseholdMembership?: boolean;
  hasBusinessMembership?: boolean;
}

// Default "not logged in" state — used before session loads
const GUEST_USER: AppUser = {
  id: "",
  name: "Guest",
  email: "",
  role: "household",
  orgName: "HomeVault",
  isHouseholdOwner: false,
  isBusinessAdmin: false,
  hasHouseholdMembership: false,
  hasBusinessMembership: false,
};

interface RoleContextType {
  role: ActiveRole;
  user: AppUser;
  canSwitchRole: boolean;
  setRole: (role: ActiveRole) => void;
  toggleRole: () => void;
  setUser: (user: AppUser) => void;
  refreshSession: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<ActiveRole>("household");
  const [user, setUserState] = useState<AppUser>(GUEST_USER);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");

      // Handle 401 — user is not authenticated
      if (res.status === 401) {
        setUserState(GUEST_USER);
        // Redirect to login if not already on a public page
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/signup") &&
          !window.location.pathname.startsWith("/join")
        ) {
          window.location.href = "/login";
        }
        return;
      }

      const json = await res.json();
      if (json.ok && json.data) {
        const d = json.data;
        const mappedUser: AppUser = {
          id: d.userId,
          name: d.fullName,
          email: d.email,
          role: d.role,
          orgName: d.orgName,
          householdId: d.householdId,
          businessId: d.businessId,
          btype: d.btype,
          isHouseholdOwner: d.isHouseholdOwner,
          isBusinessAdmin: d.isBusinessAdmin,
          hasHouseholdMembership: d.hasHouseholdMembership,
          hasBusinessMembership: d.hasBusinessMembership,
        };
        setUserState(mappedUser);
        setRoleState(d.role);
      }
    } catch {
      // ignore network errors
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const setRole = (newRole: ActiveRole) => {
    setRoleState(newRole);
    setUserState((prev) => ({
      ...prev,
      role: newRole,
    }));
    // Store role preference in localStorage only — no client-side cookie writes
    localStorage.setItem("homevault_active_role", newRole);
  };

  const toggleRole = () => {
    const nextRole = role === "household" ? "business" : "household";
    setRole(nextRole);
  };

  const setUser = (newUser: AppUser) => {
    setUserState(newUser);
    setRole(newUser.role);
  };

  const canSwitchRole = Boolean(
    user.hasHouseholdMembership && user.hasBusinessMembership
  );

  return (
    <RoleContext.Provider
      value={{
        role,
        user,
        canSwitchRole,
        setRole,
        toggleRole,
        setUser,
        refreshSession,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    return {
      role: "household" as ActiveRole,
      user: GUEST_USER,
      canSwitchRole: false,
      setRole: () => {},
      toggleRole: () => {},
      setUser: () => {},
      refreshSession: async () => {},
    };
  }
  return context;
}
