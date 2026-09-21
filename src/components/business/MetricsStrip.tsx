"use client";

import { formatINR } from "@/lib/currency";
import { AlertCircle, Clock, CheckCircle2, IndianRupee } from "lucide-react";

export interface MetricsStripProps {
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  totalRevenue: number;
}

export function MetricsStrip({
  openTickets,
  inProgressTickets,
  resolvedTickets,
  totalRevenue,
}: MetricsStripProps) {
  const metrics = [
    {
      label: "Pending / New",
      value: openTickets,
      icon: AlertCircle,
    },
    {
      label: "In Progress",
      value: inProgressTickets,
      icon: Clock,
    },
    {
      label: "Resolved Tickets",
      value: resolvedTickets,
      icon: CheckCircle2,
    },
    {
      label: "Service Revenue Logged",
      value: formatINR(totalRevenue),
      icon: IndianRupee,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between gap-3"
          >
            <div>
              <p className="text-xs font-medium text-slate-500">
                {m.label}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {m.value}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
