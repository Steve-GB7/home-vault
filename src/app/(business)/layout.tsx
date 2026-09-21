"use client";

import { useEffect } from "react";
import { useRole } from "@/hooks/useRole";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, setRole } = useRole();

  useEffect(() => {
    if (role !== "business") {
      setRole("business");
    }
  }, [role, setRole]);

  return <div className="business-shell min-h-screen flex flex-col">{children}</div>;
}
