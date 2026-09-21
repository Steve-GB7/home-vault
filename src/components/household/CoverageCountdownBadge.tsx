"use client";

import { daysRemaining, coverageStatus } from "@/lib/dates";
import { ShieldCheck, ShieldAlert, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/cn";

export interface CoverageCountdownBadgeProps {
  label: string; // e.g. "Warranty" or "AMC"
  endDate?: string | Date | null;
  daysOverride?: number | null;
  className?: string;
  size?: "sm" | "md";
}

export function CoverageCountdownBadge({
  label,
  endDate,
  daysOverride,
  className,
  size = "md",
}: CoverageCountdownBadgeProps) {
  const days = daysOverride !== undefined ? daysOverride : daysRemaining(endDate);

  if (days === null) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200",
          size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs",
          className
        )}
      >
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>{label}: No data</span>
      </span>
    );
  }

  const status = coverageStatus(days);

  // Format time left human-readably
  let text = "";
  if (days < 0) {
    text = `${label}: Expired`;
  } else if (days > 365) {
    const years = (days / 365.25).toFixed(1).replace(/\.0$/, "");
    text = `${label}: ${years} yrs left`;
  } else if (days > 30) {
    const months = Math.floor(days / 30);
    text = `${label}: ${months} mo left`;
  } else {
    text = `${label}: ${days} ${days === 1 ? "day" : "days"} left`;
  }

  const styleConfig = {
    active: {
      bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dot: "bg-emerald-500",
      icon: ShieldCheck,
    },
    warning: {
      bg: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
      icon: Clock,
    },
    critical: {
      bg: "bg-rose-50 text-rose-800 border-rose-200",
      dot: "bg-rose-500 animate-pulse",
      icon: AlertTriangle,
    },
    expired: {
      bg: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
      icon: ShieldAlert,
    },
  };

  const current = styleConfig[status];
  const Icon = current.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border transition-all shadow-2xs",
        current.bg,
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs",
        className
      )}
      title={endDate ? `Expires on ${new Date(endDate).toLocaleDateString()}` : undefined}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", current.dot)} />
      <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
      <span className="font-semibold">{text}</span>
    </span>
  );
}
