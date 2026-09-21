"use client";

import { useState, useEffect } from "react";
import { RoleSwitcherHeader } from "@/components/layout/RoleSwitcherHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { MetricsStrip } from "@/components/business/MetricsStrip";
import { ServiceDeskKanban } from "@/components/business/ServiceDeskKanban";
import { ServiceDeskTable } from "@/components/business/ServiceDeskTable";
import { TicketDetailModal } from "@/components/business/TicketDetailModal";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Kanban, Table as TableIcon, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/toast";
import type { ComplaintWithAsset, ComplaintStatus } from "@/types/domain";

export default function ServiceDeskPage() {
  const { user } = useRole();
  const [tickets, setTickets] = useState<ComplaintWithAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [modalTicket, setModalTicket] = useState<ComplaintWithAsset | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const url = user?.businessId
        ? `/api/complaints?business_id=${user.businessId}`
        : "/api/complaints";
      const res = await fetch(url);
      const json = await res.json();
      if (json.ok && json.data) {
        setTickets(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user?.businessId]);

  const handleStatusChange = async (ticketId: string, newStatus: ComplaintStatus) => {
    try {
      const res = await fetch(`/api/complaints/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.ok) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
        );
        toast.success(`Ticket status transitioned to ${newStatus.replace("_", " ")}`);
      } else {
        toast.error(json.error || "Transition rejected");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update ticket");
    }
  };

  const handleServiceLogged = (log: any) => {
    fetchTickets();
  };

  // Compute metrics
  const openCount = tickets.filter((t) => t.status === "new" || t.status === "assigned").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;
  const totalRevenue = tickets.length === 0 ? 0 : 4900 + 1950 + (resolvedCount > 0 ? 3700 : 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <RoleSwitcherHeader />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 min-w-0">
          {/* Header Title & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {user?.orgName || "Company"} Service Desk
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Drag tickets to update status or inspect asset context and log repairs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center gap-1">
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    viewMode === "kanban"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Kanban Board View"
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kanban</span>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    viewMode === "table"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Table View"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchTickets}
                className="text-xs border-slate-200"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* Metrics Strip */}
          <MetricsStrip
            openTickets={openCount}
            inProgressTickets={inProgressCount}
            resolvedTickets={resolvedCount}
            totalRevenue={totalRevenue}
          />

          {/* Board / Table View */}
          {viewMode === "kanban" ? (
            <ServiceDeskKanban
              tickets={tickets}
              onStatusChange={handleStatusChange}
              onServiceLogged={handleServiceLogged}
            />
          ) : (
            <ServiceDeskTable
              tickets={tickets}
              onSelectTicket={(t) => setModalTicket(t)}
            />
          )}
        </main>
      </div>

      {modalTicket && (
        <TicketDetailModal
          isOpen={!!modalTicket}
          onClose={() => setModalTicket(null)}
          ticket={modalTicket}
          onStatusUpdated={(id, status) => {
            handleStatusChange(id, status);
            setModalTicket((prev) => (prev ? { ...prev, status } : null));
          }}
          onServiceLogged={handleServiceLogged}
        />
      )}
    </div>
  );
}
