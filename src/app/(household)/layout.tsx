"use client";

import { useEffect } from "react";
import { useRole } from "@/hooks/useRole";

export default function HouseholdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, setRole } = useRole();

  useEffect(() => {
    if (role !== "household") {
      setRole("household");
    }
  }, [role, setRole]);

  return <div className="household-shell min-h-screen flex flex-col">{children}</div>;
}
