"use client";

import { formatDate } from "@/lib/dates";
import { formatINR } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Wrench,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
  User,
} from "lucide-react";
import type { TimelineEvent } from "@/types/domain";

export interface AssetTimelineProps {
  events: TimelineEvent[];
}

export function AssetTimeline({ events }: AssetTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-slate-50/50 rounded-2xl border border-slate-200">
        <Calendar className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-medium">No timeline events recorded yet</p>
      </div>
    );
  }

  const getEventConfig = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "purchase":
        return {
          icon: ShoppingBag,
          color: "bg-emerald-50 text-emerald-600 border-emerald-200",
          badge: "Purchase",
        };
      case "service":
        return {
          icon: Wrench,
          color: "bg-indigo-50 text-indigo-600 border-indigo-200",
          badge: "Service",
        };
      case "complaint":
        return {
          icon: AlertCircle,
          color: "bg-rose-50 text-rose-600 border-rose-200",
          badge: "Complaint",
        };
      case "coverage_start":
        return {
          icon: ShieldCheck,
          color: "bg-amber-50 text-amber-600 border-amber-200",
          badge: "Coverage",
        };
      case "transfer":
        return {
          icon: CheckCircle2,
          color: "bg-purple-50 text-purple-600 border-purple-200",
          badge: "Ownership",
        };
      default:
        return {
          icon: FileText,
          color: "bg-slate-50 text-slate-600 border-slate-200",
          badge: "Event",
        };
    }
  };

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((event) => {
        const config = getEventConfig(event.type);
        const Icon = config.icon;

        return (
          <div key={event.id} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 sm:-left-8 top-1 w-6 sm:w-8 h-6 sm:h-8 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${config.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            {/* Event Content Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {config.badge}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    {event.title}
                  </h4>
                </div>
                <time className="text-xs font-medium text-slate-400">
                  {formatDate(event.date)}
                </time>
              </div>

              {event.subtitle && (
                <p className="text-xs font-medium text-indigo-600 mb-2">
                  {event.subtitle}
                </p>
              )}

              {event.description && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {event.description}
                </p>
              )}

              {/* Cost & Technician Metadata */}
              {(event.cost !== undefined || event.metadata) && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {event.metadata && (
                    <div className="flex flex-wrap items-center gap-3 text-slate-500">
                      {typeof event.metadata.technician === "string" && (
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Tech: {event.metadata.technician}</span>
                        </span>
                      )}
                      {typeof event.metadata.partsSummary === "string" && (
                        <span>Parts: {event.metadata.partsSummary}</span>
                      )}
                    </div>
                  )}

                  {event.cost !== undefined && event.cost > 0 && (
                    <div className="ml-auto font-semibold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      Total Cost: {formatINR(event.cost)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
