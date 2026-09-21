"use client";

import { Badge } from "@/components/ui/badge";
import { relativeTime } from "@/lib/dates";
import { COMPLAINT_PRIORITY_LABELS, ASSET_CATEGORY_ICONS } from "@/lib/constants";
import { AlertCircle, User, Wrench, ChevronRight, Clock } from "lucide-react";
import type { ComplaintWithAsset } from "@/types/domain";

export interface TicketCardProps {
  ticket: ComplaintWithAsset;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent, ticketId: string) => void;
}

export function TicketCard({ ticket, onClick, onDragStart }: TicketCardProps) {
  const Icon = ticket.assets?.category
    ? ASSET_CATEGORY_ICONS[ticket.assets.category] || Wrench
    : Wrench;

  const priorityColors = {
    urgent: "bg-rose-100 text-rose-800 border-rose-200",
    high: "bg-amber-100 text-amber-800 border-amber-200",
    medium: "bg-blue-100 text-blue-800 border-blue-200",
    low: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, ticket.id)}
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group space-y-3 active:scale-[0.99]"
    >
      {/* Top row: Priority & Time */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
            priorityColors[ticket.priority as keyof typeof priorityColors] ||
            priorityColors.medium
          }`}
        >
          {COMPLAINT_PRIORITY_LABELS[ticket.priority] || ticket.priority}
        </span>
        <span className="text-[11px] text-slate-400 font-medium">
          {relativeTime(ticket.created_at)}
        </span>
      </div>

      {/* Ticket Title */}
      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
        {ticket.title}
      </h4>

      {/* Appliance Context (Sanitized - No purchase price or seller) */}
      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          <Icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">
            {ticket.assets?.brand} {ticket.assets?.model}
          </span>
        </div>
        {ticket.assets?.serial_number && (
          <p className="text-[11px] text-slate-500 font-mono">
            S/N: {ticket.assets.serial_number}
          </p>
        )}
      </div>

      {/* Household / Location */}
      <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3 text-slate-400" />
          <span className="truncate max-w-[150px]">
            {ticket.households?.name || "Household"}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-indigo-600 transition-all" />
      </div>
    </div>
  );
}
