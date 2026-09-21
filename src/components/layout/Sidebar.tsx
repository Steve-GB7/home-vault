"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  AlertCircle,
  Kanban,
  Users,
  Building2,
} from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { cn } from "@/lib/cn";

export function Sidebar() {
  const pathname = usePathname();
  const { role, user } = useRole();

  const householdNav = [
    { label: "Appliances & Vault", href: "/dashboard", icon: Home },
    { label: "My Complaints", href: "/complaints", icon: AlertCircle },
    ...(user?.isHouseholdOwner
      ? [{ label: "Members & Invites", href: "/settings/members", icon: Users }]
      : []),
  ];

  const businessNav = [
    { label: "Service Desk Kanban", href: "/service-desk", icon: Kanban },
    { label: "Assigned Customers", href: "/customers", icon: Users },
    ...(user?.isBusinessAdmin
      ? [
          { label: "Team Management", href: "/settings/team", icon: Users },
          { label: "Company Profile", href: "/settings/profile", icon: Building2 },
        ]
      : []),
  ];

  const navItems = role === "household" ? householdNav : businessNav;

  return (
    <aside className="w-60 border-r border-slate-200 bg-white p-4 hidden md:flex flex-col justify-between shrink-0 min-h-[calc(100vh-3.5rem)]">
      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3">
          {role === "household" ? "Household Portal" : "Service Center"}
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-slate-100 text-slate-900 font-semibold border-l-2 border-[#0369a1] pl-2.5"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
