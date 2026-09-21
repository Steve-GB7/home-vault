"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { DEMO_USERS, DEMO_HOUSEHOLD_ID, DEMO_BUSINESS_ID } from "@/lib/constants";

export type ActiveRole = "household" | "business";

export interface DemoUser {
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

export const DEMO_HOUSEHOLD_USER: DemoUser = {
  id: DEMO_USERS.priya,
  name: "Priya Nair",
  email: "priya@homevault.demo",
  role: "household",
  orgName: "Nair Residence",
  householdId: DEMO_HOUSEHOLD_ID,
  isHouseholdOwner: true,
  isBusinessAdmin: false,
  hasHouseholdMembership: true,
  hasBusinessMembership: false,
};

export const DEMO_BUSINESS_USER: DemoUser = {
  id: DEMO_USERS.rahul,
  name: "Rahul Menon",
  email: "desk@coolcare.demo",
  role: "business",
  orgName: "CoolCare Authorized Service",
  businessId: DEMO_BUSINESS_ID,
  btype: "service_center",
  isHouseholdOwner: false,
  isBusinessAdmin: true,
  hasHouseholdMembership: false,
  hasBusinessMembership: true,
};

interface RoleContextType {
  role: ActiveRole;
  user: DemoUser;
  canSwitchRole: boolean;
  setRole: (role: ActiveRole) => void;
  toggleRole: () => void;
  setUser: (user: DemoUser) => void;
  refreshSession: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<ActiveRole>("household");
  const [user, setUserState] = useState<DemoUser>(DEMO_HOUSEHOLD_USER);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const json = await res.json();
      if (json.ok && json.data) {
        const d = json.data;
        const mappedUser: DemoUser = {
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
      // ignore
    }
  }, []);

  useEffect(() => {
    const savedRole = localStorage.getItem("homevault_active_role") as ActiveRole | null;
    if (savedRole === "household" || savedRole === "business") {
      setRoleState(savedRole);
    }
    refreshSession();
  }, [refreshSession]);

  const setRole = (newRole: ActiveRole) => {
    setRoleState(newRole);
    setUserState((prev) => ({
      ...prev,
      role: newRole,
    }));
    localStorage.setItem("homevault_active_role", newRole);
    document.cookie = `homevault_role=${newRole}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `homevault_active_role=${newRole}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const toggleRole = () => {
    const nextRole = role === "household" ? "business" : "household";
    setRole(nextRole);
  };

  const setUser = (newUser: DemoUser) => {
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
      user: DEMO_HOUSEHOLD_USER,
      canSwitchRole: false,
      setRole: () => {},
      toggleRole: () => {},
      setUser: () => {},
      refreshSession: async () => {},
    };
  }
  return context;
}
