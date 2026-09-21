"use client";

import { useState } from "react";
import { TicketCard } from "./TicketCard";
import { TicketDetailModal } from "./TicketDetailModal";
import { COMPLAINT_STATUS_LABELS } from "@/lib/constants";
import type { ComplaintWithAsset, ComplaintStatus } from "@/types/domain";

export interface ServiceDeskKanbanProps {
  tickets: ComplaintWithAsset[];
  onStatusChange: (ticketId: string, newStatus: ComplaintStatus) => void;
  onServiceLogged: (newLog: any) => void;
}

const COLUMNS: { id: ComplaintStatus; title: string; color: string }[] = [
  { id: "new", title: "New", color: "border-t-rose-500" },
  { id: "assigned", title: "Assigned", color: "border-t-amber-500" },
  { id: "in_progress", title: "In Progress", color: "border-t-indigo-500" },
  { id: "resolved", title: "Resolved", color: "border-t-emerald-500" },
];

export function ServiceDeskKanban({
  tickets,
  onStatusChange,
  onServiceLogged,
}: ServiceDeskKanbanProps) {
  const [selectedTicket, setSelectedTicket] = useState<ComplaintWithAsset | null>(null);
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedTicketId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, colStatus: ComplaintStatus) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData("text/plain") || draggedTicketId;
    if (ticketId) {
      onStatusChange(ticketId, colStatus);
      if (colStatus === "resolved") {
        const found = tickets.find((t) => t.id === ticketId);
        if (found) {
          setSelectedTicket(found);
        }
      }
    }
    setDraggedTicketId(null);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {COLUMNS.map((col) => {
          const colTickets = tickets.filter(
            (t) =>
              t.status === col.id ||
              (col.id === "resolved" && t.status === "closed")
          );

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`bg-slate-100/70 rounded-3xl p-4 border border-slate-200/80 border-t-4 ${col.color} min-h-[500px] flex flex-col`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-800 tracking-tight">
                    {col.title}
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                    {colTickets.length}
                  </span>
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                {colTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() => setSelectedTicket(ticket)}
                    onDragStart={handleDragStart}
                  />
                ))}

                {colTickets.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-xs text-slate-400">
                    Drop tickets here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetailModal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          ticket={selectedTicket}
          onStatusUpdated={(id, status) => {
            onStatusChange(id, status);
            setSelectedTicket((prev) => (prev ? { ...prev, status } : null));
          }}
          onServiceLogged={onServiceLogged}
        />
      )}
    </div>
  );
}
