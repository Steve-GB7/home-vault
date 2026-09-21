"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, relativeTime } from "@/lib/dates";
import { COMPLAINT_STATUS_LABELS, COMPLAINT_PRIORITY_LABELS } from "@/lib/constants";
import { Eye, Clock } from "lucide-react";
import type { ComplaintWithAsset } from "@/types/domain";

export interface ServiceDeskTableProps {
  tickets: ComplaintWithAsset[];
  onSelectTicket: (ticket: ComplaintWithAsset) => void;
}

export function ServiceDeskTable({ tickets, onSelectTicket }: ServiceDeskTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Ticket & Issue</th>
              <th className="px-5 py-3.5">Appliance</th>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Priority</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Created</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-bold text-slate-900">{ticket.title}</div>
                  <div className="text-xs text-slate-400 truncate max-w-xs">
                    {ticket.description}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-semibold text-slate-800">
                    {ticket.assets?.brand} {ticket.assets?.model}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {ticket.assets?.serial_number || "—"}
                  </div>
                </td>
                <td className="px-5 py-4 font-medium text-slate-700">
                  {ticket.households?.name || "Nair Residence"}
                </td>
                <td className="px-5 py-4">
                  <Badge variant="outline" size="sm">
                    {COMPLAINT_PRIORITY_LABELS[ticket.priority] || ticket.priority}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {COMPLAINT_STATUS_LABELS[ticket.status] || ticket.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-slate-500">
                  {relativeTime(ticket.created_at)}
                </td>
                <td className="px-5 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectTicket(ticket)}
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Context</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
